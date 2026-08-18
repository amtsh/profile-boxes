export const LONDON = { lat: 51.5074, lon: -0.1278 };
export const STRATFORD = { lat: 52.1917, lon: -1.7083 };

export function hostLabel(url: string): { title: string; host: string } {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const name = host.split(".")[0] ?? host;
    return { host, title: name.charAt(0).toUpperCase() + name.slice(1) };
  } catch {
    return { host: url, title: url };
  }
}

/** Best-effort page title. Falls back to the hostname if the preview API is unreachable. */
export async function unfurlLink(url: string): Promise<{ title: string; description: string }> {
  const fallback = hostLabel(url);
  try {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(4500),
    });
    if (!res.ok) return { title: fallback.title, description: fallback.host };
    const json = (await res.json()) as {
      data?: { title?: string; description?: string };
    };
    const title = json.data?.title?.trim();
    const description = json.data?.description?.trim();
    return {
      title: title || fallback.title,
      description: description || fallback.host,
    };
  } catch {
    return { title: fallback.title, description: fallback.host };
  }
}

export function mapImageUrl(lat: number, lon: number): string {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=14&size=600x400&maptype=mapnik`;
}

export function mapEmbedUrl(lat: number, lon: number): string {
  const pad = 0.02;
  const bbox = `${lon - pad},${lat - pad * 0.75},${lon + pad},${lat + pad * 0.75}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lon}`;
}

export async function geocodePlace(
  place: string,
): Promise<{ lat: number; lon: number; label: string } | null> {
  const q = place.trim();
  if (!q) return null;
  try {
    const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=1`, {
      signal: AbortSignal.timeout(4500),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      features?: { geometry?: { coordinates?: [number, number] }; properties?: { name?: string } }[];
    };
    const feature = json.features?.[0];
    const coords = feature?.geometry?.coordinates;
    if (!coords) return null;
    const [lon, lat] = coords;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon, label: feature?.properties?.name?.trim() || q };
  } catch {
    return null;
  }
}
