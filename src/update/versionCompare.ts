export function isUpdateAvailable(
  currentVersion: string,
  latestVersion: string
): boolean {
  const current = currentVersion.split(".").map(Number);

  const latest = latestVersion.split(".").map(Number);

  const max = Math.max(current.length, latest.length);

  for (let i = 0; i < max; i++) {
    const c = current[i] || 0;
    const l = latest[i] || 0;

    if (l > c) return true;

    if (l < c) return false;
  }

  return false;
}

// isUpdateAvailable("1.0.0", "1.0.1"); // true