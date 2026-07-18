# Pulled React Projects

These repositories were cloned locally under `compiler-lab/github-projects` for compiler integration checks. The clones are intentionally ignored by Git because they are third-party repositories.

| Project               | Repository                                                             | Commit tested                              | Lab usage                                                                                                                    |
| --------------------- | ---------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| RealWorld React Redux | `https://github.com/gothinkster/react-redux-realworld-example-app.git` | `ee72eba4056392c95a27bc48d385d3f54ba38a18` | Compiles the actual `src/components/Home/Banner.js` file with unchanged `import React from 'react'`.                         |
| Bulletproof React     | `https://github.com/alan2207/bulletproof-react.git`                    | `9506629ed003a561c6627735480cce4994244bb4` | Uses `DashboardInfo` app patterns in an adapter fixture that removes app auth/module dependencies.                           |
| Jira Clone            | `https://github.com/oldboyxx/jira_clone.git`                           | `26a9e77b1789fef9cb43edb5d6018cf1663cf035` | Uses board header/filter/issue-list patterns in an adapter fixture that removes styled-components/shared dependency imports. |

Recreate the clones:

```bash
git clone --depth 1 https://github.com/gothinkster/react-redux-realworld-example-app.git compiler-lab/github-projects/realworld
git clone --depth 1 https://github.com/alan2207/bulletproof-react.git compiler-lab/github-projects/bulletproof-react
git clone --depth 1 https://github.com/oldboyxx/jira_clone.git compiler-lab/github-projects/jira-clone
```
