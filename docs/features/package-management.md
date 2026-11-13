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

Set `pmOnFail: ignore` in `pnpm-workspace.yaml` so pnpm does not record its own
package-manager resolution in an extra lockfile document. The committed lockfile
contains only the application dependency graph for GitHub's native scanner.

Use Corepack to select the exact `packageManager` pin in `package.json`. This setting
disables pnpm's own version check and automatic version switching; invoking an unrelated
global pnpm binary bypasses that selection. Frozen installs, existing peer checks,
release cooldowns, overrides and lifecycle restrictions continue to apply.

When updating dependencies, enable Corepack, use the pinned pnpm and commit the
regenerated single-document lockfile. Config dependencies may require an environment
document in future, so reassess scanner compatibility before introducing them.

GitHub Dependency graph must still be enabled in Settings > Advanced Security.
After merging to the default branch, confirm application packages appear in Insights >
Dependency graph. An administrator must enable disabled graphs; changing this lockfile
does not change repository settings. Existing audit commands and Dependabot version
updates remain separate. No custom dependency-submission workflow is required.

References: [pnpm configuration](https://pnpm.io/settings/cli#pmonfail) and the
[upstream workaround](https://github.com/pnpm/pnpm/issues/13805).
