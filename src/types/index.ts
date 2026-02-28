export interface TrackInfo {
  title: string;
  artist: string;
  album?: string;
  year?: string;
  coverUrl?: string;
  filePath: string;
}

export interface UserMetadata {
  title: string;
  artist: string;
  releaseDate: string;
  producer?: string;
  genre: string;
  album?: string;
  trackNumber?: string;
}

export interface CommonAlbumMetadata {
  album: string;
  artist: string;
  releaseDate: string;
  genre: string;
}

export interface YtDlpEntry {
  title?: string;
  uploader?: string;
  playlist?: string;
  upload_date?: string;
  thumbnail?: string;
  webpage_url?: string;
}

export interface YtDlpOutput extends YtDlpEntry {
  entries?: YtDlpEntry[];
}
