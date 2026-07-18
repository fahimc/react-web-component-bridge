import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { compileReactComponentSource } from "../../../packages/generator/dist/index.js";

const root = resolve(import.meta.dirname, "../../..");
const showcase = resolve(import.meta.dirname, "..");
const outDir = resolve(showcase, "src/compiled");

const styles = `
  :host{display:block;color:#162033;font-family:Inter,Arial,sans-serif}
  .banner{border-radius:8px;background:#0f8f68;color:white;padding:22px}
  .container{display:grid;gap:6px}
  .logo-font{text-transform:lowercase;font-size:42px;line-height:1;margin:0}
  p{margin:0;color:inherit}
  .origin{color:#0f8f68;font-size:12px;font-weight:800;text-transform:uppercase}
  .bp-dashboard,.jira-board{display:grid;gap:14px}
  h2{margin:0;font-size:24px;line-height:1.15}
  ul{margin:0;padding-left:18px;color:#516071;line-height:1.7}
  .filters{display:grid;grid-template-columns:1fr 180px;gap:12px}
  input,select{width:100%;border:1px solid #cbd5df;border-radius:6px;padding:10px;font:inherit}
  .issue-list{display:grid;gap:10px}
  .issue{display:grid;gap:4px;width:100%;border:1px solid #d7dfe7;border-radius:8px;background:#f8fafc;padding:12px;text-align:left;cursor:pointer}
  .issue:hover{border-color:#0f8f68}
  .issue span{color:#0f8f68;font-size:12px;font-weight:800}
  .issue strong{font-size:16px}
  .issue small{color:#607080}
  @media(max-width:640px){.filters{grid-template-columns:1fr}.logo-font{font-size:34px}}
`;

const fixtures = [
  {
    name: "realworld-banner",
    input: resolve(root, "compiler-lab/github-projects/realworld/src/components/Home/Banner.js"),
    output: resolve(outDir, "realworld-banner.js"),
    registrations: [
      {
        tagName: "lab-realworld-banner",
        component: "Banner",
        options: {
          shadow: { mode: "open" },
          props: {
            appName: { type: "string", default: "conduit" },
            token: { type: "string", default: "" }
          },
          styles
        }
      }
    ]
  },
  {
    name: "bulletproof-dashboard",
    input: resolve(showcase, "src/react-sources/bulletproof-dashboard.tsx"),
    output: resolve(outDir, "bulletproof-dashboard.js"),
    registrations: [
      {
        tagName: "lab-bulletproof-dashboard",
        component: "BulletproofDashboard",
        options: {
          shadow: { mode: "open" },
          props: { user: { attribute: false } },
          styles
        }
      }
    ]
  },
  {
    name: "jira-board",
    input: resolve(showcase, "src/react-sources/jira-board.tsx"),
    output: resolve(outDir, "jira-board.js"),
    registrations: [
      {
        tagName: "lab-jira-board",
        component: "JiraBoard",
        options: {
          shadow: { mode: "open" },
          props: { issues: { attribute: false } },
          events: { onIssueOpen: { name: "issue-open" } },
          styles
        }
      }
    ]
  }
];

await mkdir(outDir, { recursive: true });

for (const fixture of fixtures) {
  const source = await readFile(fixture.input, "utf8");
  const result = compileReactComponentSource({
    source,
    fileName: fixture.input,
    registrations: fixture.registrations
  });
  if (result.diagnostics.length > 0) {
    throw new Error(`${fixture.name} failed compile:\n${result.diagnostics.join("\n")}`);
  }
  await writeFile(fixture.output, result.code);
  console.log(`compiled ${fixture.name}`);
}
