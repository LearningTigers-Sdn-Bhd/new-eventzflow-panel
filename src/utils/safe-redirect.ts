/**
 * Returns `path` only when it is a same-site path such as "/dashboard" or
 * "/invite/host/abc?x=1". Anything that could leave the site ("//evil.com",
 * "/\evil.com", "https://evil.com", or a path hiding tabs/newlines that the
 * browser strips before navigating) returns null so callers can fall back.
 */
export function safeRedirect(path: string | null | undefined): string | null {
	if (!path?.startsWith("/")) return null;
	if (path.startsWith("//") || path.startsWith("/\\")) return null;
	if ([...path].some((char) => char.charCodeAt(0) < 32)) return null;
	return path;
}
