/* global console, process, URL */

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { basename, join } from "node:path";
import {
  compileReactComponentSource,
  compilerRuntimeForTesting
} from "../../packages/generator/dist/index.js";

const root = new URL(".", import.meta.url);
const reactDir = new URL("./react/", root);
const definitionsDir = new URL("./definitions/", root);
const convertedDir = new URL("./converted/", root);
const reactPath = fileURLToPath(reactDir);
const definitionsPath = fileURLToPath(definitionsDir);
const convertedPath = fileURLToPath(convertedDir);

await mkdir(convertedDir, { recursive: true });

const scaffoldExports = [
  "Children",
  "Fragment",
  "React",
  "StrictMode",
  "Suspense",
  "cloneElement",
  "createContext",
  "createElement",
  "createPortal",
  "createRef",
  "defineComponentTag",
  "forwardRef",
  "h",
  "isValidElement",
  "lazy",
  "memo",
  "startTransition",
  "useCallback",
  "useContext",
  "useDebugValue",
  "useDeferredValue",
  "useEffect",
  "useId",
  "useImperativeHandle",
  "useInsertionEffect",
  "useLayoutEffect",
  "useMemo",
  "useReducer",
  "useRef",
  "useState",
  "useSyncExternalStore",
  "useTransition"
];

await writeFile(
  join(convertedPath, "scaffold.js"),
  [compilerRuntimeForTesting(), "", `export { ${scaffoldExports.join(", ")} };`, ""].join("\n")
);

const sourceFiles = (await readdir(reactPath)).filter((file) => file.endsWith(".tsx")).sort();

for (const sourceFile of sourceFiles) {
  const name = basename(sourceFile, ".tsx");
  const source = await readFile(join(reactPath, sourceFile), "utf8");
  const definition = JSON.parse(await readFile(join(definitionsPath, `${name}.rwcb.json`), "utf8"));
  const result = compileReactComponentSource({
    source,
    fileName: join(reactPath, sourceFile),
    includeRuntime: false,
    registrations: [definition]
  });

  if (result.diagnostics.length > 0) {
    console.error(`Unable to convert ${sourceFile}:`);
    for (const diagnostic of result.diagnostics) {
      console.error(`- ${diagnostic}`);
    }
    process.exitCode = 1;
    continue;
  }

  const imports = scaffoldExports.filter((name) => {
    if (name === "defineComponentTag") {
      return true;
    }
    return new RegExp(`\\b${name}\\b`).test(result.code);
  });

  await writeFile(
    join(convertedPath, `${name}.js`),
    [`import { ${imports.join(", ")} } from "./scaffold.js";`, "", result.code, ""].join("\n")
  );

  console.log(`Converted ${sourceFile} -> converted/${name}.js`);
}

if (sourceFiles.length !== 10) {
  console.error(`Expected 10 conversion examples, found ${sourceFiles.length}.`);
  process.exitCode = 1;
}
