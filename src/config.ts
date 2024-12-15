import * as core from "@actions/core";

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
