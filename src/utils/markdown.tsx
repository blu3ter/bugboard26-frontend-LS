import React from 'react';

function renderInlineMarkdown(line: string): React.ReactNode[] {
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  return line.split(tokenRegex).map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={idx} className="inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

/**
 * Converte testo markdown leggero (grassetto, corsivo, inline code e liste)
 * in nodi React sicuri per la sezione descrizione.
 */
export function renderFormattedMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = (keyPrefix: number) => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={`ul-${keyPrefix}`} className="reproduction-list">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const bulletMatch = line.match(/^\s*[-•*]\s+(.*)$/);
    if (bulletMatch) {
      listItems.push(<li key={`li-${index}`}>{renderInlineMarkdown(bulletMatch[1])}</li>);
      return;
    }

    flushList(index);
    if (line.trim() === '') {
      blocks.push(<div key={`spacer-${index}`} className="description-spacer" aria-hidden="true" />);
    } else {
      blocks.push(
        <p key={`p-${index}`} className="description-text">
          {renderInlineMarkdown(line)}
        </p>
      );
    }
  });

  flushList(lines.length);
  return blocks;
}

