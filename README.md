# golangci-lint-npm

A simple wrapper to install and run [`golangci-lint`](https://golangci-lint.run/) via npm.  
Designed for projects that use npm to manage developer tooling — even in Go environments.

> **Note:** This package supports `golangci-lint` **v1.11 or later**.

## Overview

Installing `golangci-lint` via `go get`, `go install`, the "tools pattern",  
or the new [`tool` directives](https://tip.golang.org/doc/go1.24#tools) introduced in Go 1.24 is
discouraged for several reasons.  
(<https://golangci-lint.run/welcome/install/#install-from-sources>)

**`golangci-lint-npm`** is a simple npm wrapper for the recommended official binary install script.

- Run `npx golangci-lint` just like the native CLI — no manual binary management
- Automatically checks for the binary at runtime and downloads it if missing
- Supports version pinning via `.golangci-version` or an environment variable

## Installation

```sh
npm install golangci-lint-npm --save-dev
```

## Usage

Create a `.golangci-version` file to specify the desired `golangci-lint` version for your project:

```sh
echo "2.1.6" > .golangci-version
```

Then run the linter:

```sh
npx golangci-lint run ./...
```

Alternatively, you can define a script in your `package.json`:

```json
"scripts": {
  "golangci-lint": "golangci-lint run dir1 dir2/..."
}
```

```sh
npm run golangci-lint
```

## Configuration

### Binary Location

- `--bin-root <path>`
  - Specifies the root directory to store the `golangci-lint` binaries.  
    The binary will be located at `<path>/v<VERSION>/golangci-lint`.  
    (Default: `node_modules/golangci-lint-npm/bin/v<VERSION>/golangci-lint`)

```sh
# The final binary path will be ./bin/v<VERSION>/golangci-lint
npx golangci-lint --bin-root ./bin run
```

This is useful in environments like CI where `node_modules` is removed on each run.

### Environment Variable

You can also specify the version using the `GOLANGCI_VERSION` environment variable:

```sh
GOLANGCI_VERSION="2.1.0" npm run golangci-lint
```

The version is resolved in the following order:

1. The `GOLANGCI_VERSION` environment variable
2. The `.golangci-version` file
3. The default fallback version defined by this package

## Example Setup

Example `package.json` script:

```json
"scripts": {
  "prettier": "prettier --write .",
  "golangci-lint": "golangci-lint --bin-root ./bin/golangci-lint run"
}
```

Example `Makefile`:

```makefile
.PHONY: format
format: node_modules ## Run formatters.
	go fmt
	npm run prettier

.PHONY: lint
lint: node_modules ## Run linters.
	go vet
	npm run golangci-lint

.PHONY: node_modules
node_modules: ## Install node modules.
	npm ci
```

Example GitHub Actions workflow:

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-go@v5
    with:
      go-version-file: go.mod
  - uses: actions/setup-node@v4
    with:
      node-version-file: .node-version
      cache: npm
  - uses: actions/cache@v4
    with:
      path: bin/golangci-lint
      key: golangci-lint-${{ runner.arch }}-${{ runner.os }}-${{hashFiles('.golangci-version') }}

  - name: Format
    run: make format

  - name: Lint
    run: make lint
```

Running `make lint` both locally and in CI ensures consistent linter versions and behavior across
all environments.
