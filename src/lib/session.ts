const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function digest(value: string) {
  return toHex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

export async function createAdminSession(secret: string) {
  return `admin.${await digest(`stayflow-admin:${secret}`)}`;
}

export async function verifyAdminSession(token: string | undefined, secret: string) {
  if (!token) return false;
  return token === (await createAdminSession(secret));
}
