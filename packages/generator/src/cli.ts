#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  BRIDGE_REACT_IMPORT,
  compileReactFile,
  compileReactFolder,
  defaultCompiledOutFile,
  generateArtifacts,
  rewriteReactImportsInFolder
} from "./index";
import type { ReactElementMetadata } from "@codedia/react-to-web-component-runtime";
import type { CompileReactRegistration } from "./index";

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

type CompileCliOptions = {
  command: "compile";
  input: string;
  outFile: string;
  tagName?: string | undefined;
  component?: string | undefined;
  definition?: string | undefined;
};

type CompileFolderCliOptions = {
  command: "compile-folder";
  dir: string;
  outDir: string;
};

type CliOptions =
  GenerateCliOptions | RewriteCliOptions | CompileCliOptions | CompileFolderCliOptions;

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  if (options.command === "compile") {
    await compileReactFile({
      input: options.input,
      outFile: options.outFile,
      registrations: await compileRegistrations(options)
    });
    console.log(`Compiled ${resolve(options.input)} -> ${resolve(options.outFile)} without React.`);
    return;
  }

  if (options.command === "compile-folder") {
    const result = await compileReactFolder({ rootDir: options.dir, outDir: options.outDir });
    console.log(
      `Compiled ${result.files.length} React-shaped component file(s) into ${result.outDir} without React.`
    );
    for (const file of result.files) {
      console.log(`${file.input} -> ${file.output}`);
    }
    return;
  }

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

  if (command === "compile") {
    const input = valueAfter(args, "--input") ?? (args[1]?.startsWith("-") ? undefined : args[1]);
    if (!input) {
      throw new Error("Missing --input.");
    }
    return {
      command,
      input,
      outFile: valueAfter(args, "--out-file") ?? defaultCompiledOutFile(input),
      tagName: valueAfter(args, "--tag"),
      component: valueAfter(args, "--component"),
      definition: valueAfter(args, "--definition")
    };
  }

  if (command === "compile-folder") {
    const positionalDir = args[1]?.startsWith("-") ? undefined : args[1];
    const dir = valueAfter(args, "--dir") ?? positionalDir;
    const outDir = valueAfter(args, "--out-dir");
    if (!dir || !outDir) {
      throw new Error("Missing folder options. Use compile-folder --dir src --out-dir dist.");
    }
    return { command, dir, outDir };
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
      "  react-to-web-component-compiler generate --input metadata.json --out-dir dist",
      "  react-to-web-component-compiler compile --input src/card.tsx --out-file dist/card.js",
      "  react-to-web-component-compiler compile --input src/card.tsx --tag acme-card --component Card",
      "  react-to-web-component-compiler compile --input src/card.tsx --definition card.rwcb.json",
      "  react-to-web-component-compiler compile-folder --dir src/components --out-dir dist/components",
      "  react-to-web-component-compiler replace-react-imports --dir src [--dry-run]",
      "  react-to-web-component-compiler migrate-react-imports src [--dry-run]"
    ].join("\n")
  );
}

async function compileRegistrations(
  options: CompileCliOptions
): Promise<readonly CompileReactRegistration[] | undefined> {
  const registrations: CompileReactRegistration[] = [];
  if (options.definition) {
    const definition = JSON.parse(await readFile(resolve(options.definition), "utf8")) as
      CompileReactRegistration | CompileReactRegistration[];
    registrations.push(...(Array.isArray(definition) ? definition : [definition]));
  }

  if (options.tagName || options.component) {
    if (!options.tagName || !options.component) {
      throw new Error("Use --tag and --component together.");
    }
    registrations.push({ tagName: options.tagName, component: options.component });
  }

  return registrations.length > 0 ? registrations : undefined;
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
