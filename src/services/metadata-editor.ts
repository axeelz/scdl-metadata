import NodeID3 from "node-id3";

import type { UserMetadata } from "../types/index";

export async function editMetadata(
  audioPath: string,
  metadata: UserMetadata,
  coverUrl: string | undefined,
): Promise<void> {
  const tags: NodeID3.Tags = {
    title: metadata.title,
    artist: metadata.artist,
    album: metadata.album || metadata.title,
    year: metadata.releaseDate,
    genre: metadata.genre,
    performerInfo: metadata.artist,
    ...(metadata.producer && { composer: metadata.producer }),
    ...(metadata.trackNumber && { trackNumber: metadata.trackNumber }),
  };

  if (coverUrl) {
    try {
      const res = await fetch(coverUrl, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        const mime = res.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
        tags.image = {
          mime,
          type: { id: 3, name: "front cover" },
          description: "Cover",
          imageBuffer: Buffer.from(await res.arrayBuffer()),
        };
      }
    } catch {
      console.warn("Unable to download cover");
    }
  }

  const success = NodeID3.write(tags, audioPath);
  if (!success) {
    throw new Error("Unable to write metadata");
  }
}
