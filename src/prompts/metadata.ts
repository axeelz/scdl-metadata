import { cancel, confirm, isCancel, text } from "@clack/prompts";

import type { CommonAlbumMetadata, TrackInfo, UserMetadata } from "../types/index";

const DEFAULT_GENRE = "Hip-Hop/Rap";

function assertNotCancelled<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel("Operation cancelled");
    process.exit(0);
  }
  return value as T;
}

export async function promptMetadata(
  track: TrackInfo,
  commonMetadata?: CommonAlbumMetadata,
  trackNumber?: number,
  totalTracks?: number,
): Promise<UserMetadata> {
  const title = assertNotCancelled(
    await text({
      message: "Title:",
      initialValue: track.title,
      placeholder: track.title,
    }),
  );

  let artist: string, releaseDate: string, album: string;

  if (commonMetadata) {
    artist = commonMetadata.artist;
    releaseDate = commonMetadata.releaseDate;
    album = commonMetadata.album;
  } else {
    artist = assertNotCancelled(
      await text({
        message: "Artist:",
        initialValue: track.artist,
        placeholder: track.artist,
      }),
    );
    const defaultYear = track.year || new Date().getFullYear().toString();
    releaseDate = assertNotCancelled(
      await text({
        message: "Release date (YYYY):",
        initialValue: defaultYear,
        placeholder: defaultYear,
      }),
    );
    album = title;
  }

  const producerInput = assertNotCancelled(
    await text({
      message: "Producer/Composer (optional):",
      placeholder: "Leave empty if not applicable",
    }),
  );
  const producer = producerInput.trim() || undefined;

  const trackNumberString =
    trackNumber && totalTracks ? `${trackNumber}/${totalTracks}` : undefined;

  return {
    title,
    artist,
    releaseDate,
    genre: DEFAULT_GENRE,
    album,
    ...(producer && { producer }),
    ...(trackNumberString && { trackNumber: trackNumberString }),
  };
}

export async function promptForAlbumMode(): Promise<boolean> {
  return assertNotCancelled(
    await confirm({
      message:
        "Do you want to apply the same album name and artist for all tracks in the playlist?",
      initialValue: true,
    }),
  );
}

export async function promptCommonAlbumMetadata(
  firstTrack: TrackInfo,
): Promise<CommonAlbumMetadata> {
  const defaultAlbum = firstTrack.album || `${firstTrack.artist} - ${firstTrack.title}`;
  const album = assertNotCancelled(
    await text({
      message: "Album name:",
      initialValue: defaultAlbum,
      placeholder: defaultAlbum,
    }),
  );

  const artist = assertNotCancelled(
    await text({
      message: "Artist:",
      initialValue: firstTrack.artist,
      placeholder: firstTrack.artist,
    }),
  );

  const defaultYear = firstTrack.year || new Date().getFullYear().toString();
  const releaseDate = assertNotCancelled(
    await text({
      message: "Release date (YYYY):",
      initialValue: defaultYear,
      placeholder: defaultYear,
    }),
  );

  return { album, artist, releaseDate, genre: DEFAULT_GENRE };
}
