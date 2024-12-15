import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { DeepPick } from "ts-deep-pick";

import { arch, platform } from "os";
import { Platform } from "../src/platform";

import { components } from "@octokit/openapi-types";

// Custom picked type so we don't need to initialize a giant object.
type GetReleaseByTagResponse = components["schemas"]["release"];
type OnlyAssetURLForRelease = DeepPick<
  GetReleaseByTagResponse,
  "assets.[].browser_download_url"
>;

jest.mock("os");

describe("construct platform class", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets os and arch to current platform", () => {
    const plat = new Platform();

    expect(plat.arch).toBe(arch());
    expect(plat.os).toBe(platform());
  });
});

describe("match browser url for current platform", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  let data: OnlyAssetURLForRelease = {
    assets: [
      {
        browser_download_url:
          "https://github.com/philippta/flyscrape/releases/download/v0.9.0/flyscrape_linux_amd64.tar.gz",
      },
      {
        browser_download_url:
          "https://github.com/philippta/flyscrape/releases/download/v0.9.0/flyscrape_macos_arm64.tar.gz",
      },
      {
        browser_download_url:
          "https://github.com/philippta/flyscrape/releases/download/v0.9.0/flyscrape_windows_amd64.tar.gz",
      },
    ],
  };

  const testPlatform = (archName: string, os: string, expectedURL: string) => {
    (arch as jest.Mock).mockReturnValue(archName);
    (platform as jest.Mock).mockReturnValue(os);

    const plat = new Platform();
    expect(plat.matchReleaseAsset(data as GetReleaseByTagResponse)).toBe(
      expectedURL,
    );
  };

  it("returns matching URL for linux/amd64", () => {
    testPlatform("x64", "linux", data.assets[0].browser_download_url);
  });

  it("returns matching URL for macos/arm64", () => {
    testPlatform("arm64", "darwin", data.assets[1].browser_download_url);
  });

  it("returns matching URL for windows/amd64", () => {
    testPlatform("x64", "win32", data.assets[2].browser_download_url);
  });

  it("returns null when no matching URL exists", () => {
    (arch as jest.Mock).mockReturnValue("x64");
    (platform as jest.Mock).mockReturnValue("linux");

    let data: OnlyAssetURLForRelease = {
      assets: [
        {
          browser_download_url:
            "https://github.com/philippta/flyscrape/releases/download/v0.9.0/flyscrape_macos_amd64.tar.gz",
        },
      ],
    };

    const plat = new Platform();
    expect(plat.matchReleaseAsset(data as GetReleaseByTagResponse)).toBeNull();
  });
});

describe("get platform string", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const testPlatform = (archName: string, os: string, expected: string) => {
    (arch as jest.Mock).mockReturnValue(archName);
    (platform as jest.Mock).mockReturnValue(os);

    const plat = new Platform();
    expect(plat.platform()).toBe(expected);
  };

  it("for macos/arm64", () => {
    testPlatform("arm64", "darwin", "macos/arm64");
  });

  it("for windows/amd64", () => {
    testPlatform("x64", "win32", "windows/amd64");
  });

  it("for linux/amd64", () => {
    testPlatform("x64", "linux", "linux/amd64");
  });
});
