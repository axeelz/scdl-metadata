import { cancel, confirm, isCancel, text } from "@clack/prompts";
import type {
	CommonAlbumMetadata,
	TrackInfo,
	UserMetadata,
} from "../types/index";

export async function promptMetadata(
	track: TrackInfo,
	commonMetadata?: CommonAlbumMetadata,
	trackNumber?: number,
	totalTracks?: number,
): Promise<UserMetadata> {
	const title = await text({
		message: "Title:",
		defaultValue: track.title,
	});

	if (isCancel(title)) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	// If common metadata exists, use it, otherwise ask
	let artist: string, releaseDate: string, genre: string, album: string;

	if (commonMetadata) {
		artist = commonMetadata.artist;
		releaseDate = commonMetadata.releaseDate;
		genre = commonMetadata.genre;
		album = commonMetadata.album;
	} else {
		const artistPrompt = await text({
			message: "Artist:",
			defaultValue: track.artist,
		});

		if (isCancel(artistPrompt)) {
			cancel("Operation cancelled");
			process.exit(0);
		}

		const releaseDatePrompt = await text({
			message: "Release date (YYYY):",
			defaultValue: track.year || new Date().getFullYear().toString(),
		});

		if (isCancel(releaseDatePrompt)) {
			cancel("Operation cancelled");
			process.exit(0);
		}

		artist = artistPrompt as string;
		releaseDate = releaseDatePrompt as string;
		genre = "Hip-Hop/Rap";
		album = title as string; // Album = title for individual tracks
	}

	const producer = await text({
		message: "Producer/Composer (optional):",
		placeholder: "Leave empty if not applicable",
	});

	if (isCancel(producer)) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	const trimmedProducer = producer && (producer as string).trim();

	// Generate track number for album mode
	const trackNumberString =
		trackNumber && totalTracks ? `${trackNumber}/${totalTracks}` : undefined;

	return {
		title: title as string,
		artist,
		releaseDate,
		genre,
		album,
		...(trimmedProducer && { producer: trimmedProducer }),
		...(trackNumberString && { trackNumber: trackNumberString }),
	};
}

export async function promptForAlbumMode(): Promise<boolean> {
	const isAlbum = await confirm({
		message:
			"Do you want to apply the same album name and artist for all tracks in the playlist?",
		initialValue: true,
	});

	if (isCancel(isAlbum)) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	return isAlbum as boolean;
}

export async function promptCommonAlbumMetadata(
	firstTrack: TrackInfo,
): Promise<CommonAlbumMetadata> {
	const album = await text({
		message: "Album name:",
		defaultValue:
			firstTrack.album || `${firstTrack.artist} - ${firstTrack.title}`,
	});

	if (isCancel(album)) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	const artist = await text({
		message: "Artist:",
		defaultValue: firstTrack.artist,
	});

	if (isCancel(artist)) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	const releaseDate = await text({
		message: "Release date (YYYY):",
		defaultValue: firstTrack.year || new Date().getFullYear().toString(),
	});

	if (isCancel(releaseDate)) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	return {
		album: album as string,
		artist: artist as string,
		releaseDate: releaseDate as string,
		genre: "Hip-Hop/Rap",
	};
}
