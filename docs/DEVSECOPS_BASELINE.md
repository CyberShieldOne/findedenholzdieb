# DevSecOps proposed baseline – findedenholzdieb (2026-11-16)

Status: draft proposal; not deployed and not enforced.

Repository evidence: package.json declares pnpm@11.25.0 and pnpm-lock.yaml; no .github/workflows or Dependabot configuration was found on main.

This draft adds GitHub-native Dependabot version-update PRs for GitHub Actions **only**, plus an advisory-only pnpm audit GitHub Actions workflow. GitHub's documented Dependabot range covers pnpm v7–v10, while this repo pins pnpm@11.25.0; native pnpm v11 version updates are therefore BLOCKED_UNSUPPORTED pending vendor support, with no custom replacement. On high/critical advisories the workflow fails; that result is not a runtime exploit proof. No changes to gameplay, deploy tooling, source code or production systems.

Acceptance: reviewer confirms GitHub Action runs successfully, reviews initial findings and checks the mandatory CI/branch-protection entitlement separately. No auto-merge is configured; Dependabot may propose upgrades but does not install them on production.

## First CI evidence (2026-11-16)

- https://github.com/CyberShieldOne/findedenholzdieb/actions/runs/43894861799: pnpm audit FAILED, 86 dependency advisories (4 Critical, 35 High, 36 Moderate, 11 Low). No runtime reachability assessment or secure upgrade has been performed.
- Native support reference: https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference (pnpm v7–v10 at access date).
