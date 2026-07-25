import { useCallback, useEffect, useMemo, useState } from 'react';
import type { KnowledgeBaseManifest, ObsidianNote } from '../docs/obsidian';

const INDEX_PATH = '/knowledge-base/index.json';

export function useKnowledgeBase() {
  const [manifest, setManifest] = useState<KnowledgeBaseManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchIndex = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(INDEX_PATH);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: KnowledgeBaseManifest = await res.json();
        if (!cancelled) {
          setManifest(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load knowledge base');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchIndex();
    return () => { cancelled = true; };
  }, []);

  const notes = useMemo(() => manifest?.notes ?? [], [manifest]);

  return { manifest, notes, loading, error };
}

export function useKnowledgeBaseSearch(notes: ObsidianNote[]) {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDir, setSelectedDir] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const note of notes) {
      for (const tag of note.tags) tagSet.add(tag);
    }
    return [...tagSet].sort((a, b) => a.localeCompare(b, 'zh'));
  }, [notes]);

  const allCategories = useMemo(() => {
    const catSet = new Set(notes.map((n) => n.category));
    return [...catSet].sort((a, b) => a.localeCompare(b, 'zh'));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    let result = notes;

    // 目录筛选
    if (selectedDir) {
      result = result.filter((n) => n.dirPath === selectedDir || n.dirPath.startsWith(selectedDir + '/'));
    }

    // 分类筛选
    if (selectedCategory) {
      result = result.filter((n) => n.category === selectedCategory);
    }

    // 标签筛选
    if (selectedTags.length > 0) {
      result = result.filter((n) => selectedTags.some((tag) => n.tags.includes(tag)));
    }

    // 搜索
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [notes, query, selectedTags, selectedCategory, selectedDir]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const resetFilters = useCallback(() => {
    setQuery('');
    setSelectedTags([]);
    setSelectedCategory(null);
    setSelectedDir(null);
  }, []);

  return {
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
    hasFilters: query.trim().length > 0 || selectedTags.length > 0 || selectedCategory !== null || selectedDir !== null,
  };
}
