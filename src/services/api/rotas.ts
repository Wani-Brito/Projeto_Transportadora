// Camada de serviço de Rotas — preparada para integração com backend próprio (REST + JWT).
// Hoje delega à persistência local; basta trocar a implementação por chamadas HTTP.

import {
  addRota,
  deleteRota,
  getRotas,
  getRotasByMotorista,
  updateRota,
  buildMapsUrl,
} from "@/lib/rotasStorage";
import type { Rota, NovaRotaInput, RotaStatus } from "@/types/rota";

export const rotasService = {
  list: async (): Promise<Rota[]> => getRotas(),
  listByMotorista: async (motoristaId: string): Promise<Rota[]> =>
    getRotasByMotorista(motoristaId),
  create: async (input: NovaRotaInput): Promise<Rota> => addRota(input),
  update: async (id: string, patch: Partial<Rota>): Promise<void> => updateRota(id, patch),
  remove: async (id: string): Promise<void> => deleteRota(id),
  setStatus: async (id: string, status: RotaStatus): Promise<void> =>
    updateRota(id, { status }),
  getMapsUrl: (rota: Rota): string => buildMapsUrl(rota),
};

export type { Rota, NovaRotaInput, RotaStatus };
