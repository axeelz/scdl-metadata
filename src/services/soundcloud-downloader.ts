import os from "node:os";
import path from "node:path";
import { log, spinner } from "@clack/prompts";
import fs from "fs-extra";
import {
	promptCommonAlbumMetadata,
	promptForAlbumMode,
	promptMetadata,
} from "../prompts/metadata";
import type {
	CommonAlbumMetadata,
	DownloadConfig,
	TrackInfo,
	UserMetadata,
} from "../types/index";
import { downloadAudio } from "./audio-downloader";
import { downloadCover } from "./cover-downloader";
import { editMetadata } from "./metadata-editor";
import { getTrackInfo } from "./track-info";

export class SoundCloudDownloader {
	private config: DownloadConfig;

	constructor() {
		this.config = {
			downloadDir: path.join(os.homedir(), "Downloads", "SoundCloud"),
			tempDir: path.join(os.tmpdir(), "scdl-metadata"),
		};

		fs.ensureDirSync(this.config.downloadDir);
		fs.ensureDirSync(this.config.tempDir);
	}

	async processUrl(url: string): Promise<number> {
		// Get track information
		const s = spinner();
		s.start("Fetching information...");

		const tracks = await getTrackInfo(url);
		s.stop("✅ Information retrieved");

		if (tracks.length === 0) {
			throw new Error("No tracks found");
		}

		const isPlaylist = tracks.length > 1;

		// If it's a playlist, propose album mode
		if (isPlaylist) {
			const useAlbumMode = await promptForAlbumMode();

			if (useAlbumMode) {
				await this.processAsAlbum(tracks);
			} else {
				await this.processIndividually(tracks);
			}
		} else {
			await this.processIndividually(tracks);
		}

		return tracks.length;
	}

	private async downloadAndProcessTrack(
		track: TrackInfo,
		metadata: UserMetadata,
	): Promise<void> {
		try {
			// Download audio
			const s = spinner();
			s.start("Downloading audio...");
			const audioPath = await downloadAudio(track, this.config);
			s.stop("✅ Audio downloaded");

			// Check that file exists
			if (!fs.existsSync(audioPath)) {
				throw new Error("Audio file was not created");
			}

			// Download cover
			s.start("Downloading cover...");
			const coverPath = await downloadCover(track, this.config);
			s.stop("✅ Cover downloaded");

			// Edit metadata
			s.start("Editing metadata...");
			await editMetadata(audioPath, metadata, coverPath);
			s.stop("✅ Metadata updated");

			// Clean temporary files
			if (coverPath && fs.existsSync(coverPath)) {
				fs.removeSync(coverPath);
			}

			log.info(`✅ ${track.filename} saved successfully!`);
		} catch (error) {
			console.error(`❌ Error for ${track.title}: ${error}`);
			// Continue with other tracks instead of crashing
		}
	}

	private async processTrack(
		track: TrackInfo,
		commonMetadata?: CommonAlbumMetadata,
		trackNumber?: number,
		totalTracks?: number,
	): Promise<void> {
		const artistName = commonMetadata?.artist || track.artist;
		log.step(`🎵 Processing: ${track.title} - ${artistName}`);

		// Ask user for metadata
		const metadata = await promptMetadata(
			track,
			commonMetadata,
			trackNumber,
			totalTracks,
		);

		await this.downloadAndProcessTrack(track, metadata);
	}

	private async processIndividually(tracks: TrackInfo[]): Promise<void> {
		for (let i = 0; i < tracks.length; i++) {
			const track = tracks[i];
			if (track) {
				log.step(`📀 Track ${i + 1}/${tracks.length}`);
				await this.processTrack(track);
			}
		}
	}

	private async processAsAlbum(tracks: TrackInfo[]): Promise<void> {
		// Prompt common metadata once
		const firstTrack = tracks[0];
		if (!firstTrack) {
			throw new Error("No tracks found in playlist");
		}
		const commonMetadata = await promptCommonAlbumMetadata(firstTrack);
		log.step(`💿 Album: ${commonMetadata.album} - ${commonMetadata.artist}`);

		// Process each track with common metadata and track numbers
		for (let i = 0; i < tracks.length; i++) {
			const track = tracks[i];
			if (track) {
				log.step(`📀 Track ${i + 1}/${tracks.length}`);
				await this.processTrack(track, commonMetadata, i + 1, tracks.length);
			}
		}
	}

	getDownloadDir(): string {
		return this.config.downloadDir;
	}
}
