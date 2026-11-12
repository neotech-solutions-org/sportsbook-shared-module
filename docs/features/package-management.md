# Package management

Use pnpm 12.16.1, selected by the exact `packageManager` pin in `package.json`.
Enable Corepack before running repository commands:

```bash
corepack enable
pnpm --version
pnpm install --frozen-lockfile
```

Commit the pnpm lockfile with dependency changes. CI and Docker builds use frozen installs
and copy `pnpm-workspace.yaml` before installation. The workspace policy preserves existing
peer exceptions, security overrides, release-age exclusions, and lifecycle-script decisions.
Newly published dependencies have a one-day cooldown unless an existing policy says otherwise.

Keep application dependency upgrades separate from this package-manager migration. Verify a
clean install, the available lint/type-check/build/unit checks, and a lower-environment smoke
test before deployment. Package publication and production deployment remain separate steps.

Private Git dependencies use the machine's existing Git credential helper. SSH-only runners
must configure Git to rewrite GitHub HTTPS URLs to SSH and forward their SSH agent when needed.
Do not put credentials in manifests or lockfiles.

Roll out one repository at a time. Watch install failures, missing generated/native modules,
application startup, and existing smoke checks. Roll back with the previous application
artifact, or revert the manifest, workspace settings, lockfile, and CI changes together.

## GitHub dependency scanning

The `Dependency submission` workflow scans both documents of `pnpm-lock.yaml` with
Microsoft Component Detection 9.1.0 and submits the graph to GitHub's dependency
submission API. This includes application dependencies that single-document readers
can miss. Keep both lockfile documents and package-manager enforcement intact.

The scanner binary is pinned by version and SHA256; checkout and GitHub Script actions
are pinned by commit. Only the static Pnpm detector runs. Application dependencies,
private Git packages and lifecycle scripts are not installed or executed. The submission
step percent-encodes package URL components, including private Git dependency versions,
and preserves direct/transitive relationships and runtime/development scopes. Scanner
errors, incomplete identities, empty results and manager-only graphs fail the workflow
instead of uploading an empty or partial snapshot.

Runs start when dependency inputs or this workflow change on any branch, or manually.
A stable `pnpm-lockfile` correlator replaces earlier submissions from this workflow.
The submission job alone receives `contents: write` for the repository token; checkout
does not persist credentials. Dependency graph must be enabled and organization policy
must permit the pinned actions and write permission. Resolve permission or API failures
rather than suppressing them.

After merging, confirm a successful default-branch run and check Insights > Dependency
graph for application packages, not just pnpm. Branch submissions do not restore
default-branch alerts before merge. Existing audit commands and Dependabot update
configuration remain separate from this graph submission.

References: [multi-document scanner support](https://github.com/microsoft/component-detection/releases/tag/v8.0.5)
and [GitHub dependency submission API](https://docs.github.com/en/rest/dependency-graph/dependency-submission).
