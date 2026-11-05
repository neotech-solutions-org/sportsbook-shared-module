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
