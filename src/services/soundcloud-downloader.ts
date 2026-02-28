import { log, spinner } from "@clack/prompts";
import { existsSync, mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import type { CommonAlbumMetadata, TrackInfo, UserMetadata } from "../types/index";

import { promptCommonAlbumMetadata, promptForAlbumMode, promptMetadata } from "../prompts/metadata";
import { sanitizeFilename } from "../utils/filesystem";
import { downloadAudio } from "./audio-downloader";
import { editMetadata } from "./metadata-editor";
import { getTrackInfo } from "./track-info";

export const downloadDir = path.join(os.homedir(), "Downloads", "SoundCloud");
mkdirSync(downloadDir, { recursive: true });

export async function processUrl(url: string): Promise<number> {
  const s = spinner();
  s.start("Fetching information...");
  const tracks = await getTrackInfo(url);
  s.stop("Information retrieved");

  if (tracks.length === 0) {
    throw new Error("No tracks found");
  }

  if (tracks.length > 1) {
    const useAlbumMode = await promptForAlbumMode();
    if (useAlbumMode) {
      await processAsAlbum(tracks);
    } else {
      await processIndividually(tracks);
    }
  } else {
    await processIndividually(tracks);
  }

  return tracks.length;
}

async function downloadAndTag(track: TrackInfo, metadata: UserMetadata): Promise<void> {
  const filename = sanitizeFilename(`${metadata.artist} - ${metadata.title}.mp3`);
  const outputPath = path.join(downloadDir, filename);

  if (!outputPath.startsWith(downloadDir + path.sep)) {
    throw new Error(`Refusing to write outside download directory: ${outputPath}`);
  }

  const s = spinner();
  s.start("Downloading audio...");
  await downloadAudio(track.filePath, outputPath);
  s.stop("Audio downloaded");

  if (!existsSync(outputPath)) {
    throw new Error("Audio file was not created");
  }

  s.start("Embedding metadata...");
  await editMetadata(outputPath, metadata, track.coverUrl);
  s.stop("Metadata updated");

  log.info(`${filename} saved`);
}

async function processTrack(
  track: TrackInfo,
  commonMetadata?: CommonAlbumMetadata,
  trackNumber?: number,
  totalTracks?: number,
): Promise<void> {
  const artistName = commonMetadata?.artist ?? track.artist;
  log.step(`${track.title} — ${artistName}`);

  const metadata = await promptMetadata(track, commonMetadata, trackNumber, totalTracks);
  try {
    await downloadAndTag(track, metadata);
  } catch (error) {
    console.error(`Error for "${track.title}": ${error}`);
  }
}

async function processIndividually(tracks: TrackInfo[]): Promise<void> {
  for (const [i, track] of tracks.entries()) {
    log.step(`Track ${i + 1}/${tracks.length}`);
    await processTrack(track);
  }
}

async function processAsAlbum(tracks: TrackInfo[]): Promise<void> {
  const firstTrack = tracks[0];
  if (!firstTrack) throw new Error("No tracks found in playlist");

  const commonMetadata = await promptCommonAlbumMetadata(firstTrack);
  log.step(`Album: ${commonMetadata.album} — ${commonMetadata.artist}`);

  for (const [i, track] of tracks.entries()) {
    log.step(`Track ${i + 1}/${tracks.length}`);
    await processTrack(track, commonMetadata, i + 1, tracks.length);
  }
}
