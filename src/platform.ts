import { arch, platform } from "os";
import { components } from "@octokit/openapi-types";

type GetReleaseByTagResponse = components["schemas"]["release"];

export class Platform {
  readonly arch: string;
  readonly os: string;

  constructor() {
    this.arch = arch();
    this.os = platform();
  }

  matchReleaseAsset(data: GetReleaseByTagResponse): string | null {
    const arch = this.arch == "x64" ? "amd64" : this.arch;
    const osNameTest = (): RegExp => {
      switch (this.os) {
        case "darwin":
          return /(darwin|macos)/;
        case "win32":
          return /(windows)/;
        default:
          return new RegExp(`${this.os}`);
      }
    };

    const matchingAssets = data.assets.filter((asset) => {
      return (
        asset.browser_download_url.includes(arch) &&
        asset.browser_download_url.match(osNameTest())
      );
    });

    if (matchingAssets.length > 0) {
      return matchingAssets[0].browser_download_url;
    }

    return null;
  }

  platform(): string {
    const osName = (): string => {
      switch (this.os) {
        case "darwin":
          return "macos";
        case "win32":
          return "windows";
        default:
          return this.os;
      }
    };

    return `${osName()}/${this.arch == "x64" ? "amd64" : this.arch}`;
  }
}
