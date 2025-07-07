#!/usr/bin/env bun

import { cancel, intro, isCancel, outro, text } from "@clack/prompts";
import { SoundCloudDownloader } from "./services/soundcloud-downloader";
import { checkDependencies } from "./utils/dependencies";

async function main(): Promise<void> {
	console.clear();
	intro("🎵 SoundCloud Downloader with metadata");

	if (!checkDependencies()) {
		outro("❌ yt-dlp is required. Install it with: brew install yt-dlp");
		process.exit(1);
	}

	const url = await text({
		message: "SoundCloud URL (playlist or track):",
		placeholder: "https://soundcloud.com/...",
		validate: (value) => {
			if (!value) return "URL required";
			if (!value.includes("soundcloud.com")) return "Invalid SoundCloud URL";
			return undefined;
		},
	});

	if (isCancel(url)) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	try {
		const downloader = new SoundCloudDownloader();
		const trackCount = await downloader.processUrl(url as string);

		outro(
			`🎉 Download completed! ${trackCount} file(s) saved in ${downloader.getDownloadDir()}`,
		);
	} catch (error) {
		outro(`❌ Error: ${error}`);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
