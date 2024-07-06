import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getInput } from "@actions/core";
import { arch, platform } from "os";

import * as config from "../src/config";

// Setup mocks.
jest.mock("os");
jest.mock("@actions/core", () => ({
  getInput: jest.fn(),
}));

describe("getInputs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns inputs from simple case", () => {
    (getInput as jest.Mock).mockImplementation((name, _) => {
      switch (name) {
        case "version":
          return "1.0.0";
        case "args":
          return "hello world";
        case "script":
          return "script.js";
        default:
          throw `Unexpected config name ${name}`;
      }
    });

    expect(config.getInputs()).toStrictEqual({
      version: "1.0.0",
      args: ["hello", "world"],
      script: "script.js",
    });
  });

  it("returns latest when version is not given", () => {
    (getInput as jest.Mock).mockImplementation((name, _) => {
      switch (name) {
        case "version":
          return "";
        case "args":
          return "hello world";
        case "script":
          return "script.js";
        default:
          throw `Unexpected config name ${name}`;
      }
    });

    expect(config.getInputs()).toStrictEqual({
      version: "latest",
      args: ["hello", "world"],
      script: "script.js",
    });
  });
});

describe("getPlatform", () => {
  it("returns Linux on AMD", () => {
    (arch as jest.Mock).mockReturnValue("x64");
    (platform as jest.Mock).mockReturnValue("linux");

    expect(config.getPlatform()).toStrictEqual({
      arch: config.Arch.AMD,
      os: config.OS.Linux,
    });
  });

  it("returns Linux on ARM", () => {
    (arch as jest.Mock).mockReturnValue("arm64");
    (platform as jest.Mock).mockReturnValue("linux");

    expect(config.getPlatform()).toStrictEqual({
      arch: config.Arch.ARM,
      os: config.OS.Linux,
    });
  });

  it("returns MacOS on AMD", () => {
    (arch as jest.Mock).mockReturnValue("x64");
    (platform as jest.Mock).mockReturnValue("darwin");

    expect(config.getPlatform()).toStrictEqual({
      arch: config.Arch.AMD,
      os: config.OS.Mac,
    });
  });

  it("returns MacOS on ARM", () => {
    (arch as jest.Mock).mockReturnValue("arm64");
    (platform as jest.Mock).mockReturnValue("darwin");

    expect(config.getPlatform()).toStrictEqual({
      arch: config.Arch.ARM,
      os: config.OS.Mac,
    });
  });

  it("returns Windows on AMD", () => {
    (arch as jest.Mock).mockReturnValue("x64");
    (platform as jest.Mock).mockReturnValue("win32");

    expect(config.getPlatform()).toStrictEqual({
      arch: config.Arch.AMD,
      os: config.OS.Windows,
    });
  });

  it("throws an error for Windows on ARM", () => {
    (arch as jest.Mock).mockReturnValue("arm64");
    (platform as jest.Mock).mockReturnValue("win32");

    expect(config.getPlatform).toThrow(
      "Unsupported OS/architecture combination win32/arm64",
    );
  });
});
