# DevSecOps proposed baseline – findedenholzdieb (2026-11-16)

Status: draft proposal; not deployed and not enforced.

Repository evidence: package.json declares pnpm@11.25.0 and pnpm-lock.yaml; no .github/workflows or Dependabot configuration was found on main.

This draft adds vendor-native Dependabot version-update PRs and an advisory-only pnpm audit GitHub Actions workflow. On high/critical advisories the workflow fails; that result is not a runtime exploit proof. No changes to gameplay, deploy tooling, source code or production systems.

Acceptance: reviewer confirms GitHub Action runs successfully, reviews initial findings and checks the mandatory CI/branch-protection entitlement separately. No auto-merge is configured; Dependabot may propose upgrades but does not install them on production.
