import * as github from "@actions/github";
import { Platform } from "./platform";
import { components } from "@octokit/openapi-types";
import semverSort from "semver/functions/sort";

// Custom types for type narrowing.
type ListTagsResponse = components["schemas"]["tag"];
type GetReleaseByTagResponse = components["schemas"]["release"];

// Repository metadata.
const owner = "philippta";
const repo = "flyscrape";

async function getTagFromVersion(version: string): Promise<string> {
  if (version != "latest") {
    if (version.startsWith("v")) {
      return version;
    } else {
      return "v" + version;
    }
  }

  const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

  var tags: string[] = [];
  const { data } = await octokit.rest.repos.listTags({
    owner: owner,
    repo: repo,
  });

  if (Array.isArray(data)) {
    data.forEach((item) => {
      if (item as ListTagsResponse) {
        tags.push(item.name);
      }
    });
  }

  const sortedTags: string[] = semverSort(tags);
  if (sortedTags.length > 0) {
    return sortedTags[sortedTags.length - 1];
  }

  throw Error(`Could not find ${repo} release ${version}`);
}

export async function getAssetURL(version: string): Promise<string> {
  const tag: string = await getTagFromVersion(version);

  // The fact that this is necessary is genuinely awful.
  const getReleaseData = async (): Promise<GetReleaseByTagResponse> => {
    const { RequestError } = await import("@octokit/request-error");

    try {
      const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
      const { data } = await octokit.rest.repos.getReleaseByTag({
        owner: owner,
        repo: repo,
        tag: tag,
      });

      return data;
    } catch (error) {
      if (error instanceof RequestError && error.status == 404) {
        throw Error(`Version ${version} does not exist for ${owner}/${repo}`);
      } else {
        throw error;
      }
    }
  };

  const platform = new Platform();
  const url = platform.matchReleaseAsset(await getReleaseData());

  if (url !== null && url.includes(tag)) {
    return url;
  }

  throw Error(
    `Could not locate ${repo} release for version ${version} on platform ${platform.platform()}`,
  );
}
