import { execSync } from "node:child_process";
import path from "node:path";
import fs from "fs-extra";
import type { DownloadConfig, TrackInfo } from "../types/index";

export async function downloadAudio(
	track: TrackInfo,
	config: DownloadConfig,
): Promise<string> {
	if (!track.filename || !track.filePath) {
		throw new Error("Incomplete track information");
	}

	const outputPath = path.join(config.downloadDir, track.filename);
	const tempPath = outputPath.replace(".mp3", ".%(ext)s");

	try {
		const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${tempPath}" "${track.filePath}"`;
		execSync(command, { stdio: "pipe" });

		// The file might have a different extension, let's find it
		const dir = path.dirname(outputPath);
		const baseName = path.basename(outputPath, ".mp3");
		const files = fs.readdirSync(dir).filter((f) => f.startsWith(baseName));

		if (files.length > 0) {
			const firstFile = files[0];
			if (firstFile) {
				const actualPath = path.join(dir, firstFile);
				if (actualPath !== outputPath) {
					fs.renameSync(actualPath, outputPath);
				}
			}
		}

		return outputPath;
	} catch (error) {
		throw new Error(`Audio download failed: ${error}`);
	}
}
