import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { DeepPick } from "ts-deep-pick";

import { getOctokit } from "@actions/github";
import { components } from "@octokit/openapi-types";
import { arch, platform } from "os";

import { getAssetURL } from "../src/github";

// Custom picked type so we don't need to initialize a giant object.
type GetReleaseByTagResponse = components["schemas"]["release"];
type ListTagsResponse = components["schemas"]["tag"];

type OnlyTagName = Pick<ListTagsResponse, "name">;
type OnlyAssetURLForRelease = DeepPick<
  GetReleaseByTagResponse,
  "assets.[].browser_download_url"
>;

// Setup mocks
jest.mock("os");
jest.mock("@actions/github", () => ({
  getOctokit: jest.fn(),
}));

describe("getAssetURL", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockVersionForTag = async (tag: string, expectedURL: string) => {
    const mockOctokit = {
      rest: {
        repos: {
          getReleaseByTag: jest.fn(() => {
            let result: OnlyAssetURLForRelease = {
              assets: [{ browser_download_url: expectedURL }],
            };

            return { data: result };
          }),
        },
      },
    };

    (getOctokit as jest.Mock).mockReturnValue(mockOctokit);
    (arch as jest.Mock).mockReturnValue("x64");
    (platform as jest.Mock).mockReturnValue("linux");

    expect(await getAssetURL(tag)).toBe(expectedURL);
  };

  it("return url for v0.8.0 for linux/amd64", async () => {
    await mockVersionForTag(
      "v0.8.0",
      "https://github.com/philippta/flyscrape/releases/download/v0.8.0/flyscrape_linux_amd64.tar.gz",
    );
  });

  it("return url for 0.8.0 for linux/amd64", async () => {
    await mockVersionForTag(
      "0.8.0",
      "https://github.com/philippta/flyscrape/releases/download/v0.8.0/flyscrape_linux_amd64.tar.gz",
    );
  });

  it("return v0.9.0 url for latest for linux/amd64", async () => {
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
                  browser_download_url:
                    "https://github.com/philippta/flyscrape/releases/download/v0.9.0/flyscrape_windows_amd64.tar.gz",
                },
                {
                  browser_download_url:
                    "https://github.com/philippta/flyscrape/releases/download/v0.9.0/flyscrape_macos_amd64.tar.gz",
                },
                {
                  browser_download_url:
                    "https://github.com/philippta/flyscrape/releases/download/v0.9.0/flyscrape_linux_amd64.tar.gz",
                },
              ],
            };

            return { data: result };
          }),
        },
      },
    };

    (getOctokit as jest.Mock).mockReturnValue(mockOctokit);
    (arch as jest.Mock).mockReturnValue("x64");
    (platform as jest.Mock).mockReturnValue("linux");

    expect(await getAssetURL("latest")).toBe(
      "https://github.com/philippta/flyscrape/releases/download/v0.9.0/flyscrape_linux_amd64.tar.gz",
    );
  });

  it("throws error for invalid latest version", async () => {
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
    (arch as jest.Mock).mockReturnValue("x64");
    (platform as jest.Mock).mockReturnValue("linux");

    expect(async () => {
      await getAssetURL("latest");
    }).rejects.toThrow("Could not find flyscrape release latest");
  });

  it("throws error if unable to locate specified version", async () => {
    const expectedURL =
      "https://github.com/philippta/flyscrape/releases/download/v0.8.0/flyscrape_linux_amd64.tar.gz";
    const mockOctokit = {
      rest: {
        repos: {
          getReleaseByTag: jest.fn(() => {
            let result: OnlyAssetURLForRelease = {
              assets: [{ browser_download_url: expectedURL }],
            };

            return { data: result };
          }),
        },
      },
    };

    (getOctokit as jest.Mock).mockReturnValue(mockOctokit);
    (arch as jest.Mock).mockReturnValue("x64");
    (platform as jest.Mock).mockReturnValue("linux");

    expect(async () => {
      await getAssetURL("v0.1.0");
    }).rejects.toThrow(
      "Could not locate flyscrape release for version v0.1.0 on platform linux/amd64",
    );
  });
});
