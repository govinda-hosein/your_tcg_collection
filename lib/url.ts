const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "")
  .trim()
  .replace(/\/$/, "");

function normalizePath(path: string): string {
  if (!path) {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export function withBasePath(path: string): string {
  const normalizedPath = normalizePath(path);
  return basePath ? `${basePath}${normalizedPath}` : normalizedPath;
}
