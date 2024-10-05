export default function genSimpleKey(size = 6) {
  const array = new Uint8Array(size);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}
