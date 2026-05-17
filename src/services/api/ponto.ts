// Service de Ponto — mock via localStorage, pronto para REST
import { format, parseISO, differenceInMinutes } from "date-fns";
import {
  PUNCH_ORDER,
  type DaySummary,
  type OvertimeRequest,
  type OvertimeStatus,
  type Punch,
  type PunchType,
} from "@/types/ponto";

const PUNCH_KEY = "waekium.ponto.punches.v1";
const OVERTIME_KEY = "waekium.ponto.overtime.v1";
const DEFAULT_EXPECTED_MIN = 8 * 60;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function dateKey(d: Date | string) {
  return typeof d === "string" ? d : format(d, "yyyy-MM-dd");
}

function calcWorkedMinutes(punches: Punch[]): number {
  // Soma (entrada→saida_almoco) + (volta_almoco→saida). Tolerante a faltantes.
  const byType = new Map<PunchType, Punch>();
  punches.forEach((p) => byType.set(p.type, p));
  let total = 0;
  const ent = byType.get("entrada");
  const sa = byType.get("saida_almoco");
  const va = byType.get("volta_almoco");
  const sai = byType.get("saida");
  if (ent && sa) total += differenceInMinutes(parseISO(sa.at), parseISO(ent.at));
  if (va && sai) total += differenceInMinutes(parseISO(sai.at), parseISO(va.at));
  // Fallback: apenas entrada+saida (sem almoço)
  if (total === 0 && ent && sai && !sa && !va) {
    total = differenceInMinutes(parseISO(sai.at), parseISO(ent.at));
  }
  return Math.max(0, total);
}

function summarize(
  employeeId: string,
  date: string,
  all: Punch[],
  expectedMinutes: number = DEFAULT_EXPECTED_MIN,
): DaySummary {
  const punches = all
    .filter((p) => p.employeeId === employeeId && p.at.startsWith(date))
    .sort(
      (a, b) =>
        PUNCH_ORDER.indexOf(a.type) - PUNCH_ORDER.indexOf(b.type) ||
        a.at.localeCompare(b.at),
    );
  const workedMinutes = calcWorkedMinutes(punches);
  return {
    date,
    employeeId,
    punches,
    workedMinutes,
    expectedMinutes,
    diffMinutes: workedMinutes - expectedMinutes,
  };
}

export const pontoService = {
  // ========== Punches ==========
  async listPunches(): Promise<Punch[]> {
    return read<Punch[]>(PUNCH_KEY, []);
  },

  async getDay(
    employeeId: string,
    date: Date | string,
    expectedMinutes?: number,
  ): Promise<DaySummary> {
    return summarize(employeeId, dateKey(date), await this.listPunches(), expectedMinutes);
  },

  async getHistory(
    employeeId: string,
    fromDays = 14,
    expectedMinutes?: number,
  ): Promise<DaySummary[]> {
    const all = await this.listPunches();
    const dates = new Set<string>();
    for (let i = 0; i < fromDays; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.add(format(d, "yyyy-MM-dd"));
    }
    return Array.from(dates)
      .sort((a, b) => b.localeCompare(a))
      .map((d) => summarize(employeeId, d, all, expectedMinutes));
  },

  async punch(employeeId: string, type: PunchType, at: Date = new Date()): Promise<Punch> {
    const list = await this.listPunches();
    const p: Punch = { id: id("pn"), employeeId, type, at: at.toISOString() };
    write(PUNCH_KEY, [p, ...list]);
    return p;
  },

  async deletePunch(punchId: string): Promise<void> {
    const list = await this.listPunches();
    write(
      PUNCH_KEY,
      list.filter((p) => p.id !== punchId),
    );
  },

  // ========== Banco de Horas ==========
  async getBancoHoras(
    employeeId: string,
    days = 30,
    expectedMinutes?: number,
  ): Promise<number> {
    const history = await this.getHistory(employeeId, days, expectedMinutes);
    // Somatório dos diffs (positivo = saldo a favor)
    return history.reduce((acc, d) => acc + (d.punches.length > 0 ? d.diffMinutes : 0), 0);
  },

  // ========== Horas Extras ==========
  async listOvertime(): Promise<OvertimeRequest[]> {
    return read<OvertimeRequest[]>(OVERTIME_KEY, []);
  },

  async requestOvertime(input: {
    employeeId: string;
    date: string;
    hours: number;
    reason?: string;
  }): Promise<OvertimeRequest> {
    const list = await this.listOvertime();
    const req: OvertimeRequest = {
      id: id("oh"),
      employeeId: input.employeeId,
      date: input.date,
      hours: input.hours,
      reason: input.reason,
      status: "pendente",
      createdAt: Date.now(),
    };
    write(OVERTIME_KEY, [req, ...list]);
    return req;
  },

  async reviewOvertime(
    requestId: string,
    status: Exclude<OvertimeStatus, "pendente">,
    reviewerId = "admin",
  ): Promise<void> {
    const list = await this.listOvertime();
    write(
      OVERTIME_KEY,
      list.map((r) =>
        r.id === requestId
          ? { ...r, status, reviewedAt: Date.now(), reviewedBy: reviewerId }
          : r,
      ),
    );
  },

  async deleteOvertime(requestId: string): Promise<void> {
    const list = await this.listOvertime();
    write(
      OVERTIME_KEY,
      list.filter((r) => r.id !== requestId),
    );
  },
};

export function formatMinutes(mins: number): string {
  const sign = mins < 0 ? "-" : "";
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${h}h${String(m).padStart(2, "0")}`;
}
