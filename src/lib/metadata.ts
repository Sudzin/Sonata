import { FastAverageColor } from "fast-average-color";
import { Track } from "../types";

const fac = new FastAverageColor();

export async function extractMetadata(filePath: string): Promise<Track> {
  try {
    const metadata = await window.electron!.extractMetadata(filePath);
    
    let dominantColor = undefined;
    if (metadata.coverArtUrl) {
      try {
        const color = await fac.getColorAsync(metadata.coverArtUrl);
        dominantColor = color.hex;
      } catch (err) {
        console.warn("Could not extract dominant color", err);
      }
    }
    
    return {
      ...metadata,
      dominantColor,
      filePath
    };
  } catch (error) {
    console.error(`Error parsing metadata for ${filePath}:`, error);
    const fileName = filePath.split(/[/\\]/).pop() || "Unknown";
    return {
      id: filePath,
      title: fileName.replace(/\.[^/.]+$/, ""),
      artist: "Unknown Artist",
      album: "Unknown Album",
      genre: "Unknown",
      duration: 0,
      filePath,
    };
  }
}

// Global revoke utility to avoid memory leaks
export function revokeCoverArt(url: string | undefined) {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
