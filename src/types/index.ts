export interface TrackInfo {
	title: string;
	artist: string;
	album?: string;
	year?: string;
	genre?: string;
	comment?: string;
	trackNumber?: string;
	coverUrl?: string;
	filename?: string;
	filePath?: string;
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

export interface YtDlpOutput {
	title?: string;
	uploader?: string;
	playlist?: string;
	upload_date?: string;
	thumbnail?: string;
	webpage_url?: string;
	entries?: YtDlpEntry[];
}

export interface YtDlpEntry {
	title?: string;
	uploader?: string;
	playlist?: string;
	upload_date?: string;
	thumbnail?: string;
	webpage_url?: string;
}

export interface DownloadConfig {
	downloadDir: string;
	tempDir: string;
}
