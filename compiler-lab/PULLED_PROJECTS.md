# Pulled React Projects

These repositories were cloned locally under `compiler-lab/github-projects` for compiler integration checks. The clones are intentionally ignored by Git because they are third-party repositories.

| Project               | Repository                                                             | Commit tested                              | Lab usage                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| RealWorld React Redux | `https://github.com/gothinkster/react-redux-realworld-example-app.git` | `ee72eba4056392c95a27bc48d385d3f54ba38a18` | Uses article feed, tag, favorite, and editor patterns in a full app fixture compiled as `lab-realworld-app`.                            |
| Bulletproof React     | `https://github.com/alan2207/bulletproof-react.git`                    | `9506629ed003a561c6627735480cce4994244bb4` | Uses dashboard, auth context, role permission, metric, and data-table patterns in a full app fixture compiled as `lab-bulletproof-app`. |
| Jira Clone            | `https://github.com/oldboyxx/jira_clone.git`                           | `26a9e77b1789fef9cb43edb5d6018cf1663cf035` | Uses sidebar, filter, Kanban columns, issue cards, and detail-panel patterns in a full app fixture compiled as `lab-jira-app`.          |
| shadcn/ui             | `https://github.com/shadcn-ui/ui.git`                                  | `d28738b183c5eaa69d8d540826e450f30d39ab6c` | Uses cloned component-library variant patterns in a design-system workbench fixture compiled as `lab-shadcn-kit`.                       |

Recreate the clones:

```bash
git clone --depth 1 https://github.com/gothinkster/react-redux-realworld-example-app.git compiler-lab/github-projects/realworld
git clone --depth 1 https://github.com/alan2207/bulletproof-react.git compiler-lab/github-projects/bulletproof-react
git clone --depth 1 https://github.com/oldboyxx/jira_clone.git compiler-lab/github-projects/jira-clone
git clone --depth 1 https://github.com/shadcn-ui/ui.git compiler-lab/github-projects/shadcn-ui
```
