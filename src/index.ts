#!/usr/bin/env bun

import { intro, outro } from "@clack/prompts";

import { downloadDir, processUrl } from "./services/soundcloud-downloader";
import { checkDependencies } from "./utils/dependencies";

const url = process.argv[2];

if (!url) {
  console.error("Usage: scdl <url>");
  process.exit(1);
}

console.clear();
intro("scdl — download anything with metadata");

if (!checkDependencies()) {
  outro("yt-dlp is required. Install it with: brew install yt-dlp");
  process.exit(1);
}

try {
  const trackCount = await processUrl(url);
  outro(`Done! ${trackCount} file(s) saved in ${downloadDir}`);
} catch (error) {
  outro(`Error: ${error}`);
  process.exit(1);
}
