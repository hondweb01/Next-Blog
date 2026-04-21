import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism/index.js';

const components = {
  code(props) {
    const { className, children, node, ...rest } = props;
    const match = /language-(\w+)/.exec(className || "");
    
    return match ? (
      React.createElement(SyntaxHighlighter, {
        style: vscDarkPlus,
        language: match[1],
        PreTag: 'div',
      }, String(children).replace(/\n$/, ""))
    ) : (
      React.createElement('code', { className, ...rest }, children)
    );
  }
};

const md = `\`\`\`javascript\nconsole.log("アラート")\n\`\`\``;

const html = ReactDOMServer.renderToString(
  React.createElement(ReactMarkdown, {
    remarkPlugins: [remarkGfm, remarkBreaks],
    components
  }, md)
);

console.log('HTML Output:');
console.log(html);
