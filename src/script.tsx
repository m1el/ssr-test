import React from 'react';

export const Script = (params) => {
    const maps = React.useContext(ScriptContext);
    const src = maps.get(params.src);
    return <script {...params} src={src} />;
};

export const ScriptContext = React.createContext(new Map());

export default Script;
