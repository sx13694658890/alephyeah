import type { ReactNode } from 'react';

import { MermaidDiagram } from '../documents/MermaidDiagram';

const FILE_PATH_RE = /^[\w./-]+\.(md|markdown|yaml|yml|json|txt)$/i;
const INLINE_FILE_RE = /(`?)([\w./-]+\.(?:md|markdown|yaml|yml|json|txt))\1/g;
const TABLE_ROW_RE = /^\|.+\|$/;
const TABLE_SEPARATOR_RE = /^\|[\s\-:|]+\|$/;
const INLINE_FORMAT_RE = /(\*\*[^*]+\*\*|`[^`]+`)/g;

interface MarkdownPreviewProps {
  content: string;
  basePath?: string;
  onOpenReference?: (referencePath: string) => void;
}

const ReferenceLink = ({
  path,
  onOpen,
  className,
}: {
  path: string;
  onOpen: (path: string) => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={() => onOpen(path)}
    className={
      className ??
      'font-medium text-accent underline decoration-accent/35 underline-offset-2 transition-colors hover:text-accent/80'
    }
  >
    {path}
  </button>
);

const renderFileReferences = (text: string, onOpenReference?: (path: string) => void): ReactNode => {
  if (!onOpenReference || !INLINE_FILE_RE.test(text)) {
    return text;
  }

  INLINE_FILE_RE.lastIndex = 0;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = INLINE_FILE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <ReferenceLink key={`${match.index}-${match[2]}`} path={match[2]} onOpen={onOpenReference} />,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
};

const renderFormattedInline = (
  text: string,
  onOpenReference?: (path: string) => void,
): ReactNode => {
  if (!INLINE_FORMAT_RE.test(text)) {
    return renderFileReferences(text, onOpenReference);
  }

  INLINE_FORMAT_RE.lastIndex = 0;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = INLINE_FORMAT_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderFileReferences(text.slice(lastIndex, match.index), onOpenReference));
    }

    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(
        <strong key={`b-${match.index}`} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('`')) {
      parts.push(
        <code
          key={`c-${match.index}`}
          className="rounded bg-muted/60 px-1 py-0.5 font-mono text-[0.85em] text-foreground/85"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(renderFileReferences(text.slice(lastIndex), onOpenReference));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
};

const parseTableRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

const renderTable = (
  rows: string[],
  key: string,
  onOpenReference?: (path: string) => void,
) => {
  if (rows.length === 0) return null;

  const header = parseTableRow(rows[0]);
  const hasSeparator = rows.length > 1 && TABLE_SEPARATOR_RE.test(rows[1].trim());
  const bodyRows = (hasSeparator ? rows.slice(2) : rows.slice(1)).map(parseTableRow);

  return (
    <div
      key={key}
      className="my-3 overflow-x-auto rounded-xl border border-border/60 bg-muted/10"
    >
      <table className="w-full min-w-[20rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border/70 bg-muted/30">
            {header.map((cell, cellIndex) => (
              <th
                key={`${key}-h-${cellIndex}`}
                className="px-3 py-2 text-left font-medium text-foreground"
              >
                {renderFormattedInline(cell, onOpenReference)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((cells, rowIndex) => (
            <tr
              key={`${key}-r-${rowIndex}`}
              className="border-b border-border/40 last:border-b-0 even:bg-background/40"
            >
              {cells.map((cell, cellIndex) => (
                <td
                  key={`${key}-c-${rowIndex}-${cellIndex}`}
                  className="px-3 py-2 align-top text-foreground/75"
                >
                  {renderFormattedInline(cell, onOpenReference)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const renderLine = (
  line: string,
  index: number,
  onOpenReference?: (path: string) => void,
) => {
  if (line.startsWith('# ')) {
    return (
      <h1 key={index} className="mb-3 mt-6 text-xl font-semibold text-foreground first:mt-0">
        {renderFormattedInline(line.slice(2), onOpenReference)}
      </h1>
    );
  }
  if (line.startsWith('## ')) {
    return (
      <h2 key={index} className="mb-2 mt-5 text-lg font-semibold text-foreground first:mt-0">
        {renderFormattedInline(line.slice(3), onOpenReference)}
      </h2>
    );
  }
  if (line.startsWith('### ')) {
    const heading = line.slice(4).trim();
    if (FILE_PATH_RE.test(heading) && onOpenReference) {
      return (
        <h3 key={index} className="mb-1.5 mt-4 text-base font-medium">
          <ReferenceLink
            path={heading}
            onOpen={onOpenReference}
            className="text-left font-medium text-accent underline decoration-accent/35 underline-offset-2 transition-colors hover:text-accent/80"
          />
        </h3>
      );
    }
    return (
      <h3 key={index} className="mb-1.5 mt-4 text-base font-medium text-foreground">
        {renderFormattedInline(heading, onOpenReference)}
      </h3>
    );
  }
  if (line.trim() === '---') {
    return <hr key={index} className="my-4 border-border" />;
  }
  if (line.startsWith('```')) {
    return null;
  }
  if (line.startsWith('- ')) {
    return (
      <p key={index} className="pl-3 text-foreground/75">
        <span className="mr-2 text-accent">•</span>
        {renderFormattedInline(line.slice(2), onOpenReference)}
      </p>
    );
  }
  if (/^\d+\.\s/.test(line)) {
    const match = line.match(/^(\d+)\.\s(.*)$/);
    if (match) {
      return (
        <p key={index} className="pl-3 text-foreground/75">
          <span className="mr-2 tabular-nums text-accent">{match[1]}.</span>
          {renderFormattedInline(match[2], onOpenReference)}
        </p>
      );
    }
  }
  if (line.trim() === '') {
    return <div key={index} className="h-2" aria-hidden />;
  }
  return (
    <p key={index} className="text-foreground/75">
      {renderFormattedInline(line, onOpenReference)}
    </p>
  );
};

export const MarkdownPreview = ({ content, basePath, onOpenReference }: MarkdownPreviewProps) => {
  const openRef = basePath && onOpenReference
    ? (ref: string) => onOpenReference(ref)
    : undefined;

  const lines = content.split('\n');
  let inCode = false;
  let codeLanguage = '';
  let lastSectionTitle = '';

  const blocks: ReactNode[] = [];
  let codeBuffer: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (!inCode && line.startsWith('## ')) {
      lastSectionTitle = line.slice(3).trim();
    }

    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeBuffer = [];
        codeLanguage = line.slice(3).trim();
      } else {
        inCode = false;
        const source = codeBuffer.join('\n');
        blocks.push(
          codeLanguage === 'mermaid' ? (
            <MermaidDiagram
              key={`code-${index}`}
              source={source}
              title={lastSectionTitle || '流程图'}
            />
          ) : (
            <pre
              key={`code-${index}`}
              className="my-3 overflow-x-auto rounded-xl border border-border/60 bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground/80"
            >
              {source}
            </pre>
          ),
        );
        codeBuffer = [];
        codeLanguage = '';
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    if (TABLE_ROW_RE.test(line.trim())) {
      const tableLines: string[] = [];
      while (index < lines.length && TABLE_ROW_RE.test(lines[index].trim())) {
        tableLines.push(lines[index]);
        index += 1;
      }
      index -= 1;
      blocks.push(renderTable(tableLines, `table-${index}`, openRef));
      continue;
    }

    blocks.push(renderLine(line, index, openRef));
  }

  return <article className="space-y-1 text-sm leading-relaxed">{blocks}</article>;
};
