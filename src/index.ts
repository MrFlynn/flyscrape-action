import * as core from "@actions/core";
import * as binary from "./binary";
import * as config from "./config";
import * as github from "./github";
import { rmSync } from "fs";
import { dirname } from "path";

async function run(): Promise<void> {
  try {
    // Get inputs and platform information.
    const inputs = config.getInputs();
    const platform = config.getPlatform();

    // Get asset URL from Github for the current platform.
    const assetURL = await github.getAssetURL(inputs.version, platform);

    // Download, extract, and execute binary.
    const binaryPath = await binary.saveBinary(assetURL);
    const output = await binary.executeScript(
      binaryPath,
      inputs.script,
      inputs.args,
    );

    core.setOutput("output", output);

    // Remove container directory for binary.
    rmSync(dirname(binaryPath), { force: true, recursive: true });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
