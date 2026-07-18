# Pulled React Projects

These repositories were cloned locally under `compiler-lab/github-projects` for compiler integration checks. The clones are intentionally ignored by Git because they are third-party repositories.

| Project                  | Repository                                                | Commit tested                              | Apps/packages found                                             | Lab usage                                                                                                                                         |
| ------------------------ | --------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| react-large-project-demo | `https://github.com/mucsi96/react-large-project-demo.git` | `9346ccae3af1ce6cb9b479991cc8eea84f8f1163` | `packages/app`, `packages/friends`, `packages/core`, `mock-api` | Uses the app shell and friends feature package patterns in a compiled `lab-large-project-app` full app demo.                                      |
| jira_clone               | `https://github.com/oldboyxx/jira_clone.git`              | `26a9e77b1789fef9cb43edb5d6018cf1663cf035` | `client`, `api`                                                 | Uses the client Project/Board, Lists, filters, issue cards, and detail-panel patterns in a compiled `lab-jira-app` full app demo.                 |
| chakra-ui                | `https://github.com/chakra-ui/chakra-ui.git`              | `a7e3e0e62d4b259f2caa2886ab17f331105cec6f` | `apps/www`, `apps/compositions`, `packages/react`               | Uses the docs app, composition registry, theme context, recipes, and component primitive patterns in a compiled `lab-chakra-ui-app` library demo. |

Recreate the clones:

```bash
git clone --depth 1 https://github.com/mucsi96/react-large-project-demo.git compiler-lab/github-projects/react-large-project-demo
git clone --depth 1 https://github.com/oldboyxx/jira_clone.git compiler-lab/github-projects/jira-clone
git clone --depth 1 https://github.com/chakra-ui/chakra-ui.git compiler-lab/github-projects/chakra-ui
```
