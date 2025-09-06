export const BACKEND_URL = (() => {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (!base) return "";
  return base.endsWith("/") ? base : base + "/";
})();

