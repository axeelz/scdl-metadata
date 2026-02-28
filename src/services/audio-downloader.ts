export async function downloadAudio(sourceUrl: string, outputPath: string): Promise<void> {
  const proc = Bun.spawn(
    ["yt-dlp", "-x", "--audio-format", "mp3", "--audio-quality", "0", "-o", outputPath, sourceUrl],
    { stdout: "ignore", stderr: "pipe" },
  );

  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(`Audio download failed: ${await proc.stderr.text()}`);
  }
}
