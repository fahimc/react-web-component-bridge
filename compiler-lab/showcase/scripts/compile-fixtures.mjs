import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { compileReactComponentSource } from "../../../packages/generator/dist/index.js";

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
  button,input,select,textarea{font:inherit}
  button{border:0}
  .rw-app,.bp-app,.jira-app,.kit-app{display:grid;gap:18px;min-width:0}
  .rw-hero{display:grid;gap:28px;border-radius:10px;background:#0f8f68;color:white;padding:22px}
  .rw-hero nav{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
  .rw-hero nav strong{font-size:24px}
  .rw-hero h2,.bp-header h2,.jira-header h2,.kit-hero h2{margin:0;font-size:32px;line-height:1.05}
  .rw-hero p{max-width:760px;line-height:1.6}
  .rw-layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px}
  .rw-feed,.rw-editor{display:grid;align-content:start;gap:14px}
  .rw-tabs{display:flex;gap:8px;flex-wrap:wrap;border-bottom:1px solid #d8e0e7;padding-bottom:10px}
  .rw-tabs button,.bp-filter button,.kit-tabs button{border-radius:6px;background:#eef3f7;color:#526070;padding:8px 10px;cursor:pointer}
  .rw-tabs button.active,.bp-filter button.active,.kit-tabs button.active{background:#0f8f68;color:white}
  .rw-article,.rw-editor,.bp-metrics article,.bp-table article,.kit-card{border:1px solid #d8e0e7;border-radius:8px;background:#fff;padding:14px}
  .rw-article{display:grid;gap:10px}
  .rw-article div,.rw-article footer,.bp-header,.jira-header,.kit-hero{display:flex;align-items:center;justify-content:space-between;gap:12px}
  .rw-article div{align-items:flex-start}
  .rw-article div span,.rw-article p,.rw-editor p,.bp-header span,.kit-hero span{color:#566273}
  .rw-article footer{flex-wrap:wrap}
  .rw-article footer button,.bp-header button,.bp-table button,.jira-header button{border-radius:6px;background:#111827;color:#fff;padding:9px 12px;cursor:pointer}
  .rw-editor textarea{min-height:160px;resize:vertical;border:1px solid #cbd5df;border-radius:8px;padding:12px}
  .bp-app{grid-template-columns:220px minmax(0,1fr)}
  .bp-sidebar,.jira-left{display:grid;align-content:start;gap:13px;border-radius:10px;background:#102033;color:white;padding:18px}
  .bp-sidebar strong,.jira-left strong{font-size:19px}
  .bp-sidebar span,.jira-left span{color:#d6dee8}
  .bp-app main,.jira-app main{display:grid;gap:16px;min-width:0}
  .bp-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
  .bp-metrics article{display:grid;gap:4px}
  .bp-metrics strong{font-size:28px}
  .bp-metrics span,.bp-table span{color:#566273}
  .bp-filter{display:flex;gap:8px;flex-wrap:wrap}
  .bp-table{display:grid;gap:10px}
  .bp-table article{display:grid;grid-template-columns:minmax(0,1fr) 90px 110px auto;align-items:center;gap:12px}
  .bp-table article div{display:grid;gap:4px}
  .bp-table code,.jira-column header span,.kit-badge{width:max-content;border-radius:999px;background:#eef3f7;padding:5px 8px;color:#526070}
  .jira-app{grid-template-columns:190px minmax(0,1fr) 260px}
  .jira-controls{display:grid;grid-template-columns:minmax(0,1fr) 180px;gap:10px}
  .jira-controls input,.jira-controls select,.kit-card select{border:1px solid #cbd5df;border-radius:8px;padding:10px}
  .jira-columns{display:grid;grid-template-columns:repeat(4,minmax(190px,1fr));gap:12px;overflow-x:auto;padding-bottom:6px}
  .jira-column{display:grid;align-content:start;gap:10px;border-radius:10px;background:#eef3f7;padding:12px;min-height:430px}
  .jira-column header{display:flex;align-items:center;justify-content:space-between}
  .jira-card{display:grid;gap:7px;width:100%;border:1px solid #d8e0e7;border-radius:8px;background:#fff;padding:12px;text-align:left;cursor:pointer}
  .jira-card.selected{border-color:#0f8f68;box-shadow:0 0 0 2px rgba(15,143,104,.12)}
  .jira-card span,.jira-card small{color:#566273}
  .jira-detail{display:grid;align-content:start;gap:10px;border:1px solid #d8e0e7;border-radius:10px;background:#fff;padding:16px}
  .jira-detail h3{margin:0;font-size:26px}
  .jira-detail dl{display:grid;gap:10px;margin:0}
  .jira-detail div{display:grid;grid-template-columns:80px minmax(0,1fr);gap:10px}
  .jira-detail dt{color:#566273}
  .jira-detail dd{margin:0;font-weight:700}
  .kit-hero{align-items:flex-start;border-bottom:1px solid #d8e0e7;padding-bottom:16px}
  .kit-tabs{display:flex;gap:8px;flex-wrap:wrap}
  .kit-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  .kit-card{display:grid;gap:12px}
  .kit-card h3{margin:0;font-size:18px}
  .kit-card label{display:grid;gap:7px;color:#566273}
  .kit-card p{color:#566273}
  .kit-table{display:grid;gap:8px}
  .kit-table div{display:grid;grid-template-columns:minmax(0,1fr) 70px auto;align-items:center;gap:10px;border-top:1px solid #eef3f7;padding-top:8px}
  .badge-row{display:flex;gap:8px;flex-wrap:wrap}
  .tone-green{background:#e5f7ef;color:#0f684f}
  .tone-amber{background:#fff3cc;color:#7c5700}
  .tone-red{background:#ffe2e0;color:#8a1f17}
  .variant-destructive{background:#b42318;color:#fff}
  .variant-destructive:hover:not(:disabled){background:#921b13}
  @media(max-width:640px){.filters{grid-template-columns:1fr}.logo-font{font-size:34px}}
  @media(max-width:980px){.rw-layout,.bp-app,.jira-app,.kit-grid{grid-template-columns:1fr}.jira-columns{grid-template-columns:repeat(4,240px)}.bp-table article{grid-template-columns:1fr}.kit-hero,.bp-header,.jira-header,.rw-article div,.rw-article footer{align-items:flex-start;flex-direction:column}.bp-metrics{grid-template-columns:1fr}.jira-left{display:none}.jira-detail{order:3}.jira-controls{grid-template-columns:1fr}}
`;

const fixtures = [
  {
    name: "realworld-app",
    input: resolve(showcase, "src/react-sources/realworld-app.tsx"),
    output: resolve(outDir, "realworld-app.js"),
    registrations: [
      {
        tagName: "lab-realworld-app",
        component: "RealWorldApp",
        options: {
          shadow: { mode: "open" },
          styles
        }
      }
    ]
  },
  {
    name: "bulletproof-app",
    input: resolve(showcase, "src/react-sources/bulletproof-app.tsx"),
    output: resolve(outDir, "bulletproof-app.js"),
    registrations: [
      {
        tagName: "lab-bulletproof-app",
        component: "BulletproofApp",
        options: {
          shadow: { mode: "open" },
          props: { user: { attribute: false } },
          styles
        }
      }
    ]
  },
  {
    name: "jira-app",
    input: resolve(showcase, "src/react-sources/jira-app.tsx"),
    output: resolve(outDir, "jira-app.js"),
    registrations: [
      {
        tagName: "lab-jira-app",
        component: "JiraApp",
        options: {
          shadow: { mode: "open" },
          events: { onIssueOpen: { name: "issue-open" } },
          styles
        }
      }
    ]
  },
  {
    name: "shadcn-kit",
    input: resolve(showcase, "src/react-sources/shadcn-kit.tsx"),
    output: resolve(outDir, "shadcn-kit.js"),
    registrations: [
      {
        tagName: "lab-shadcn-kit",
        component: "ShadcnKit",
        options: {
          shadow: { mode: "open" },
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
