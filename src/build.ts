import fs from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';
import React from 'react';
import spack from '@swc/core/spack'
import spackTypes from '@swc/core/types';
import crypto from "crypto";
import ReactDOMServer from 'react-dom/server';
import { build as esbuild } from 'esbuild/lib/main';
import { ScriptContext } from './script'

//const esbuild = buildFactory();

interface IRouteProps {
    relPath: string
}

interface IRoutePage {
    default: (IRouteProps) => React.ReactElement;
    getStaticPaths?: () => Promise<Array<string>>;
}

const streamPromise = (stream: fs.WriteStream): Promise<void> =>
    new Promise((resolve, reject) => {
        stream.on('finish', () => resolve());
        stream.on('error', reject);
    });

interface DirEntry {
    root: string;
    files: Array<string>;
    dirs: Array<string>;
}

const walkDir = function* (root: string): Iterable<DirEntry> {
    const dirsAndFiles = fs.readdirSync(root);
    const files = [];
    const dirs = [];
    for (const file of dirsAndFiles) {
        const isDir = fs.statSync(root + '/' + file).isDirectory();
        (isDir ? dirs : files).push(file);
    }
    for (const dir of dirs) {
        yield* walkDir(root + '/' + dir);
    }
    yield { root, dirs, files };
};

const ROUTES_DIR = 'routes';
const DIST_DIR = 'dist';

const DYNAMIC_DIR = 'src/dynamic';
const DIST_JS_DIR = DIST_DIR + '/js';
const TSX_RE = /\.tsx?$/;
const build = async () => {
    const dynamicMap = new Map();
    for (const { root, files } of walkDir(DYNAMIC_DIR)) {
        let relPath = path.relative(DYNAMIC_DIR, root);
        if (relPath) relPath += '/';
        const outDir = path.join(DIST_JS_DIR, relPath);
        fs.mkdirSync(outDir, { recursive: true });
        for (const file of files) {
            if (!file.match(TSX_RE)) { continue; }
            const fileFull = path.join(root, file);
            const rand = crypto.randomBytes(8).toString("hex");
            const oname = file.replace(TSX_RE, `-${rand}.js`);
            const outfile = path.join(DIST_JS_DIR, relPath, oname);
            dynamicMap.set('dynamic/' + relPath + file, 'js/' + relPath + oname);
            await esbuild({
                bundle: true,
                outfile,
                sourcemap: true,
                minify: true,
                entryPoints: [fileFull],
            });
        }
        console.log(dynamicMap);
    }

    for (const { root, files } of walkDir(ROUTES_DIR)) {
        let relPath = path.relative(ROUTES_DIR, root);
        if (relPath) relPath += '/';
        const outDir = path.join(DIST_DIR, relPath);
        fs.mkdirSync(outDir, { recursive: true });
        for (const file of files) {
            if (!file.endsWith('.tsx')) { continue; }
            const baseName = file.replace(/\.tsx$/, '');
            const inFile = path.relative(__dirname, root) + '/' + baseName;
            const { default: render, getStaticPaths } = (await import (inFile) as unknown as IRoutePage);
            const paths = getStaticPaths && await getStaticPaths() || ['/' + relPath + baseName];
            for (const staticPath of paths) {
                const outFile = path.join(DIST_DIR, staticPath + '.html');
                console.log(`building ${inFile} -> ${outFile}`);
                const props = { path: staticPath };
                const element = React.createElement(ScriptContext.Provider, { value: dynamicMap }, render(props));
                const stream = ReactDOMServer.renderToStaticNodeStream(element);
                const out = fs.createWriteStream(outFile);
                out.write('<!doctype html>\n');
                await streamPromise(stream.pipe(out));
            }
        }
    }
};

build();
