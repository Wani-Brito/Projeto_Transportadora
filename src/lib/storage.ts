import { format } from "date-fns";

export type AgendaEvent = {
  id: string;
  time: string;
  title: string;
  description?: string;
  tag?: string;
};

export type EmployeeStatusValue =
  | "ativo"
  | "ferias"
  | "afastado"
  | "inativo";

export type Employee = {
  id: string;
  name: string;
  role: string;
  cpf?: string;
  cargoId?: import("@/types/cargo").CargoId;
  phone?: string;
  email?: string;
  base?: string;
  photo?: string;
  salary?: number;
  status?: EmployeeStatusValue;
  id_funcao?: number;
};

export const ADMIN_ID = "admin";

const STORAGE_KEY = "waekium.agendas.v1";
const EMP_KEY = "waekium.employees.v2";

const API = "http://localhost:5000";

// ─── Agenda (localStorage) ────────────────────────────────────────────────────

type Store = Record<string, Record<string, AgendaEvent[]>>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

function write(s: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function dateKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export function getEvents(ownerId: string, date: Date): AgendaEvent[] {
  return read()[ownerId]?.[dateKey(date)] ?? [];
}

export function addEvent(ownerId: string, date: Date, ev: AgendaEvent) {
  const s = read();
  const key = dateKey(date);
  s[ownerId] = s[ownerId] || {};
  s[ownerId][key] = [...(s[ownerId][key] || []), ev].sort((a, b) =>
    a.time.localeCompare(b.time),
  );
  write(s);
}

export function deleteEvent(ownerId: string, date: Date, id: string) {
  const s = read();
  const key = dateKey(date);
  if (!s[ownerId]?.[key]) return;
  s[ownerId][key] = s[ownerId][key].filter((e) => e.id !== id);
  write(s);
}

export function getDatesWithEvents(ownerId: string): string[] {
  return Object.keys(read()[ownerId] || {});
}

// ─── Funcionários ─────────────────────────────────────────────────────────────

function readEmployees(): Employee[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EMP_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEmployees(list: Employee[]) {
  localStorage.setItem(EMP_KEY, JSON.stringify(list));
}

/** Leitura sempre do localStorage */
export function getEmployees(): Employee[] {
  return readEmployees();
}

/**
 * Cadastra no backend via POST /cadastrar (multipart/form-data).
 * O backend exige foto — se não houver, envia um placeholder 1x1.
 * Após sucesso, salva no localStorage com o id retornado pelo banco.
 */
export async function addEmployee(data: {
  name: string;
  role: string;
  cpf?: string;
  phone?: string;
  email?: string;
  base?: string;
  photo?: string; // data URL base64
  salary?: number;
  status?: EmployeeStatusValue;
  cargoId?: string;
  id_funcao?: number;
}): Promise<Employee> {

  const form = new FormData();
  form.append("nome",      data.name);
  form.append("cpf",       (data.cpf ?? "").replace(/\D/g, ""));
  form.append("email",     data.email ?? "");
  form.append("telefone",  data.phone ?? "");
  form.append("endereco",  data.base ?? "Não informado");
  form.append("cep",       "00000000");
  form.append("senha",     "123456");
  form.append("id_funcao", String(data.id_funcao ?? 1));

  // Foto: converte base64 → Blob ou cria placeholder branco 1x1
  const fotoBlob = data.photo
    ? base64ToBlob(data.photo, "image/jpeg")
    : await placeholderBlob();

  form.append("foto", fotoBlob, "foto.jpg");

  const res = await fetch(`${API}/cadastrar`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? "Erro ao criar funcionário");
  }

  const json = await res.json();

  const emp: Employee = {
    id:        String(json.id_funcionario),
    name:      data.name,
    role:      data.role,
    cpf:       data.cpf,
    phone:     data.phone,
    email:     data.email,
    base:      data.base,
    photo:     data.photo,
    salary:    data.salary,
    status:    data.status ?? "ativo",
    cargoId:   data.cargoId as any,
    id_funcao: data.id_funcao,
  };

  writeEmployees([...readEmployees(), emp]);

  return emp;
}

/** Edição local (não existe rota no backend) */
export function updateEmployee(id: string, patch: Partial<Omit<Employee, "id">>) {
  const list = readEmployees().map((e) => (e.id === id ? { ...e, ...patch } : e));
  writeEmployees(list);
}

/** Exclusão local (não existe rota no backend) */
export function deleteEmployee(id: string) {
  writeEmployees(readEmployees().filter((e) => e.id !== id));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function base64ToBlob(dataUrl: string, mime: string): Blob {
  const parts = dataUrl.split(",");
  const byteString = atob(parts[1] ?? parts[0]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: mime });
}

async function placeholderBlob(): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (ctx) { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 1, 1); }
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.8);
  });
}

// ─── Financeiro (localStorage) ────────────────────────────────────────────────

export type PaymentStatus = "pago" | "pendente";

export type Payment = {
  id: string;
  employeeId: string;
  monthRef: string;
  amount: number;
  paidAt?: string;
  note?: string;
  status: PaymentStatus;
  createdAt: number;
};

export type FinanceConfig = {
  baseSalary: Record<string, number>;
};

const PAY_KEY = "waekium.payments.v1";
const FIN_KEY = "waekium.finance.v1";
const DEFAULT_FINANCE: FinanceConfig = { baseSalary: {} };

export function getPayments(): Payment[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(PAY_KEY) || "[]"); }
  catch { return []; }
}

export function savePayments(list: Payment[]) {
  localStorage.setItem(PAY_KEY, JSON.stringify(list));
}

export function addPayment(input: Omit<Payment, "id" | "createdAt">): Payment {
  const list = getPayments();
  const p: Payment = {
    ...input,
    id: `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: Date.now(),
  };
  savePayments([p, ...list]);
  return p;
}

export function updatePayment(id: string, patch: Partial<Omit<Payment, "id">>) {
  savePayments(getPayments().map((p) => (p.id === id ? { ...p, ...patch } : p)));
}

export function deletePayment(id: string) {
  savePayments(getPayments().filter((p) => p.id !== id));
}

export function getFinanceConfig(): FinanceConfig {
  if (typeof window === "undefined") return DEFAULT_FINANCE;
  try {
    const raw = localStorage.getItem(FIN_KEY);
    if (!raw) return DEFAULT_FINANCE;
    return { ...DEFAULT_FINANCE, ...JSON.parse(raw) };
  } catch { return DEFAULT_FINANCE; }
}

export function saveFinanceConfig(cfg: FinanceConfig) {
  localStorage.setItem(FIN_KEY, JSON.stringify(cfg));
}

export function setBaseSalary(employeeId: string, value: number) {
  const cfg = getFinanceConfig();
  cfg.baseSalary = { ...cfg.baseSalary, [employeeId]: value };
  saveFinanceConfig(cfg);
}

export function currentMonthRef(d: Date = new Date()): string {
  return format(d, "yyyy-MM");
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}