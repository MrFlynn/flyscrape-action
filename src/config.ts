import * as core from "@actions/core";
import * as system from "os";

export interface Inputs {
  version: string;
  args: string[];
  script: string;
}

export function getInputs(): Inputs {
  return {
    version: core.getInput("version") || "latest",
    args: core
      .getInput("args")
      .split(" ")
      .filter((el) => el !== ""),
    script: core.getInput("script", { required: true }),
  };
}

export enum Arch {
  ARM = "arm64",
  AMD = "amd64",
}

export enum OS {
  Linux = "linux",
  Mac = "macos",
  Windows = "windows",
}

export interface Platform {
  arch: Arch;
  os: OS;
}

export function getPlatform(): Platform {
  const arch: string = system.arch();
  const os: string = system.platform();

  switch (true) {
    case arch == "x64" && os == "linux":
      return { arch: Arch.AMD, os: OS.Linux };
    case arch == "arm64" && os == "linux":
      return { arch: Arch.ARM, os: OS.Linux };
    case arch == "x64" && os == "darwin":
      return { arch: Arch.AMD, os: OS.Mac };
    case arch == "arm64" && os == "darwin":
      return { arch: Arch.ARM, os: OS.Mac };
    case arch == "x64" && os == "win32":
      return { arch: Arch.AMD, os: OS.Windows };
    default:
      throw Error(`Unsupported OS/architecture combination ${os}/${arch}`);
  }
}
