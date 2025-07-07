import path from "node:path";
import axios from "axios";
import fs from "fs-extra";
import type { DownloadConfig, TrackInfo } from "../types/index";

export async function downloadCover(
	track: TrackInfo,
	config: DownloadConfig,
): Promise<string | null> {
	if (!track.coverUrl) return null;

	try {
		const highResUrl = track.coverUrl.replace(/large|t500x500/, "t1080x1080");

		const response = await axios.get(highResUrl, {
			responseType: "arraybuffer",
			timeout: 10000,
		});

		const coverPath = path.join(config.tempDir, `cover_${Date.now()}.jpg`);
		await fs.writeFile(coverPath, response.data);

		return coverPath;
	} catch (error) {
		console.warn("Unable to download cover:", error);
		return null;
	}
}
