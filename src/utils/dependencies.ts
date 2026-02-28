export function checkDependencies(): boolean {
  return Bun.spawnSync(["yt-dlp", "--version"], {
    stderr: "ignore",
    stdout: "ignore",
  }).success;
}
