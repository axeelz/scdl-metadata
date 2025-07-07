import { execSync } from "node:child_process";
import type { TrackInfo, YtDlpOutput } from "../types/index";
import { sanitizeFilename } from "../utils/filesystem";

export async function getTrackInfo(url: string): Promise<TrackInfo[]> {
	const command = `yt-dlp -J "${url}"`;
	const output = execSync(command, { encoding: "utf8" });
	const data: YtDlpOutput = JSON.parse(output);

	const tracks: TrackInfo[] = [];

	if (data.entries) {
		// Playlist
		for (const entry of data.entries) {
			tracks.push({
				title: entry.title || "Unknown Title",
				artist: entry.uploader || "Unknown Artist",
				album: entry.playlist || undefined,
				year: entry.upload_date ? entry.upload_date.slice(0, 4) : undefined,
				coverUrl: entry.thumbnail,
				filename: sanitizeFilename(
					`${entry.uploader || "Unknown"} - ${entry.title || "Unknown"}.mp3`,
				),
				filePath: entry.webpage_url || url,
			});
		}
	} else {
		// Single track
		tracks.push({
			title: data.title || "Unknown Title",
			artist: data.uploader || "Unknown Artist",
			year: data.upload_date ? data.upload_date.slice(0, 4) : undefined,
			coverUrl: data.thumbnail,
			filename: sanitizeFilename(
				`${data.uploader || "Unknown"} - ${data.title || "Unknown"}.mp3`,
			),
			filePath: url,
		});
	}

	return tracks;
}
