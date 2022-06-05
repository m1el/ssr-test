import React from 'react';
export const Page = (props) => {
    return (
       <html>
           <head>
               <title>Test SSR</title>
           </head>
           <body>
               Hello world!
               <div id="root"></div>
           </body>
       </html>
    )
};

export default Page;
