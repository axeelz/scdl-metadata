import { execSync } from "node:child_process";
import { log } from "@clack/prompts";

export function checkDependencies(): boolean {
	try {
		execSync("yt-dlp --version", { stdio: "ignore" });
		log.success("✅ yt-dlp detected");
		return true;
	} catch {
		return false;
	}
}
