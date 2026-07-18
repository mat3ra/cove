[![npm version](https://badge.fury.io/js/%40exabyte-io%2Fcove.svg)](https://badge.fury.io/js/%40exabyte-io%2Fcove)
[![License: Apache](https://img.shields.io/badge/License-Apache-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

# cove

cove houses entity definitions for use in the Mat3ra platform.


### Installation

For usage within a javascript project:

```bash
npm install @mat3ra/cove.js
```

For development:

```bash
git clone https://github.com/mat3ra/cove.js.git
cd cove.js
npm install
npm run transpile
```

How to link cove.js to host app:
```bash
rm -rf {PATH}/exabyte-stack/web-app/src/application/node_modules/@mat3ra/cove.js/dist
ln -s "$(pwd)/dist/" /{ABSOLUTE_PATH}/exabyte-stack/web-app/src/application/node_modules/@mat3ra/cove.js
restart host app (web-app, wave etc.)
```

another approach is to access cove from repo

```bash
push your branch
replace cove.js version with url in package.json
"@mat3ra/cove.js": "https://github.com/mat3ra/cove.js#cc48da9652840eb0f7d8854e02cb690484e6fab1",
```
make sure to install appropriate versions of peerDependencies from cove.js to host app

DO NOT use `npm link` as it leads to having multiple react libs in app.
See links:
https://github.com/facebook/react/issues/13991
https://legacy.reactjs.org/warnings/invalid-hook-call-warning.html#duplicate-react

### Typescript

Typescript and all necessary type dependencies must be present in dependency section of package.json in order
to transpile files and generate type definitions during package installation on postinstall command.
It is necessary for testing arbitrary branches for example as dependency
git+https://github.com/mat3ra/cove.js.git#b7604da7717232ac38a6372fea603f0b04645ade in web-app.

### Contribution

This repository is an [open-source](LICENSE.md) work-in-progress and we welcome contributions.

We regularly deploy the latest code containing all accepted contributions online as part of the
[Mat3ra.com](https://mat3ra.com) platform, so contributors will see their code in action there.

See [ESSE](https://github.com/Exabyte-io/esse) for additional context regarding the data schemas used here.

Useful commands for development:

```bash
# run linter without persistence
npm run lint

# run linter and save edits
npm run lint:fix

# compile the library
npm run transpile

# run tests
npm run test
```

## Using Linter

Linter setup will prevent committing files that don't adhere to the code standard. It will
attempt to fix what it can automatically prior to the commit in order to reduce diff noise. This can lead to "unexpected" behavior where a
file that is staged for commit is not identical to the file that actually gets committed. This happens
in the `lint-staged` directive of the `package.json` file (by using a `husky` pre-commit hook). For example,
if you add extra whitespace to a file, stage it, and try to commit it, you will see the following:

```bash
➜  repo-js git:(feature/cool-feature) ✗ git commit -m "Awesome feature works great"
✔ Preparing...
✔ Running tasks...
✖ Prevented an empty git commit!
✔ Reverting to original state because of errors...
✔ Cleaning up...

  ⚠ lint-staged prevented an empty git commit.
  Use the --allow-empty option to continue, or check your task configuration

husky - pre-commit hook exited with code 1 (error)
```

The staged change may remain but will not have been committed. Then it will look like you still have a staged
change to commit, but the pre-commit hook will not actually commit it for you, quite frustrating! Styling can
be applied manually and fixed by running:

```bash
npm run lint:fix
```

In which case, you may need to then add the linter edits to your staging, which in the example above, puts the
file back to identical with the base branch, resulting in no staged changes whatsoever.

## Notes

Legacy Exabyte.io colors: main: "#1056BE", dark: "#0A3677", light: "#0A6EBD".
