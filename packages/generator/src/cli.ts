#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { generateArtifacts } from "./index";
import type { ReactElementMetadata } from "@fahimc/react-web-component-bridge";

type CliOptions = {
  input: string;
  outDir: string;
};

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const input = JSON.parse(
    await readFile(resolve(options.input), "utf8")
  ) as ReactElementMetadata[];
  const output = generateArtifacts(input);
  const outDir = resolve(options.outDir);
  await mkdir(outDir, { recursive: true });
  await writeFile(resolve(outDir, "custom-elements.json"), output.customElementsJson);
  await writeFile(resolve(outDir, "custom-elements.d.ts"), output.declarations);
  await writeFile(resolve(outDir, "api.md"), output.markdown);
}

function parseArgs(args: string[]): CliOptions {
  const command = args[0];
  if (command !== "generate") {
    throw new Error(
      "Usage: react-web-component-bridge generate --input metadata.json --out-dir dist"
    );
  }
  const input = args[args.indexOf("--input") + 1];
  const outDir = args[args.indexOf("--out-dir") + 1] ?? dirname(input ?? ".");
  if (!input) {
    throw new Error("Missing --input.");
  }
  return { input, outDir };
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
