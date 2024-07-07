import * as decompress from "decompress";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { promisify } from "util";

const binName = "flyscrape";
const execFile = promisify(require("node:child_process").execFile);

export async function saveBinary(url: string): Promise<string> {
  const response = await fetch(url);

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "flyscrape-"));
  await decompress(Buffer.from(await response.arrayBuffer()), directory, {
    filter: (file) => file.path == binName,
  });

  const binaryPath = path.join(directory, binName);
  fs.chmodSync(binaryPath, 0o755);

  return binaryPath;
}

export async function executeScript(
  binaryPath: string,
  scriptPath: string,
  args: string[],
): Promise<string | Buffer> {
  const { stdout } = await execFile(binaryPath, ["run", ...args, scriptPath]);
  return stdout;
}
