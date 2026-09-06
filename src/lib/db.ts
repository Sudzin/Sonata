import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Track, PlayStat, Playlist } from "../types";

interface MusicPlayerDB extends DBSchema {
  tracks: {
    key: string;
    value: Track;
    indexes: { "by-artist": string; "by-album": string };
  };
  stats: {
    key: string; // trackId
    value: PlayStat;
  };
  playlists: {
    key: string;
    value: Playlist;
  };
  settings: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<MusicPlayerDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MusicPlayerDB>("music-player-db", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("tracks")) {
          const trackStore = db.createObjectStore("tracks", { keyPath: "id" });
          trackStore.createIndex("by-artist", "artist");
          trackStore.createIndex("by-album", "album");
        }
        if (!db.objectStoreNames.contains("stats")) {
          db.createObjectStore("stats", { keyPath: "trackId" });
        }
        if (!db.objectStoreNames.contains("playlists")) {
          db.createObjectStore("playlists", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings");
        }
      },
    });
  }
  return dbPromise;
}

// Track Operations
export async function getAllTracks(): Promise<Track[]> {
  const db = await getDB();
  return db.getAll("tracks");
}

export async function saveTracks(tracks: Track[]) {
  const db = await getDB();
  const tx = db.transaction("tracks", "readwrite");
  for (const track of tracks) {
    tx.store.put(track);
  }
  await tx.done;
}

export async function clearTracks() {
  const db = await getDB();
  await db.clear("tracks");
}

// Settings (e.g. root directory handle)
export async function saveSetting(key: string, value: any) {
  const db = await getDB();
  await db.put("settings", value, key);
}

export async function getSetting(key: string): Promise<any> {
  const db = await getDB();
  return db.get("settings", key);
}

// Stats Operations
export async function updateTrackStat(trackId: string, durationWatched: number) {
  const db = await getDB();
  const tx = db.transaction("stats", "readwrite");
  const stat = (await tx.store.get(trackId)) || {
    trackId,
    playCount: 0,
    totalPlayTime: 0,
    lastPlayed: 0,
  };
  
  stat.playCount += 1;
  stat.totalPlayTime += durationWatched;
  stat.lastPlayed = Date.now();
  
  await tx.store.put(stat);
  await tx.done;
}

export async function getAllStats(): Promise<PlayStat[]> {
  const db = await getDB();
  return db.getAll("stats");
}

// Playlists
export async function getPlaylists(): Promise<Playlist[]> {
  const db = await getDB();
  return db.getAll("playlists");
}

export async function savePlaylist(playlist: Playlist) {
  const db = await getDB();
  await db.put("playlists", playlist);
}
