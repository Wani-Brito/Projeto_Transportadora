import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Search,
  Phone,
  Mail,
  MapPin,
  Truck,
  CalendarDays,
  User,
  Package,
  Clock,
  CheckCircle2,
  Activity,
  Plus,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { EmployeeBadge, DeliveryBadge } from "@/components/StatusBadge";
import {
  ADMIN_ID,
  getEmployees,
  getEvents,
  getDatesWithEvents,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  type Employee,
  type AgendaEvent,
} from "@/lib/storage";
import { parseISO } from "date-fns";
import { cargosService } from "@/services/api/cargos";
import type { Cargo, CargoId } from "@/types/cargo";
import { CARGO_INTERNAL } from "@/types/cargo";
import { Settings2 } from "lucide-react";

export const Route = createFileRoute("/funcionario")({
  component: FuncionarioPage,
  head: () => ({
    meta: [
      { title: "Funcionário | Waekium ERP" },
      {
        name: "description",
        content:
          "Gestão de funcionários: status, dados, financeiro, agenda, rotas e entregas.",
      },
    ],
  }),
});

type Tab = "dados" | "agenda" | "rotas";

// Status vem do campo `status` do próprio Employee (salvo no banco)
const STATUS_FILTERS: { value: "all" | Employee["status"]; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "ativo", label: "Ativo" },
  { value: "ferias", label: "Férias" },
  { value: "afastado", label: "Afastado" },
  { value: "inativo", label: "Inativo" },
];

function FuncionarioPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("dados");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Employee["status"]>("all");
  const [modal, setModal] = useState<{ mode: "create" | "edit"; emp?: Employee } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Employee | null>(null);
  const [cargosModalOpen, setCargosModalOpen] = useState(false);

  function reload(selectId?: string | null) {
    const list = getEmployees();
    setEmployees(list);
    if (selectId !== undefined) setSelectedId(selectId);
    else if (!list.find((e) => e.id === selectedId)) setSelectedId(list[0]?.id ?? null);
  }

  useEffect(() => {
    const list = getEmployees();
    setEmployees(list);
    if (!selectedId && list[0]) setSelectedId(list[0].id);
  }, []);

  const handleRefresh = () => reload();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (q && !e.name.toLowerCase().includes(q) && !e.role.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [employees, query, statusFilter]);

  const selected = employees.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="flex min-h-screen bg-card">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header title="Funcionário" />
        <main className="flex-1 bg-[var(--canvas)] p-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
            {/* LISTA DE FUNCIONÁRIOS */}
            <aside className="flex flex-col rounded-xl border border-border bg-card">
              <div className="border-b border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Funcionários</h3>
                    <p className="text-xs text-muted-foreground">
                      {filtered.length} de {employees.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCargosModalOpen(true)}
                      className="flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-1.5 text-[11px] font-medium text-foreground hover:bg-secondary"
                      title="Configurar cargos e valores"
                    >
                      <Settings2 className="h-3 w-3" /> Cargos
                    </button>
                    <button
                      onClick={() => setModal({ mode: "create" })}
                      className="flex items-center gap-1 rounded-lg bg-foreground px-2.5 py-1.5 text-[11px] font-medium text-background hover:opacity-90"
                      title="Adicionar funcionário"
                    >
                      <Plus className="h-3 w-3" /> Adicionar
                    </button>
                  </div>
                </div>
                <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  <ShieldCheck className="h-3 w-3" /> Modo administrador
                </div>
                <div className="relative mt-3">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full rounded-lg border border-border bg-secondary/40 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {STATUS_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setStatusFilter(f.value)}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition ${
                        statusFilter === f.value
                          ? "bg-foreground text-background"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                    Nenhum funcionário encontrado.
                  </div>
                ) : (
                  filtered.map((e) => {
                    const isSel = e.id === selectedId;
                    return (
                      <button
                        key={e.id}
                        onClick={() => setSelectedId(e.id)}
                        className={`mb-1 flex w-full items-center gap-3 rounded-lg p-2 text-left transition ${
                          isSel ? "bg-secondary" : "hover:bg-secondary/60"
                        }`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                          {e.photo ? (
                            <img
                              src={e.photo}
                              alt={e.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            e.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-foreground">
                            {e.name}
                          </div>
                          <div className="truncate text-[11px] text-muted-foreground">
                            {e.role}
                          </div>
                        </div>
                        {e.status && <EmployeeBadge status={e.status} />}
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* DETALHES */}
            <section className="flex flex-col gap-4">
              {selected ? (
                <>
                  {/* Cabeçalho funcionário */}
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-muted text-xl font-semibold text-muted-foreground">
                          {selected.photo ? (
                            <img
                              src={selected.photo}
                              alt={selected.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            selected.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-foreground">
                            {selected.name}
                          </h2>
                          <p className="text-xs text-muted-foreground">{selected.role}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {selected.status && <EmployeeBadge status={selected.status} />}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              Status (ADM)
                            </label>
                            <select
                              value={selected.status ?? "ativo"}
                              onChange={(e) => {
                                updateEmployee(selected.id, {
                                  status: e.target.value as Employee["status"],
                                });
                                reload();
                              }}
                              className="h-7 rounded-md border border-border bg-secondary/40 px-2 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
                            >
                              <option value="ativo">Ativo</option>
                              <option value="ferias">Férias</option>
                              <option value="afastado">Afastado</option>
                              <option value="inativo">Inativo</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleRefresh}
                            className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-secondary"
                            title="Atualizar dados"
                          >
                            <RefreshCw className="h-3 w-3" /> Atualizar
                          </button>
                          <button
                            onClick={() => setModal({ mode: "edit", emp: selected })}
                            className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-secondary"
                          >
                            <Pencil className="h-3 w-3" /> Editar
                          </button>
                          <button
                            onClick={() => setConfirmDelete(selected)}
                            className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-medium text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" /> Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
                    {(
                      [
                        { id: "dados", label: "Dados", icon: User },
                        { id: "agenda", label: "Agenda", icon: CalendarDays },
                        { id: "rotas", label: "Rotas & Entregas", icon: MapPin },
                      ] as const
                    ).map((t) => {
                      const Icon = t.icon;
                      const active = tab === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTab(t.id)}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                            active
                              ? "bg-secondary text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Conteúdo das abas */}
                  {tab === "dados" && <TabDados employee={selected} />}
                  {tab === "agenda" && <TabAgenda employee={selected} />}
                  {tab === "rotas" && <TabRotas employee={selected} />}
                </>
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-border bg-card p-12 text-sm text-muted-foreground">
                  Selecione um funcionário
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {modal && (
        <EmployeeModal
          mode={modal.mode}
          employee={modal.emp}
          onClose={() => setModal(null)}
          onSaved={(emp) => {
            setModal(null);
            reload(emp.id);
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDelete
          employee={confirmDelete}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            deleteEmployee(confirmDelete.id);
            setConfirmDelete(null);
            reload(null);
          }}
        />
      )}

      {cargosModalOpen && <CargosConfigModal onClose={() => setCargosModalOpen(false)} />}
    </div>
  );
}

function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ---- ABA: DADOS ---- */
function TabDados({ employee }: { employee: Employee }) {
  const phone = employee.phone || "—";
  const email = employee.email || "—";
  const base = employee.base || "—";
  const salary = employee.salary != null
    ? employee.salary.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "—";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Informações Pessoais">
        <ul className="space-y-3 text-sm">
          <Field icon={User} label="Nome">{employee.name}</Field>
          <Field icon={Truck} label="Cargo">{employee.role}</Field>
          <Field icon={Phone} label="Telefone">{phone}</Field>
          <Field icon={Mail} label="E-mail">{email}</Field>
          <Field icon={MapPin} label="Base">{base}</Field>
          <Field icon={Package} label="Salário">{salary}</Field>
          {employee.cpf && (
            <Field icon={ShieldCheck} label="CPF">
              {employee.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
            </Field>
          )}
        </ul>
      </Card>
      <Card title="Atividade">
        <p className="text-xs text-muted-foreground">
          Integre com seu sistema de ponto ou registros para exibir atividade aqui.
        </p>
      </Card>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-sm text-foreground">{children}</div>
      </div>
    </li>
  );
}

/* ---- ABA: AGENDA ---- */
function TabAgenda({ employee }: { employee: Employee }) {
  const today = new Date();
  const todayEvents = getEvents(employee.id, today);
  const adminToday = getEvents(ADMIN_ID, today);
  const showEvents = todayEvents.length ? todayEvents : adminToday;

  const dates = getDatesWithEvents(employee.id).sort((a, b) => b.localeCompare(a));
  const history = dates
    .filter((d) => d !== format(today, "yyyy-MM-dd"))
    .slice(0, 6)
    .map((d) => ({ date: d, events: getEvents(employee.id, parseISO(d)) }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card
        title={`Agenda — ${format(today, "dd 'de' MMMM", { locale: ptBR })}`}
        action={
          <Link to="/agenda" className="text-xs font-medium text-foreground hover:underline">
            Editar →
          </Link>
        }
      >
        {showEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum compromisso hoje.</p>
        ) : (
          <ul className="space-y-3">
            {showEvents.map((ev: AgendaEvent) => (
              <li key={ev.id} className="flex items-start gap-3 text-sm">
                <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">
                  {ev.time}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-foreground">{ev.title}</div>
                  {ev.tag && (
                    <span className="mt-0.5 inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                      {ev.tag}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Histórico de Agendas">
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sem agendas anteriores registradas.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((h) => (
              <li
                key={h.date}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium text-foreground capitalize">
                    {format(parseISO(h.date), "EEE, dd MMM yyyy", { locale: ptBR })}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {h.events.length} compromisso(s)
                  </div>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

/* ---- ABA: ROTAS & ENTREGAS ---- */
// Sem realtime: exibe mensagem para integrar com sua fonte de dados de entregas
function TabRotas({ employee }: { employee: Employee }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Em andamento">
        <p className="text-xs text-muted-foreground">
          Nenhuma rota em andamento. Integre com sua fonte de dados de entregas para exibir rotas ativas aqui.
        </p>
      </Card>
      <Card title="Histórico de entregas">
        <p className="text-xs text-muted-foreground">
          Nenhuma entrega registrada. Integre com sua fonte de dados para exibir o histórico.
        </p>
      </Card>
    </div>
  );
}

/* ---- MODAL: ADICIONAR / EDITAR FUNCIONÁRIO ---- */
function EmployeeModal({
  mode,
  employee,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  employee?: Employee;
  onClose: () => void;
  onSaved: (emp: Employee) => void;
}) {
  const [name, setName] = useState(employee?.name ?? "");
  const [role, setRole] = useState(employee?.role ?? "Motorista");
  const [cpf, setCpf] = useState(employee?.cpf ?? "");
  const [cargoId, setCargoId] = useState<CargoId>(employee?.cargoId ?? "cargo_1");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [base, setBase] = useState(employee?.base ?? "");
  const [photo, setPhoto] = useState<string | undefined>(employee?.photo);
  const [salary, setSalary] = useState<string>(
    employee?.salary != null ? String(employee.salary) : "",
  );
  const [status, setStatus] = useState<NonNullable<Employee["status"]>>(
    employee?.status ?? "ativo",
  );
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const prevAutoRoleRef = useState({ value: CARGO_INTERNAL[employee?.cargoId ?? "cargo_1"] })[0];

  useEffect(() => {
    cargosService.list().then(setCargos);
  }, []);

  function handleCargoChange(next: CargoId) {
    setCargoId(next);
    const prev = prevAutoRoleRef.value;
    if (!role.trim() || role.trim() === prev) {
      const nextLabel = CARGO_INTERNAL[next];
      setRole(nextLabel);
      prevAutoRoleRef.value = nextLabel;
    }
    const cargo = cargos.find((c) => c.id === next);
    if (cargo && !salary) setSalary(String(cargo.baseSalary));
  }

  function handlePhotoFile(file: File | null) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 2MB.");
      return;
    }
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const max = 256;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        setPhoto(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;
    const salaryNum = salary.trim() ? Number(salary.replace(",", ".")) : undefined;
    const payload = {
      name: name.trim(),
      role: role.trim(),
      cpf: cpf.replace(/\D/g, ""),
      cargoId,
      phone,
      email,
      base,
      photo,
      salary: Number.isFinite(salaryNum) ? salaryNum : undefined,
      status,
    };
    if (mode === "create") {
      const created = addEmployee(payload);
      onSaved(created);
    } else if (employee) {
      updateEmployee(employee.id, payload);
      onSaved({ ...employee, ...payload });
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {mode === "create" ? "Adicionar funcionário" : "Editar funcionário"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Apenas administradores podem alterar estes dados.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          {/* Foto */}
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-lg font-medium text-muted-foreground">
              {photo ? (
                <img src={photo} alt="Foto" className="h-full w-full object-cover" />
              ) : (
                (name.charAt(0) || "?").toUpperCase()
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary">
                {photo ? "Trocar foto" : "Adicionar foto"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {photo && (
                <button
                  type="button"
                  onClick={() => setPhoto(undefined)}
                  className="text-[11px] text-muted-foreground hover:text-destructive"
                >
                  Remover foto
                </button>
              )}
              <span className="text-[10px] text-muted-foreground">JPG/PNG até 2MB</span>
            </div>
          </div>
          <Input2 label="Nome" value={name} onChange={setName} required />
          <div className="grid grid-cols-2 gap-3">
            <Input2 label="CPF" value={cpf} onChange={setCpf} placeholder="000.000.000-00" />
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Cargo
              </span>
              <select
                value={cargoId}
                onChange={(e) => handleCargoChange(e.target.value as CargoId)}
                className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              >
                {cargos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} — {c.internalName}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Input2 label="Função (descrição)" value={role} onChange={setRole} required />
          <div className="grid grid-cols-2 gap-3">
            <Input2 label="Telefone" value={phone} onChange={setPhone} placeholder="+55 (11) 9..." />
            <Input2 label="Base" value={base} onChange={setBase} placeholder="Cidade — UF" />
          </div>
          <Input2
            label="E-mail"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="nome@waekium.com"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input2
              label="Salário (R$)"
              value={salary}
              onChange={setSalary}
              type="number"
              placeholder="0,00"
            />
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NonNullable<Employee["status"]>)}
                className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              >
                <option value="ativo">Ativo</option>
                <option value="ferias">Férias</option>
                <option value="afastado">Afastado</option>
                <option value="inativo">Inativo</option>
              </select>
            </label>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background hover:opacity-90"
          >
            {mode === "create" ? "Adicionar" : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input2({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
      />
    </label>
  );
}

function ConfirmDelete({
  employee,
  onCancel,
  onConfirm,
}: {
  employee: Employee;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl"
      >
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Trash2 className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Excluir funcionário?</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Esta ação removerá{" "}
          <span className="font-medium text-foreground">{employee.name}</span> do sistema.
          Não é possível desfazer.
        </p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-destructive px-4 py-2 text-xs font-medium text-destructive-foreground hover:opacity-90"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- MODAL: Configuração de CARGOS ---- */
function CargosConfigModal({ onClose }: { onClose: () => void }) {
  const [list, setList] = useState<Cargo[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    cargosService.list().then(setList);
  }, []);

  function patch(id: string, p: Partial<Cargo>) {
    setList((prev) => prev.map((c) => (c.id === id ? { ...c, ...p } : c)));
  }

  async function save(c: Cargo) {
    setSavingId(c.id);
    try {
      await cargosService.update(c.id, c);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Configurar cargos</h3>
            <p className="text-xs text-muted-foreground">
              3 cargos fixos: Motorista, ADM e Gerente. Edite valores, hora normal, hora extra e
              limite mensal.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {list.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-border bg-card p-4"
              style={{ borderTop: `3px solid ${c.color ?? "var(--border)"}` }}
            >
              <div className="mb-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {c.label}
                </div>
                <div className="text-sm font-semibold text-foreground">{c.internalName}</div>
              </div>
              <div className="space-y-2">
                <NumRow
                  label="Salário base"
                  value={c.baseSalary}
                  onChange={(v) => patch(c.id, { baseSalary: v })}
                />
                <NumRow
                  label="Limite mensal (h)"
                  value={c.monthlyHourLimit}
                  onChange={(v) => patch(c.id, { monthlyHourLimit: v })}
                />
                <NumRow
                  label="Hora normal (R$)"
                  value={c.hourlyRate}
                  onChange={(v) => patch(c.id, { hourlyRate: v })}
                />
                <NumRow
                  label="Hora extra (R$)"
                  value={c.overtimeRate}
                  onChange={(v) => patch(c.id, { overtimeRate: v })}
                />
              </div>
              <button
                onClick={() => save(c)}
                disabled={savingId === c.id}
                className="mt-3 w-full rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-background hover:opacity-90 disabled:opacity-60"
              >
                {savingId === c.id ? "Salvando..." : "Salvar"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NumRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-24 rounded-md border border-border bg-secondary/30 px-2 py-1 text-right text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
      />
    </label>
  );
}