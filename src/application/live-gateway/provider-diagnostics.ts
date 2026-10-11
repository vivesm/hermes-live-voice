/** Internal metadata only: never serialize provider payloads or exception text. */
export type ProviderErrorSource = "transport" | "provider" | "connect";

const TRANSPORT_ERROR_CODES = new Set([
  "ECONNRESET", "ECONNREFUSED", "ECONNABORTED", "EPIPE", "ETIMEDOUT", "ENOTFOUND", "EAI_AGAIN",
]);

export class ProviderSessionDiagnostics {
  private attemptAt?: number;
  private openedAt?: number;
  private lastInputAt?: number;
  private lastOutputAt?: number;
  private errorReported = false;
  private transportErrorReported = false;
  private closeReported = false;
  private transportErrorCode = "unknown";

  beginAttempt(): void {
    this.attemptAt = monotonicNow();
    this.openedAt = undefined;
    this.lastInputAt = undefined;
    this.lastOutputAt = undefined;
    // Budgets belong to the gateway session, including repeated start attempts.
  }

  opened(): void {
    if (this.openedAt === undefined) this.openedAt = monotonicNow();
  }

  inputAccepted(): void {
    this.lastInputAt = monotonicNow();
  }

  outputObserved(): void {
    this.lastOutputAt = monotonicNow();
  }

  error(error: unknown, source: ProviderErrorSource): Record<string, unknown> | undefined {
    if (source === "transport") {
      if (this.transportErrorReported) return undefined;
      this.transportErrorReported = true;
      this.transportErrorCode = transportErrorCode(error);
    } else if (this.errorReported) {
      return undefined;
    }
    this.errorReported = true;
    return { errorSource: source, ...this.snapshot() };
  }

  closed(event: unknown): Record<string, unknown> | undefined {
    if (this.closeReported) return undefined;
    this.closeReported = true;
    return { providerCode: providerCloseCode(event), ...this.snapshot() };
  }

  snapshot(): Record<string, unknown> {
    const now = monotonicNow();
    return {
      transportErrorCode: this.transportErrorCode,
      connectionAttemptMs: age(now, this.attemptAt),
      connectionLifetimeMs: age(now, this.openedAt),
      // Input means a resolved client audio/text/end operation; output means
      // an observed assistant audio/text event, not a user transcript/control.
      lastInputAgeMs: age(now, this.lastInputAt),
      lastOutputAgeMs: age(now, this.lastOutputAt),
    };
  }
}

export function providerCloseCode(event: unknown): number | null {
  const code = field(event, "code");
  return typeof code === "number" && Number.isInteger(code) && code >= 1_000 && code <= 4_999 ? code : null;
}

function transportErrorCode(error: unknown): string {
  // SDK ErrorEvents may wrap the actual socket error once. Never inspect text.
  const code = field(error, "code") ?? field(field(error, "error"), "code");
  return typeof code === "string" && TRANSPORT_ERROR_CODES.has(code) ? code : "unknown";
}

function field(value: unknown, key: string): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  try {
    return (value as Record<string, unknown>)[key];
  } catch {
    return undefined;
  }
}

function monotonicNow(): number | undefined {
  const value = performance.now();
  return Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER ? value : undefined;
}

function age(now: number | undefined, then: number | undefined): number | null {
  if (now === undefined || then === undefined || now < then) return null;
  const elapsed = now - then;
  return Number.isFinite(elapsed) && elapsed <= Number.MAX_SAFE_INTEGER ? Math.floor(elapsed) : null;
}
