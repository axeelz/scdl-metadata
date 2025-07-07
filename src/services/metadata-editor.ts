import fs from "fs-extra";
import NodeID3 from "node-id3";
import type { UserMetadata } from "../types/index";

export async function editMetadata(
	audioPath: string,
	metadata: UserMetadata,
	coverPath: string | null,
): Promise<void> {
	const tags: NodeID3.Tags = {
		title: metadata.title,
		artist: metadata.artist,
		album: metadata.album || metadata.title,
		year: metadata.releaseDate,
		genre: metadata.genre,
		performerInfo: metadata.artist, // Album artist
		...(metadata.producer && { composer: metadata.producer }),
		...(metadata.trackNumber && { trackNumber: metadata.trackNumber }),
	};

	// Add cover if available
	if (coverPath && fs.existsSync(coverPath)) {
		tags.image = {
			mime: "image/jpeg",
			type: {
				id: 3,
				name: "front cover",
			},
			description: "Cover",
			imageBuffer: await fs.readFile(coverPath),
		};
	}

	// Write metadata
	const success = NodeID3.write(tags as NodeID3.Tags, audioPath);
	if (!success) {
		throw new Error("Unable to write metadata");
	}
}
