// Authentification locale par code PIN + mot de passe partagés (pas de compte
// nominatif) : convient à un petit groupe fermé qui partage les deux codes.
// Vérification par hachage SHA-256 — aucun des deux secrets n'apparaît en
// clair dans le code source.

export interface Credentials {
  pin: string;
  password: string;
}

// sha256("<pin>|<mot de passe>"), en minuscules hexadécimal.
// Remplacer par le vrai hash avant mise en service (voir LISEZMOI.md,
// calculé avec generer-hash.html).
const CREDENTIALS_HASH = "958215c3001b522143b6697329077ca6254c0bf5769a4c16357e681ba6e40fbb";

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function checkLogin(pin: string, password: string): Promise<boolean> {
  if (!CREDENTIALS_HASH) return false; // non configuré : accès refusé par défaut
  const hash = await sha256Hex(`${pin.trim()}|${password}`);
  return hash === CREDENTIALS_HASH;
}

/** Utilitaire de configuration : calcule le hash à coller dans CREDENTIALS_HASH. */
export async function computeHash(pin: string, password: string): Promise<string> {
  return sha256Hex(`${pin.trim()}|${password}`);
}
