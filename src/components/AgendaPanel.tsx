import { useEffect, useState } from "react"; // hooks react
import { format } from "date-fns"; // formatar datas
import { ptBR } from "date-fns/locale"; // pt-br
import { Plus, Trash2 } from "lucide-react"; // ícones

import {
  addEvent,
  deleteEvent,
  getEvents,
  type AgendaEvent,
} from "@/lib/storage";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

// props componente
type AgendaPanelProps = {
  title: string;
  subtitle?: string;
  ownerId: string;
  date: Date;
  onOpenCalendar?: () => void;
};

export function AgendaPanel({
  title,
  subtitle,
  ownerId,
  date,
  onOpenCalendar,
}: AgendaPanelProps) {

  // eventos agenda
  const [events, setEvents] =
    useState<AgendaEvent[]>([]);

  // modal aberto
  const [open, setOpen] =
    useState(false);

  // campos formulário
  const [time, setTime] =
    useState("08:00");

  const [text, setText] =
    useState("");

  const [desc, setDesc] =
    useState("");

  const [tag, setTag] =
    useState("Reunião");

  // atualiza eventos
  const refresh = () => {
    setEvents(
      getEvents(ownerId, date)
    );
  };

  // atualiza ao trocar usuário/data
  useEffect(() => {
    refresh();
  }, [ownerId, date]);

  // adiciona evento
  const handleAdd = () => {

    // impede vazio
    if (!text.trim()) return;

    addEvent(ownerId, date, {
      id: crypto.randomUUID(),

      time,

      title: text.trim(),

      description:
        desc.trim() || undefined,

      tag,
    });

    // limpa campos
    setText("");
    setDesc("");

    // fecha modal
    setOpen(false);

    // atualiza lista
    refresh();
  };

  // remove evento
  const handleDelete = (
    id: string
  ) => {

    deleteEvent(
      ownerId,
      date,
      id
    );

    refresh();
  };

  return (

    // container principal
    <div className="flex min-h-[420px] flex-col rounded-xl border border-border bg-card">

      {/* topo */}
      <div className="flex shrink-0 items-start justify-between border-b border-border px-5 py-4">

        <div>

          {/* título */}
          <div className="flex items-center gap-2">

            <h3 className="text-sm font-semibold text-foreground">
              {title}
            </h3>

            {/* subtítulo */}
            {subtitle && (
              <>
                <span className="h-1 w-1 rounded-full bg-muted-foreground" />

                <span className="text-sm text-foreground">
                  {subtitle}
                </span>
              </>
            )}

          </div>

          {/* data */}
          <p className="mt-0.5 text-xs text-muted-foreground capitalize">

            {format(
              date,
              "EEEE, d 'de' MMMM",
              {
                locale: ptBR,
              }
            )}

          </p>

        </div>

        {/* botão calendário */}
        <button
          onClick={onOpenCalendar}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Ver calendário
        </button>

      </div>

      {/* conteúdo */}
      <div className="flex-1 px-5 py-4">

        {/* sem eventos */}
        {events.length === 0 ? (

          <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
            Nenhum evento para este dia
          </div>

        ) : (

          // lista eventos
          <ul className="space-y-4">

            {events.map((ev) => (

              <li
                key={ev.id}
                className="group grid grid-cols-[60px_1fr_auto_auto] items-start gap-3"
              >

                {/* horário */}
                <span className="pt-0.5 text-xs font-medium text-muted-foreground">
                  {ev.time}
                </span>

                {/* infos */}
                <div className="border-l border-border pl-3">

                  <div className="text-sm font-medium text-foreground">
                    {ev.title}
                  </div>

                  {/* descrição */}
                  {ev.description && (

                    <div className="text-xs text-muted-foreground">
                      {ev.description}
                    </div>

                  )}

                </div>

                {/* categoria */}
                {ev.tag && (

                  <span className="rounded-full border border-border px-3 py-1 text-xs text-foreground">
                    {ev.tag}
                  </span>

                )}

                {/* remover */}
                <button
                  onClick={() =>
                    handleDelete(ev.id)
                  }
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >

                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />

                </button>

              </li>

            ))}

          </ul>

        )}

      </div>

      {/* rodapé */}
      <div className="flex shrink-0 items-center justify-between border-t border-border px-5 py-3">

        {/* total */}
        <span className="text-xs text-muted-foreground">
          {events.length} eventos hoje
        </span>

        {/* modal */}
        <Dialog
          open={open}
          onOpenChange={setOpen}
        >

          {/* botão abrir modal */}
          <DialogTrigger asChild>

            <Button
              variant="ghost"
              className="flex items-center gap-1 text-xs font-medium"
            >

              <Plus className="h-3.5 w-3.5" />

              <span>
                Adicionar evento
              </span>

            </Button>

          </DialogTrigger>

          {/* conteúdo modal */}
          <DialogContent>

            {/* topo modal */}
            <DialogHeader>

              <DialogTitle>
                Adicionar evento
              </DialogTitle>

            </DialogHeader>

            {/* formulário */}
            <div className="space-y-3">

              {/* linha */}
              <div className="grid grid-cols-2 gap-3">

                {/* horário */}
                <div>

                  <Label htmlFor="time">
                    Horário
                  </Label>

                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) =>
                      setTime(
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* categoria */}
                <div>

                  <Label htmlFor="tag">
                    Categoria
                  </Label>

                  <Input
                    id="tag"
                    value={tag}
                    onChange={(e) =>
                      setTag(
                        e.target.value
                      )
                    }
                    placeholder="Reunião"
                  />

                </div>

              </div>

              {/* título */}
              <div>

                <Label htmlFor="title">
                  Título
                </Label>

                <Input
                  id="title"
                  value={text}
                  onChange={(e) =>
                    setText(
                      e.target.value
                    )
                  }
                  placeholder="Ex: Rota Campinas"
                />

              </div>

              {/* descrição */}
              <div>

                <Label htmlFor="desc">
                  Descrição
                </Label>

                <Input
                  id="desc"
                  value={desc}
                  onChange={(e) =>
                    setDesc(
                      e.target.value
                    )
                  }
                  placeholder="Detalhes opcionais"
                />

              </div>

            </div>

            {/* rodapé modal */}
            <DialogFooter>

              {/* cancelar */}
              <Button
                variant="outline"
                onClick={() =>
                  setOpen(false)
                }
              >
                Cancelar
              </Button>

              {/* salvar */}
              <Button
                onClick={handleAdd}
              >
                Salvar
              </Button>

            </DialogFooter>

          </DialogContent>

        </Dialog>

      </div>

    </div>
  );
}