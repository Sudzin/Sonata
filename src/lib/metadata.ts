import * as mm from "music-metadata";
import { FastAverageColor } from "fast-average-color";
import { Track } from "../types";

const fac = new FastAverageColor();

export async function extractMetadata(
  fileHandle: FileSystemFileHandle,
  relativePath: string
): Promise<Track> {
  const file = await fileHandle.getFile();
  
  try {
    // Note: music-metadata can parse File/Blob directly in the browser
    const metadata = await mm.parseBlob(file);
    const format = metadata.format;
    const common = metadata.common;
    
    let coverArtUrl = undefined;
    let dominantColor = undefined;
    
    if (common.picture && common.picture.length > 0) {
      const picture = common.picture[0];
      const blob = new Blob([picture.data], { type: picture.format });
      coverArtUrl = URL.createObjectURL(blob);
      
      try {
        const color = await fac.getColorAsync(coverArtUrl);
        dominantColor = color.hex;
      } catch (err) {
        console.warn("Could not extract dominant color", err);
      }
    }
    
    return {
      id: relativePath,
      title: common.title || file.name.replace(/\.[^/.]+$/, ""), // fallback to filename without ext
      artist: common.artist || "Unknown Artist",
      album: common.album || "Unknown Album",
      genre: common.genre && common.genre.length > 0 ? common.genre[0] : "Unknown",
      duration: format.duration || 0,
      relativePath,
      fileHandle,
      coverArtUrl,
      dominantColor,
    };
  } catch (error) {
    console.error(`Error parsing metadata for ${file.name}:`, error);
    // Fallback if parsing fails
    return {
      id: relativePath,
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Unknown Artist",
      album: "Unknown Album",
      genre: "Unknown",
      duration: 0,
      relativePath,
      fileHandle,
    };
  }
}

// Global revoke utility to avoid memory leaks
export function revokeCoverArt(url: string | undefined) {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
