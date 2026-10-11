# AGENTS.md

Isolated standalone Hermes Live Voice diagnostic candidate; it does not authorize changes to installed Hermes or production.

- Source base 3bb74b236659e6a167bc3ee40a934dd2402462e5 matches npm 1.3.0-rc.2 provenance and all 223 deployed dist/client file hashes. See .lanes/reports/source-identity.md.
- Follow ~/.codex/lanes/CONTRACT.md: native Sol/xhigh implements; one independent Astra/xhigh exact-commit review; Melvin approval before merge/rollout. Sole source lane, no agent delegation by implementer.
- Node 22.12+; package scripts: npm ci, npm test, npm run typecheck, npm run build. Default Vitest tests use fake boundaries. Use mock provider only. Never run paid/provider smoke commands.
- Provider adapters live in src/adapters/outbound/realtime; orchestration in src/application/live-gateway. Public protocol schemas, dashboard, clients, installed plugins, gateway configuration and services remain outside this change.
- No credentials, raw speech/prompts, provider payloads or free-form error/close text in new diagnostics. No automatic retry, heartbeat/timeout changes, provider switch or speculative reliability repair.
- No remote mutation, merge/push/deployment/service restart or changes to recordings/history/accounting. Rollback may restore component software only. Desktop paid trial and physical iPhone acceptance remain separate approvals/gates.
