import { describe, expect, it } from "@jest/globals";
import { existsSync, statSync } from "fs";
import { saveBinary } from "../src/binary";

const testURL =
  "https://github.com/philippta/flyscrape/releases/download/v0.8.1/flyscrape_linux_arm64.tar.gz";

describe("saveBinary", () => {
  it("saves flyscrape script to tempdir w/ correct perms", async () => {
    const path = await saveBinary(testURL);

    expect(existsSync(path)).toBe(true);
    expect(statSync(path)).toMatchObject({ mode: 33261 });
  }, 20000);
});
