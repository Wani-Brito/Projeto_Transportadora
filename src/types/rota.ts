// Tipagem do módulo de Rotas (admin -> motorista mobile)

export type RotaStatus = "pendente" | "em_andamento" | "finalizada" | "cancelada";

export type Rota = {
  id: string;
  nome: string;                // ex: "Entrega Centro - SP"
  motoristaId: string;         // Employee.id
  origem: string;              // endereço de origem
  destino: string;             // endereço de destino
  observacoes?: string;
  mapsUrl?: string;            // link Google Maps OU coordenadas (lat,lng)
  data?: string;               // yyyy-MM-dd opcional
  horario?: string;            // HH:mm opcional
  status: RotaStatus;
  createdAt: number;
  updatedAt: number;
};

export type NovaRotaInput = Omit<Rota, "id" | "status" | "createdAt" | "updatedAt"> & {
  status?: RotaStatus;
};
