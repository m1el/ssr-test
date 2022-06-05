import React from 'react';
import { createRoot } from 'react-dom';

const App = () => <div>Hello world from react!</div>;
const target = document.getElementById('root');
const root = createRoot(target);
root.render(<App />);
