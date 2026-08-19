/**
 * Resolve public profile photos via unavatar.io (documented public avatar API).
 * Optional UNAVATAR_API_KEY raises rate limits; missing key degrades gracefully.
 */

export type FetchAvatarOptions = {
  /** Delay between remote calls (ms). */
  delayMs?: number;
  fetchImpl?: typeof fetch;
  apiKey?: string | undefined;
  /** Base URL override (tests). */
  baseUrl?: string;
};

export type FetchedAvatar = {
  /** Public resolver URL used (stable for CSV / email). */
  resolverUrl: string;
  bytes: Uint8Array;
  contentType: string;
};

const DEFAULT_BASE = "https://unavatar.io";

let lastRequestAt = 0;

async function rateLimit(delayMs: number): Promise<void> {
  const now = Date.now();
  const wait = lastRequestAt + delayMs - now;
  if (wait > 0) {
    await Bun.sleep(wait);
  }
  lastRequestAt = Date.now();
}

function buildHeaders(apiKey: string | undefined): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "image/png,image/*,*/*",
  };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }
  return headers;
}

export function xUnavatarUrl(handle: string, baseUrl = DEFAULT_BASE): string {
  return `${baseUrl}/x/${encodeURIComponent(handle)}?fallback=false`;
}

export function linkedInUnavatarUrl(
  username: string,
  kind: "user" | "company" = "user",
  baseUrl = DEFAULT_BASE,
): string {
  return `${baseUrl}/linkedin/${kind}:${encodeURIComponent(username)}?fallback=false`;
}

/**
 * Fetch an avatar image. Returns null on 404 / network errors (does not throw).
 */
export async function fetchAvatarImage(
  resolverUrl: string,
  options: FetchAvatarOptions = {},
): Promise<FetchedAvatar | null> {
  const delayMs = options.delayMs ?? 500;
  const fetchImpl = options.fetchImpl ?? fetch;
  const apiKey = options.apiKey ?? process.env.UNAVATAR_API_KEY;

  try {
    await rateLimit(delayMs);
    const response = await fetchImpl(resolverUrl, {
      headers: buildHeaders(apiKey),
      redirect: "follow",
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "application/octet-stream";
    if (!contentType.startsWith("image/")) {
      return null;
    }

    const buffer = new Uint8Array(await response.arrayBuffer());
    if (buffer.byteLength === 0) {
      return null;
    }

    return {
      resolverUrl,
      bytes: await ensurePngBytes(buffer, contentType),
      contentType: "image/png",
    };
  } catch (error) {
    console.warn(`Avatar fetch failed for ${resolverUrl}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/** PNG signature */
const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;

function isPng(bytes: Uint8Array): boolean {
  if (bytes.length < PNG_SIG.length) return false;
  return PNG_SIG.every((b, i) => bytes[i] === b);
}

/**
 * Prefer real PNG bytes. When the source is already PNG, return as-is.
 * Otherwise try ImageMagick (`magick` / `convert`) if installed; if conversion
 * fails, wrap is skipped and original bytes are returned so the run continues
 * (file is still written under the `.png` path for local caching).
 */
export async function ensurePngBytes(
  bytes: Uint8Array,
  contentType: string,
): Promise<Uint8Array> {
  if (isPng(bytes) || contentType.includes("png")) {
    return bytes;
  }

  const magick = Bun.which("magick") ?? Bun.which("convert");
  if (!magick) {
    return bytes;
  }

  const tmpIn = `/tmp/avatar-in-${crypto.randomUUID()}`;
  const tmpOut = `/tmp/avatar-out-${crypto.randomUUID()}.png`;
  try {
    await Bun.write(tmpIn, bytes);
    const proc = Bun.spawn([magick, tmpIn, tmpOut], {
      stdout: "ignore",
      stderr: "pipe",
    });
    const code = await proc.exited;
    if (code !== 0) {
      return bytes;
    }
    const converted = new Uint8Array(await Bun.file(tmpOut).arrayBuffer());
    return converted.byteLength > 0 ? converted : bytes;
  } catch {
    return bytes;
  } finally {
    try {
      await Bun.$`rm -f ${tmpIn} ${tmpOut}`.quiet();
    } catch {
      // ignore cleanup errors
    }
  }
}

/** Reset rate-limit clock (tests). */
export function resetRateLimitClock(): void {
  lastRequestAt = 0;
}
