export interface MusicTrack {
  title: string;
  artist: string;
  coverSrc: string;
  audioSrc: string;
}

export const defaultTrack: MusicTrack = {
  title: 'Aruarian Dance',
  artist: 'Nujabes',
  coverSrc: '/assets/aruarian-dance.webp',
  audioSrc: '/assets/aruarian-dance.mp3',
};
