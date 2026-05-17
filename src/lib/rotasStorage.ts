// Persistência local das rotas (mock).
// Estrutura preparada para futura troca por API REST do backend próprio.

import type { Rota, NovaRotaInput } from "@/types/rota";

const KEY = "waekium.rotas.v1";

function read(): Rota[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: Rota[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getRotas(): Rota[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function getRotasByMotorista(motoristaId: string): Rota[] {
  return getRotas().filter((r) => r.motoristaId === motoristaId);
}

export function addRota(input: NovaRotaInput): Rota {
  const now = Date.now();
  const rota: Rota = {
    ...input,
    id: `rota_${now.toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    status: input.status ?? "pendente",
    createdAt: now,
    updatedAt: now,
  };
  write([rota, ...read()]);
  return rota;
}

export function updateRota(id: string, patch: Partial<Omit<Rota, "id" | "createdAt">>) {
  const list = read().map((r) =>
    r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r,
  );
  write(list);
}

export function deleteRota(id: string) {
  write(read().filter((r) => r.id !== id));
}

// ---- Helpers de Google Maps ----

/** Gera URL do Google Maps a partir de origem/destino se mapsUrl não for informado. */
export function buildMapsUrl(
  rota: Pick<Rota, "origem" | "destino" | "mapsUrl">
): string {

  // se usuário digitou coordenadas
  if (
    rota.mapsUrl &&
    rota.mapsUrl.includes(",") &&
    !rota.mapsUrl.includes("http")
  ) {

    const coords = rota.mapsUrl.trim();

    return `https://www.google.com/maps?q=${coords}`;
  }

  // se já for URL
  if (rota.mapsUrl?.trim()) {
    return rota.mapsUrl.trim();
  }

  // gera automaticamente usando origem/destino
  const o = encodeURIComponent(rota.origem);
  const d = encodeURIComponent(rota.destino);

  return `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}&travelmode=driving`;
}
