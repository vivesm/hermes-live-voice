# Provider diagnostics local test evidence

Worktree: `/Users/melvin/Developer/hermes-live-cutoff-diagnostics-wt`

Branch: `slice/voice-cutoff-diagnostics`

Base: `3bb74b236659e6a167bc3ee40a934dd2402462e5`

Frozen tested source commit: `1e61fe403fc468322af7ad72c93515e2148f53c8`

Date: 2026-10-11. Native Sol implementation lane. Node `v26.7.0`.

## Changes and scope

Provider adapters now mark actual socket/SDK transport errors through an additive internal callback argument. A separate metadata-only close callback supplies numeric transport closure information, including pre-ready local-provider closes, while preserving each adapter's existing operational close/readiness behavior. No public protocol schemas, browser clients, dashboard, installed plugins/configuration, services, provider selection, retries, heartbeats or deadlines changed.

Gateway logs retain the existing internal `live_...` session ID. Fixed records include a validated numeric close code or `null`; an exact allowlisted transport error code or `unknown`; monotonic connection attempt/open lifetime; and ages of the most recent accepted client audio/text/end operation and observed assistant audio/text output. User transcripts and response lifecycle events do not count as assistant output. Timing is floored to nonnegative safe integers; missing, nonfinite, negative, out-of-range or backwards timing becomes `null`.

The strict code allowlist is `ECONNRESET`, `ECONNREFUSED`, `ECONNABORTED`, `EPIPE`, `ETIMEDOUT`, `ENOTFOUND`, `EAI_AGAIN`. Provider payload codes and free-form error messages cannot supply a transport code. SDK ErrorEvents may wrap the actual transport error once. A first real transport error remains separately observable if a provider/connect error arrived earlier. Across a gateway session, the new callback diagnostics produce at most two error records and one close record; duplicate callbacks also suppress duplicate mirrored provider-error log lines, while retaining existing public frames.

Input, cancellation, close, invalid-provider-event and notification speech failure logs use fixed error identifiers instead of exception text. Provider/startup failure messages are omitted from mirrored failure logs, and provider failures cannot enter the Hermes-specific startup error projection. No speech, transcript, prompt, raw provider payload, credential, close reason or free-form exception text enters these new diagnostics.

## Executed checks

| Command | Observed result |
| --- | --- |
| Parent `npm ci --ignore-scripts` | Exit 0; 92 packages added; zero audit vulnerabilities. Existing `node-domexception@1.0.0` deprecation warning. Log inspected. |
| `node --version` | `v26.7.0` |
| Baseline `npm test` before implementation | Exit 0; 42 files, 771 tests passed; no skips. |
| `npm test -- test/live-websocket.test.ts -t 'bounded provider diagnostics'` before implementation | Expected RED: 15 assertion failures, 58 tests skipped by filter. Missing diagnostics, unbounded duplicates, pre-ready omission, unsafe input/close log text. No import/setup failure. |
| `npm test -- test/huggingface-realtime.test.ts test/gemini-live.test.ts -t 'diagnos\|marks SDK'` before metadata close callback | Expected RED: two assertion failures for missing numeric diagnostic callbacks; 60 filtered skips. |
| `npm test -- test/live-websocket.test.ts -t 'keeps cancellation and invalid'` before event-log sanitization | Expected RED: one assertion failure proving private exception text entered the event log; 73 filtered skips. |
| `npm test -- test/live-websocket.test.ts -t 'persists notification speech only\|keeps a later real transport'` before notification/duplicate-log changes | Expected RED: two assertion failures proving raw notification error text and 200 duplicate mirrored log records; 72 filtered skips. |
| Intermediate scoped provider/gateway tests | Exit 0; four files, 204 tests passed. Subsequent full run includes the added privacy/audio regressions. |
| Initial `npm run typecheck` | Exit 1: TS6133 at the two close-promise catch parameters after sanitization. Removed unused parameters. |
| Final `npm run typecheck` | Exit 0; no diagnostics. |
| `npm run build` | Exit 0; local `dist` rebuilt successfully. Generated output is ignored and was not committed/installed. |
| `node scripts/gateway-smoke.mjs --live-provider mock` | Exit 0; `Gateway smoke ok (mock provider)`. Explicit loopback mock only; no Docker option or external provider. |
| Final `npm test` | Exit 0; 42 files, **791 tests passed**, no skipped tests, no failures. 14.16 seconds. |
| `git diff --check` | Source working tree: exit 0. The later base-to-HEAD check flagged four Markdown hard-break trailing-space lines in this report (exit 2); normalized those report-only lines and reran cleanly. |

Raw local command outputs are in ignored `.lanes/artifacts/*-tests.log`, `diagnostics-red.log`, `adapter-close-red.log`, `provider-event-privacy-red.log`, `notification-and-duplicate-red.log`, `typecheck*.log`, `build.log`, and `gateway-mock.log`. Synthetic privacy markers in intentional RED output are test fixtures, never captured production speech/credentials.

## Remaining gates and limits

The full `npm run verify` was not invoked: it includes provider smoke commands outside this brief plus unrelated package/plugin checks. No paid/provider smoke, external provider request, container command, remote mutation, merge, push, deployment or service restart occurred. Tests used loopback/fake boundaries and temporary test state; production recordings, history, task state and accounting were untouched.

The matching source/base evidence is in `source-identity.md`, including public provenance, all 223 deployed package/client hash matches, and the parent's independent unchanged-source rebuild matching all 220 deployed dist files. The attestation signature was not independently verified. This candidate has not been installed or exercised against the observed deployed incident.

Close `1006` remains undiagnosed. These records capture the first observed transport/error/close boundary and coarse gateway timings; they do not establish the provider's underlying disconnect cause, remote receipt of input, audible playback, or end-to-end reliability. Log budgets preserve only the first relevant callback records across repeated start attempts, and unallowlisted/absent codes remain `unknown`.

Independent native Astra exact-commit review is still required. Melvin approval remains required before merge/rollout. The desktop 60-second hearing-question/two-exchange paid speech trial and physical iPhone acceptance are separate future gates. Canonical `t_3f828e71` stays open.
