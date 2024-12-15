import * as core from "@actions/core";
import * as binary from "./binary";
import * as config from "./config";
import * as github from "./github";
import { rmSync } from "fs";
import { dirname } from "path";

async function run(): Promise<void> {
  try {
    const inputs = config.getInputs();

    core.info(`Running ${inputs.script} with flyscrape@${inputs.version}`);

    // Get asset URL from Github for the current platform.
    const assetURL = await github.getAssetURL(inputs.version);

    core.debug(`Downloading Flyscrape binary from ${assetURL}`);

    // Download, extract, and execute binary.
    const binaryPath = await binary.saveBinary(assetURL);

    core.debug(
      `Executing script: ${binaryPath} run ${inputs.args.join(" ")} ${inputs.script}`,
    );

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
