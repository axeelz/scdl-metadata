import type { TrackInfo, YtDlpOutput } from "../types/index";

export async function getTrackInfo(url: string): Promise<TrackInfo[]> {
  const proc = Bun.spawn(["yt-dlp", "-J", url], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(`Failed to fetch track info: ${await proc.stderr.text()}`);
  }

  const data = (await proc.stdout.json()) as YtDlpOutput;
  const tracks: TrackInfo[] = [];

  if (data.entries) {
    for (const entry of data.entries) {
      tracks.push({
        title: entry.title || "Unknown Title",
        artist: entry.uploader || "Unknown Artist",
        album: entry.playlist,
        year: entry.upload_date ? entry.upload_date.slice(0, 4) : undefined,
        coverUrl: entry.thumbnail,
        filePath: entry.webpage_url || url,
      });
    }
  } else {
    tracks.push({
      title: data.title || "Unknown Title",
      artist: data.uploader || "Unknown Artist",
      year: data.upload_date ? data.upload_date.slice(0, 4) : undefined,
      coverUrl: data.thumbnail,
      filePath: url,
    });
  }

  return tracks;
}
