export interface Track {
  id: string; // Internal ID (usually derived from relative path)
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number; // in seconds
  relativePath?: string;
  filePath?: string; // native path
  fileHandle?: any; // old web file handle
  coverArtUrl?: string; // object URL or base64
  dominantColor?: string; // hex color for chameleon UI
}

export interface PlayStat {
  trackId: string;
  playCount: number;
  totalPlayTime: number; // in seconds
  lastPlayed: number; // timestamp
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
}


declare global {
  interface Window {
    electron?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      selectMusicFolder: () => Promise<string | null>;
      scanMusicFolder: (folderPath: string) => Promise<string[]>;
      extractMetadata: (filePath: string) => Promise<any>;
    };
  }
}
