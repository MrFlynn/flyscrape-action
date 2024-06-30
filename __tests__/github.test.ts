import { describe, expect, it, jest } from "@jest/globals";
import { DeepPick } from "ts-deep-pick";

import { getInput } from "@actions/core";
import { getOctokit } from "@actions/github";
import { components } from "@octokit/openapi-types";

import { getAssetURL } from "../src/github";
import { OS, Arch } from "../src/config";
import { beforeEach } from "node:test";

// Custom picked type so we don't need to initialize a giant object.
type GetReleaseByTagResponse = components["schemas"]["release"];
type ListTagsResponse = components["schemas"]["tag"];

type OnlyTagName = Pick<ListTagsResponse, "name">;
type OnlyAssetURLForRelease = DeepPick<
  GetReleaseByTagResponse,
  "assets.[].url"
>;

// Setup mocks
jest.mock("@actions/core", () => ({
  getInput: jest.fn(),
}));

jest.mock("@actions/github", () => ({
  getOctokit: jest.fn(),
}));

describe("getAssetURL", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("return url for v0.8.0 for linux/amd64", async () => {
    (getInput as jest.Mock).mockReturnValueOnce("gh-token");

    const expectedURL =
      "https://github.com/philippta/flyscrape/releases/download/v0.8.0/flyscrape_linux_amd64.tar.gz";
    const mockOctokit = {
      rest: {
        repos: {
          getReleaseByTag: jest.fn(() => {
            let result: OnlyAssetURLForRelease = {
              assets: [{ url: expectedURL }],
            };

            return { data: result };
          }),
        },
      },
    };

    (getOctokit as jest.Mock).mockReturnValue(mockOctokit);

    expect(await getAssetURL("v0.8.0", { os: OS.Linux, arch: Arch.AMD })).toBe(
      expectedURL,
    );
  });

  it("return v0.9.0 url for latest for linux/amd64", async () => {
    (getInput as jest.Mock).mockReturnValueOnce("gh-token");

    const mockOctokit = {
      rest: {
        repos: {
          listTags: jest.fn(() => {
            let result: OnlyTagName[] = [
              { name: "v0.8.0" },
              { name: "v0.9.0" },
              { name: "v0.7.0" },
            ];

            return { data: result };
          }),
          getReleaseByTag: jest.fn(() => {
            let result: OnlyAssetURLForRelease = {
              assets: [
                {
                  url: "https://github.com/philippta/flyscrape/releases/download/v0.7.0/flyscrape_linux_amd64.tar.gz",
                },
                {
                  url: "https://github.com/philippta/flyscrape/releases/download/v0.8.0/flyscrape_linux_amd64.tar.gz",
                },
                {
                  url: "https://github.com/philippta/flyscrape/releases/download/v0.9.0/flyscrape_linux_amd64.tar.gz",
                },
              ],
            };

            return { data: result };
          }),
        },
      },
    };

    (getOctokit as jest.Mock).mockReturnValue(mockOctokit);

    expect(await getAssetURL("latest", { os: OS.Linux, arch: Arch.AMD })).toBe(
      "https://github.com/philippta/flyscrape/releases/download/v0.9.0/flyscrape_linux_amd64.tar.gz",
    );
  });

  it("throws error for invalid latest version", async () => {
    (getInput as jest.Mock).mockReturnValueOnce("gh-token");

    const mockOctokit = {
      rest: {
        repos: {
          listTags: jest.fn(() => {
            let result: OnlyTagName[] = [];
            return { data: result };
          }),
          getReleaseByTag: jest.fn(() => {
            return { data: null };
          }),
        },
      },
    };

    (getOctokit as jest.Mock).mockReturnValue(mockOctokit);

    expect(async () => {
      await getAssetURL("latest", { os: OS.Linux, arch: Arch.AMD });
    }).rejects.toThrow("Could not find flyscrape release latest");
  });

  it("throws error if unable to locate specified version", async () => {
    (getInput as jest.Mock).mockReturnValueOnce("gh-token");

    const expectedURL =
      "https://github.com/philippta/flyscrape/releases/download/v0.8.0/flyscrape_linux_amd64.tar.gz";
    const mockOctokit = {
      rest: {
        repos: {
          getReleaseByTag: jest.fn(() => {
            let result: OnlyAssetURLForRelease = {
              assets: [{ url: expectedURL }],
            };

            return { data: result };
          }),
        },
      },
    };

    (getOctokit as jest.Mock).mockReturnValue(mockOctokit);

    expect(async () => {
      await getAssetURL("v0.1.0", { os: OS.Linux, arch: Arch.AMD });
    }).rejects.toThrow(
      "Could not locate flyscrape release for version v0.1.0 on platform linux/amd64",
    );
  });
});
