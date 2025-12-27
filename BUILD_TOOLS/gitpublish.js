import { execSync } from "child_process";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("❌ Tenés que pasar al menos el mensaje del commit");
  process.exit(1);
}

const message = args[0];
const branch = args[1] ?? "main";

const safeMsg = message.replace(/"/g, '\\"');

execSync("git add .", { stdio: "inherit" });
execSync(`git commit -m "${safeMsg}"`, { stdio: "inherit" });
execSync(`git push origin ${branch}`, { stdio: "inherit" });
