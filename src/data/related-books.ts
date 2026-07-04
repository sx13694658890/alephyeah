export interface RelatedBook {
  id: string;
  titleKey: string;
  src: string;
  fileName: string;
}

export const relatedBooks: RelatedBook[] = [
  {
    id: 'hermes-agent',
    titleKey: 'home.bookHermesAgent',
    src: '/books/Hermes-Agent橙皮书2.0-v260607.pdf',
    fileName: 'Hermes-Agent橙皮书2.0-v260607.pdf',
  },
];
