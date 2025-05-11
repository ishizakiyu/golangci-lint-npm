#!/usr/bin/env node

import { join, resolve } from "path";
import { existsSync, readFileSync, mkdirSync } from "fs";
import { spawnSync } from "child_process";
import { Command } from "@commander-js/extra-typings";
import pkg from "../package.json" with { type: "json" };

const program = new Command()
  .option("--bin-root <path>")
  .helpCommand(false)
  .helpOption(false)
  .allowUnknownOption()
  .allowExcessArguments();
program.parse(process.argv);
const options = program.opts();

const binRoot = options.binRoot ? resolve(options.binRoot) : import.meta.dirname;
const versionFile = join(process.cwd(), ".golangci-version");

const envVersion = process.env.GOLANGCI_VERSION?.trim() ?? "";
const fileVersion = existsSync(versionFile) ? readFileSync(versionFile, "utf-8").trim() : "";
const fallbackVersion = pkg.fallbackGolangciVersion;

const version = envVersion || fileVersion || fallbackVersion;
const versionStr = version.startsWith("v") ? version : `v${version}`;

const binDir = join(binRoot, versionStr);
const bin = join(binDir, "golangci-lint");

if (!existsSync(bin)) {
  mkdirSync(binDir, { recursive: true });
  const installCmd = `curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/${versionStr}/install.sh | sh -s -- -b ${binDir} ${versionStr}`;
  const installRes = spawnSync(installCmd, { stdio: "inherit", shell: true });
  if (installRes.status !== 0) {
    process.exit(installRes.status ?? 1);
  }
}

const runRes = spawnSync(bin, program.args, { stdio: "inherit" });
process.exit(runRes.status ?? 1);
