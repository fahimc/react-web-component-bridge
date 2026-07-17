#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { BRIDGE_REACT_IMPORT, generateArtifacts, rewriteReactImportsInFolder } from "./index";
import type { ReactElementMetadata } from "@fahimc/react-web-component-bridge";

type GenerateCliOptions = {
  command: "generate";
  input: string;
  outDir: string;
};

type RewriteCliOptions = {
  command: "replace-react-imports";
  dir: string;
  dryRun: boolean;
  replacement: string;
};

type CliOptions = GenerateCliOptions | RewriteCliOptions;

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  if (options.command === "replace-react-imports") {
    const result = await rewriteReactImportsInFolder({
      rootDir: options.dir,
      dryRun: options.dryRun,
      replacement: options.replacement
    });
    const action = options.dryRun ? "Would update" : "Updated";
    console.log(
      `${action} ${result.changedFiles.length} file(s), ${result.changedFiles.reduce(
        (total, file) => total + file.replacements,
        0
      )} import specifier(s). Scanned ${result.scannedFiles} file(s).`
    );
    for (const file of result.changedFiles) {
      console.log(`${file.path} (${file.replacements})`);
    }
    return;
  }

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
  if (command === "generate") {
    const input = valueAfter(args, "--input");
    const outDir = valueAfter(args, "--out-dir") ?? dirname(input ?? ".");
    if (!input) {
      throw new Error("Missing --input.");
    }
    return { command, input, outDir };
  }

  if (command === "replace-react-imports" || command === "migrate-react-imports") {
    const positionalDir = args[1]?.startsWith("-") ? undefined : args[1];
    const dir = valueAfter(args, "--dir") ?? positionalDir;
    if (!dir) {
      throw new Error("Missing folder. Use --dir src or pass a folder argument.");
    }
    return {
      command: "replace-react-imports",
      dir,
      dryRun: args.includes("--dry-run"),
      replacement: valueAfter(args, "--replacement") ?? BRIDGE_REACT_IMPORT
    };
  }

  throw new Error(
    [
      "Usage:",
      "  react-web-component-bridge generate --input metadata.json --out-dir dist",
      "  react-web-component-bridge replace-react-imports --dir src [--dry-run]",
      "  react-web-component-bridge migrate-react-imports src [--dry-run]"
    ].join("\n")
  );
}

function valueAfter(args: readonly string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  const value = args[index + 1];
  return value && !value.startsWith("-") ? value : undefined;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
