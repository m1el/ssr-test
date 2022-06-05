import React from 'react';
import Script from 'src/script';
export const Page = ({path}) => {
    return (
       <html>
           <head>
               <Script async src="dynamic/test.tsx" />
               <title>Test SSR path={path}</title>
           </head>
           <body>
               Hello world from static!
               <div id="root"></div>
           </body>
       </html>
    )
};

export default Page;
export const getStaticPaths = async () => {
    return [
        '/hello',
        '/world',
    ]
};
