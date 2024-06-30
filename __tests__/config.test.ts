import { describe, expect, it, jest } from "@jest/globals";
import { when } from "jest-when";

import * as core from "@actions/core";
import { arch, platform } from "os";

import * as config from "../src/config";

// Setup mocks.
jest.mock("os");
const getInputSpy = jest.spyOn(core, "getInput");

describe("getInputs", () => {
  it("returns inputs from simple case", () => {
    when(getInputSpy)
      .calledWith("version")
      .mockReturnValue("1.0.0")
      .calledWith("args")
      .mockReturnValue("hello world")
      .calledWith("script", { required: true })
      .mockReturnValue("script.js");

    expect(config.getInputs()).toStrictEqual({
      version: "1.0.0",
      args: ["hello", "world"],
      script: "script.js",
    });
  });

  it("returns latest when version is not given", () => {
    when(getInputSpy)
      .calledWith("version")
      .mockReturnValue("")
      .calledWith("args")
      .mockReturnValue("hello world")
      .calledWith("script", { required: true })
      .mockReturnValue("script.js");

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
