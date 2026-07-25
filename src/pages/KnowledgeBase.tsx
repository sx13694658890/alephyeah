import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  FileText,
  Folder,
  FolderOpen,
  Hash,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import { DocumentModal } from '../components/documents/DocumentModal';
import type { ObsidianNote } from '../docs/obsidian';
import type { ProjectDocument } from '../docs/types';
import { useKnowledgeBase, useKnowledgeBaseSearch } from '../hooks/useKnowledgeBase';
import { usePreferences } from '../context/PreferencesContext';
import { useTiltHover } from '../hooks/useTiltHover';
import { cn } from '../lib/cn';

const noteToProjectDoc = (note: ObsidianNote): ProjectDocument => ({
  id: note.id,
  title: note.title,
  description: note.description,
  date: note.date,
  category: note.category,
  content: '',
});

const fetchNoteContent = async (notePath: string): Promise<string> => {
  const encoded = notePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  const res = await fetch(`/knowledge-base/notes/${encoded}`);
  if (!res.ok) throw new Error(`Failed to load note: HTTP ${res.status}`);
  return res.text();
};

const KnowledgeCard = ({
  note,
  onClick,
}: {
  note: ObsidianNote;
  onClick: () => void;
}) => {
  const { ref, onMouseMove, onMouseLeave } = useTiltHover<HTMLDivElement>({
    maxTilt: 3,
    scale: 1.01,
  });

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn(
        'group cursor-pointer rounded-xl border border-border bg-background p-5',
        'transition-[border-color,box-shadow,transform] duration-300 ease-out',
        'hover:border-accent/25 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
      )}
    >
      <div className="mb-1 flex items-center gap-3">
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent transition-colors duration-300 group-hover:bg-accent/15">
          {note.category}
        </span>
        {note.date ? <span className="text-xs text-foreground/40">{note.date}</span> : null}
      </div>
      <h3 className="mb-1.5 text-lg font-medium text-foreground transition-colors duration-300 group-hover:text-accent">
        {note.title}
      </h3>
      {note.description ? (
        <p className="mb-2 line-clamp-2 text-sm leading-relaxed text-foreground/60">
          {note.description}
        </p>
      ) : null}
      {note.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md bg-accent/5 px-2 py-0.5 text-xs text-foreground/50"
            >
              <Hash className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const SidebarSection = ({
  label,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground/60 transition-colors hover:bg-muted/50"
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">{label}</span>
        <span className="text-[10px]">{open ? '▾' : '▸'}</span>
      </button>
      {open ? <div className="ml-1 space-y-0.5">{children}</div> : null}
    </div>
  );
};

const KnowledgeTree = ({
  tree,
  depth,
  selectedDir,
  onSelect,
}: {
  tree: { name: string; path: string; noteCount: number; children: any[] };
  depth: number;
  selectedDir: string | null;
  onSelect: (path: string | null) => void;
}) => {
  const isRoot = depth === 0;
  const isSelected = isRoot ? selectedDir === null : selectedDir === tree.path;

  return (
    <div>
      {!isRoot ? (
        <button
          type="button"
          onClick={() => onSelect(isSelected ? null : tree.path)}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors',
            isSelected
              ? 'bg-accent/10 font-medium text-accent'
              : 'text-foreground/60 hover:bg-muted/50 hover:text-foreground/80',
          )}
        >
          {isSelected ? (
            <FolderOpen className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <Folder className="h-3.5 w-3.5 shrink-0" />
          )}
          <span className="flex-1 truncate">{tree.name}</span>
          <span className="shrink-0 text-[10px] text-foreground/40">{tree.noteCount}</span>
        </button>
      ) : null}
      {tree.children.length > 0 ? (
        <div className={cn(isRoot ? '' : 'ml-3 border-l border-border/40 pl-2')}>
          {tree.children.map((child, i) => (
            <KnowledgeTree
              key={child.path || i}
              tree={child}
              depth={depth + 1}
              selectedDir={selectedDir}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const TagBadge = ({
  tag,
  selected,
  onClick,
}: {
  tag: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors',
      selected
        ? 'bg-accent/15 text-accent'
        : 'bg-muted/50 text-foreground/50 hover:bg-muted hover:text-foreground/70',
    )}
  >
    <Hash className="h-3 w-3" />
    {tag}
  </button>
);

export const KnowledgeBase = () => {
  const { locale } = usePreferences();
  const isZh = locale === 'zh';
  const { manifest, notes, loading, error } = useKnowledgeBase();
  const {
    query,
    setQuery,
    selectedTags,
    toggleTag,
    selectedCategory,
    setSelectedCategory,
    selectedDir,
    setSelectedDir,
    allTags,
    allCategories,
    filteredNotes,
    resetFilters,
    hasFilters,
  } = useKnowledgeBaseSearch(notes);

  const [activeNote, setActiveNote] = useState<ObsidianNote | null>(null);
  const [docContent, setDocContent] = useState<string>('');
  const [contentLoading, setContentLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fetchSeq = useRef(0);

  const openNote = useCallback(async (note: ObsidianNote) => {
    const seq = ++fetchSeq.current;
    setActiveNote(note);
    setDocContent('');
    setContentLoading(true);
    try {
      const content = await fetchNoteContent(note.notePath);
      if (fetchSeq.current === seq) setDocContent(content);
    } catch {
      if (fetchSeq.current === seq) {
        setDocContent(isZh ? '加载笔记内容失败。' : 'Failed to load note content.');
      }
    } finally {
      if (fetchSeq.current === seq) setContentLoading(false);
    }
  }, [isZh]);

  const closeNote = useCallback(() => {
    fetchSeq.current += 1;
    setActiveNote(null);
    setDocContent('');
    setContentLoading(false);
  }, []);

  const displayDoc = useMemo(
    () =>
      activeNote
        ? { ...noteToProjectDoc(activeNote), content: docContent }
        : null,
    [activeNote, docContent],
  );

  useEffect(() => {
    // 筛选变化时滚回列表顶部，避免「点了没变化」的错觉
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedDir, selectedCategory, selectedTags, query]);

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-3 text-3xl font-light text-foreground">
            {isZh ? '知识库' : 'Knowledge Base'}
          </h1>
          <p className="max-w-xl text-foreground/60">
            {isZh
              ? `Obsidian 笔记仓库的在线浏览。共 ${notes.length} 篇笔记。`
              : `Browse the Obsidian vault online. ${notes.length} notes.`}
          </p>
        </div>
        {notes.length > 0 ? (
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              'flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition-colors sm:hidden',
              sidebarOpen
                ? 'bg-accent/15 text-accent'
                : 'bg-muted/60 text-foreground/50 hover:bg-muted hover:text-foreground/70',
            )}
          >
            <Folder className="h-3.5 w-3.5" />
            {isZh ? '目录' : 'Dirs'}
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-foreground/40">
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
            <span className="text-sm">{isZh ? '加载知识库中…' : 'Loading knowledge base…'}</span>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-background px-6 py-10 text-center">
          <BookOpen className="h-8 w-8 text-foreground/30" />
          <p className="text-sm text-foreground/50">
            {isZh ? (
              <>
                知识库加载失败。请先运行{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">pnpm sync:obsidian</code>{' '}
                同步笔记。
              </>
            ) : (
              <>
                Failed to load. Run{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">pnpm sync:obsidian</code>{' '}
                first.
              </>
            )}
          </p>
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="flex gap-6">
          {manifest ? (
            <aside className="hidden w-52 shrink-0 sm:block">
              <div className="sticky top-28 space-y-3">
                <SidebarSection label={isZh ? '目录' : 'Folders'} icon={Folder} defaultOpen>
                  <button
                    type="button"
                    onClick={() => setSelectedDir(null)}
                    className={cn(
                      'mb-0.5 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors',
                      selectedDir === null
                        ? 'bg-accent/10 font-medium text-accent'
                        : 'text-foreground/60 hover:bg-muted/50',
                    )}
                  >
                    <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1">{isZh ? '全部笔记' : 'All notes'}</span>
                    <span className="text-[10px] text-foreground/40">{notes.length}</span>
                  </button>
                  <KnowledgeTree
                    tree={manifest.dirTree}
                    depth={0}
                    selectedDir={selectedDir}
                    onSelect={setSelectedDir}
                  />
                </SidebarSection>

                <SidebarSection label={isZh ? '分类' : 'Categories'} icon={FileText}>
                  <div className="space-y-0.5">
                    {selectedCategory ? (
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(null)}
                        className="w-full rounded-lg px-2.5 py-1 text-left text-xs text-accent/80 transition-colors hover:bg-accent/5"
                      >
                        {isZh ? '全部分类 ✕' : 'Clear category ✕'}
                      </button>
                    ) : null}
                    {allCategories
                      .filter((c) => c !== (selectedCategory ?? ''))
                      .slice(0, 10)
                      .map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={cn(
                            'w-full rounded-lg px-2.5 py-1 text-left text-xs transition-colors',
                            selectedCategory === cat
                              ? 'bg-accent/10 font-medium text-accent'
                              : 'text-foreground/60 hover:bg-muted/50 hover:text-foreground/80',
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                  </div>
                </SidebarSection>
              </div>
            </aside>
          ) : null}

          {sidebarOpen && manifest ? (
            <div className="fixed inset-0 z-40 sm:hidden" role="presentation">
              <button
                type="button"
                className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
                aria-label={isZh ? '关闭目录' : 'Close folders'}
              />
              <div className="absolute left-0 top-0 z-10 flex h-full w-60 flex-col border-r border-border bg-background p-4 pt-20 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground/60">
                    {isZh ? '目录' : 'Folders'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/40 hover:bg-muted"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDir(null);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    'mb-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs',
                    selectedDir === null ? 'bg-accent/10 font-medium text-accent' : 'text-foreground/60',
                  )}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  {isZh ? '全部笔记' : 'All notes'}
                </button>
                <KnowledgeTree
                  tree={manifest.dirTree}
                  depth={0}
                  selectedDir={selectedDir}
                  onSelect={(path) => {
                    setSelectedDir(path);
                    setSidebarOpen(false);
                  }}
                />
              </div>
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            <div className="mb-6 space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isZh ? '搜索笔记标题、内容或标签…' : 'Search title, description, or tags…'}
                  className={cn(
                    'w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-8 text-sm text-foreground placeholder:text-foreground/30',
                    'transition-colors focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/10',
                  )}
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-foreground/30 hover:text-foreground/60"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              {allTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {allTags.slice(0, 24).map((tag) => (
                    <TagBadge
                      key={tag}
                      tag={tag}
                      selected={selectedTags.includes(tag)}
                      onClick={() => toggleTag(tag)}
                    />
                  ))}
                  {allTags.length > 24 ? (
                    <span className="inline-flex items-center text-[10px] text-foreground/30">
                      +{allTags.length - 24}
                    </span>
                  ) : null}
                </div>
              ) : null}

              {hasFilters ? (
                <div className="flex items-center gap-2 text-xs text-foreground/40">
                  <span>
                    {isZh
                      ? `筛选结果：${filteredNotes.length} / ${notes.length}`
                      : `${filteredNotes.length} / ${notes.length} matched`}
                  </span>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-md px-2 py-0.5 text-accent transition-colors hover:bg-accent/10"
                  >
                    {isZh ? '重置筛选' : 'Reset'}
                  </button>
                </div>
              ) : null}
            </div>

            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background py-12 text-center">
                <FileText className="h-8 w-8 text-foreground/20" />
                <p className="text-sm text-foreground/40">
                  {isZh ? '没有匹配的笔记' : 'No matching notes'}
                </p>
                {hasFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs text-accent transition-colors hover:underline"
                  >
                    {isZh ? '清除全部筛选条件' : 'Clear all filters'}
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredNotes.map((note) => (
                  <KnowledgeCard
                    key={note.id}
                    note={note}
                    onClick={() => void openNote(note)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      <DocumentModal
        open={Boolean(activeNote)}
        doc={displayDoc}
        loading={contentLoading}
        onClose={closeNote}
      />
    </>
  );
};
