import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { getInput } from "@actions/core";
import * as config from "../src/config";

// Setup mocks.
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

  it("returns empty args list when none are given", () => {
    (getInput as jest.Mock).mockImplementation((name, _) => {
      switch (name) {
        case "version":
          return "";
        case "args":
          return "";
        case "script":
          return "script.js";
        default:
          throw `Unexpected config name ${name}`;
      }
    });

    expect(config.getInputs()).toStrictEqual({
      version: "latest",
      args: [],
      script: "script.js",
    });
  });
});
