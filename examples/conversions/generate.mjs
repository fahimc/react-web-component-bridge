/* global console, process, URL */

import { mkdir, readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { basename, join } from "node:path";
import { compileReactFile } from "../../packages/generator/dist/index.js";

const root = new URL(".", import.meta.url);
const reactDir = new URL("./react/", root);
const definitionsDir = new URL("./definitions/", root);
const convertedDir = new URL("./converted/", root);
const reactPath = fileURLToPath(reactDir);
const definitionsPath = fileURLToPath(definitionsDir);
const convertedPath = fileURLToPath(convertedDir);

await mkdir(convertedDir, { recursive: true });

const sourceFiles = (await readdir(reactPath)).filter((file) => file.endsWith(".tsx")).sort();

for (const sourceFile of sourceFiles) {
  const name = basename(sourceFile, ".tsx");
  const definition = JSON.parse(await readFile(join(definitionsPath, `${name}.rwcb.json`), "utf8"));

  await compileReactFile({
    input: join(reactPath, sourceFile),
    outFile: join(convertedPath, `${name}.js`),
    registrations: [definition]
  });

  console.log(`Converted ${sourceFile} -> converted/${name}.js`);
}

if (sourceFiles.length !== 10) {
  console.error(`Expected 10 conversion examples, found ${sourceFiles.length}.`);
  process.exitCode = 1;
}
