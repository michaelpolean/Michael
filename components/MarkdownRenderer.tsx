import React from 'react';

// Simple regex-based markdown parser for basic travel guide formatting
// This avoids heavy dependencies in a portable code-gen environment.
const parseMarkdown = (text: string) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  let listBuffer: React.ReactNode[] = [];
  let inList = false;

  const flushList = (keyPrefix: string) => {
    if (inList && listBuffer.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}-ul`} className="list-disc pl-5 mb-4 space-y-1 text-slate-700">
          {listBuffer}
        </ul>
      );
      listBuffer = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const key = `line-${index}`;

    // Headings
    if (line.startsWith('### ')) {
      flushList(key);
      elements.push(<h3 key={key} className="text-xl font-bold text-slate-800 mt-6 mb-3">{line.replace('### ', '')}</h3>);
    } else if (line.startsWith('## ')) {
      flushList(key);
      elements.push(<h2 key={key} className="text-2xl font-serif font-bold text-brand-700 mt-8 mb-4 border-b border-slate-200 pb-2">{line.replace('## ', '')}</h2>);
    } else if (line.startsWith('# ')) {
      flushList(key);
      elements.push(<h1 key={key} className="text-3xl font-serif font-bold text-slate-900 mb-6">{line.replace('# ', '')}</h1>);
    } 
    // Lists
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      inList = true;
      const content = line.trim().substring(2);
      // Basic bold parsing inside list items
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const listContent = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      
      listBuffer.push(<li key={key} className="leading-relaxed">{listContent}</li>);
    }
    // Empty lines
    else if (line.trim() === '') {
       flushList(key);
       // Optional: elements.push(<div key={key} className="h-2"></div>); 
    }
    // Regular paragraphs
    else {
      flushList(key);
       // Basic bold parsing inside paragraphs
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const pContent = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      elements.push(<p key={key} className="mb-3 text-slate-700 leading-relaxed">{pContent}</p>);
    }
  });

  flushList('end');
  return elements;
};

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="font-sans">
      {parseMarkdown(content)}
    </div>
  );
};