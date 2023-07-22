export function isTestnet() {
  return process.env.NODE_ENV !== "production";
}
