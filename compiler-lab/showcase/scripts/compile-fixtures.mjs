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
  .ui-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid transparent;border-radius:6px;font-weight:750;font:inherit;cursor:pointer;transition:background .15s ease,border-color .15s ease,color .15s ease}
  .ui-button:disabled{cursor:not-allowed;opacity:.65}
  .variant-default{background:#111827;color:#fff}
  .variant-default:hover:not(:disabled){background:#263244}
  .variant-secondary{background:#eef3f7;color:#162033}
  .variant-secondary:hover:not(:disabled){background:#dfe7ee}
  .variant-outline{background:#fff;border-color:#c7d1dc;color:#162033}
  .variant-outline:hover:not(:disabled){border-color:#0f8f68;color:#0f8f68}
  .size-sm{min-height:34px;padding:7px 12px;font-size:13px}
  .size-md{min-height:42px;padding:10px 16px;font-size:15px}
  .size-lg{min-height:50px;padding:13px 20px;font-size:16px}
  .spinner{width:14px;height:14px;border:2px solid currentColor;border-right-color:transparent;border-radius:999px;animation:spin .8s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
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
  },
  {
    name: "shadcn-button",
    input: resolve(showcase, "src/react-sources/shadcn-button.tsx"),
    output: resolve(outDir, "shadcn-button.js"),
    registrations: [
      {
        tagName: "lab-shadcn-button",
        component: "ShadcnButton",
        options: {
          shadow: { mode: "open" },
          props: {
            disabled: { type: "boolean", default: false },
            label: { type: "string", default: "Open compiled button" },
            loading: { type: "boolean", default: false },
            size: { type: "string", default: "md" },
            variant: { type: "string", default: "default" }
          },
          events: { onAction: { name: "action" } },
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
