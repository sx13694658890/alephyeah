import type { ReactNode } from 'react';

const FILE_PATH_RE = /^[\w./-]+\.(md|markdown|yaml|yml|json|txt)$/i;
const INLINE_FILE_RE = /(`?)([\w./-]+\.(?:md|markdown|yaml|yml|json|txt))\1/g;

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

const renderInline = (text: string, onOpenReference?: (path: string) => void): ReactNode => {
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

const renderLine = (
  line: string,
  index: number,
  onOpenReference?: (path: string) => void,
) => {
  if (line.startsWith('# ')) {
    return (
      <h1 key={index} className="mb-3 mt-6 text-xl font-semibold text-foreground first:mt-0">
        {renderInline(line.slice(2), onOpenReference)}
      </h1>
    );
  }
  if (line.startsWith('## ')) {
    return (
      <h2 key={index} className="mb-2 mt-5 text-lg font-semibold text-foreground first:mt-0">
        {renderInline(line.slice(3), onOpenReference)}
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
        {renderInline(heading, onOpenReference)}
      </h3>
    );
  }
  if (line.trim() === '---') {
    return <hr key={index} className="my-4 border-border" />;
  }
  if (line.startsWith('```')) {
    return null;
  }
  if (line.startsWith('|')) {
    return (
      <p key={index} className="font-mono text-xs text-foreground/70">
        {line}
      </p>
    );
  }
  if (line.startsWith('- ')) {
    return (
      <p key={index} className="pl-3 text-foreground/75">
        <span className="mr-2 text-accent">•</span>
        {renderInline(line.slice(2), onOpenReference)}
      </p>
    );
  }
  if (line.trim() === '') {
    return <div key={index} className="h-2" aria-hidden />;
  }
  return (
    <p key={index} className="text-foreground/75">
      {renderInline(line, onOpenReference)}
    </p>
  );
};

export const MarkdownPreview = ({ content, basePath, onOpenReference }: MarkdownPreviewProps) => {
  const openRef = basePath && onOpenReference
    ? (ref: string) => onOpenReference(ref)
    : undefined;

  const lines = content.split('\n');
  let inCode = false;

  const blocks: ReactNode[] = [];
  let codeBuffer: string[] = [];

  lines.forEach((line, index) => {
    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeBuffer = [];
      } else {
        inCode = false;
        blocks.push(
          <pre
            key={`code-${index}`}
            className="my-3 overflow-x-auto rounded-xl border border-border/60 bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground/80"
          >
            {codeBuffer.join('\n')}
          </pre>,
        );
        codeBuffer = [];
      }
      return;
    }

    if (inCode) {
      codeBuffer.push(line);
      return;
    }

    blocks.push(renderLine(line, index, openRef));
  });

  return <article className="space-y-1 text-sm leading-relaxed">{blocks}</article>;
};
