import React from 'react';
import Script from 'src/script';
export const Page = ({path}) => {
    return (
       <html>
           <head>
               <Script async src="dynamic/test.tsx" />
               <title>foobar</title>
           </head>
           <body>
               <a href="send_thing.html">Send something to me!</a>
               Hello world from static!
               <div id="root"></div>
           </body>
       </html>
    )
};

export default Page;
