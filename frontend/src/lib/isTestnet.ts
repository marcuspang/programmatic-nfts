export function isTestnet() {
  return false;
  return process.env.NODE_ENV !== "production";
}
