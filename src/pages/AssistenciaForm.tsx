import { useMemo, useState } from "react";
import { useApp } from "@/store/AppStore";
import { Button, Field, Input, Select, Textarea, PageHeader } from "@/components/ui";
import { DocumentUpload } from "@/components/DocumentUpload";
import {
  STATUS_ASSISTENCIA_OPTS,
  TIPOS_ASSISTENCIA,
} from "@/lib/constants";
import type { Assistencia, Documento, StatusAssistencia } from "@/lib/types";
import { isValidPhone, todayISODate } from "@/lib/utils";
import {
  IconArrowLeft,
  IconCheck,
  IconShield,
  IconUser,
  IconListAssist,
  IconMapPin,
  IconClock,
} from "@/components/Icons";

type FormState = {
  protocolo: string;
  clienteId: string;
  clienteNome: string;
  solicitante: string;
  telefone: string;
  seguradoraId: string;
  seguradoraNome: string;
  tipo: string;
  assunto: string;
  descricao: string;
  origem: string;
  destino: string;
  data: string;
  horario: string;
  observacoes: string;
  responsavel: string;
  status: StatusAssistencia;
  documentos: Documento[];
};

const EMPTY: FormState = {
  protocolo: "",
  clienteId: "",
  clienteNome: "",
  solicitante: "",
  telefone: "",
  seguradoraId: "",
  seguradoraNome: "",
  tipo: "",
  assunto: "",
  descricao: "",
  origem: "",
  destino: "",
  data: todayISODate(),
  horario: "",
  observacoes: "",
  responsavel: "",
  status: "Em andamento",
  documentos: [],
};

function nextProtocolo(assistencias: Assistencia[]): string {
  const year = new Date().getFullYear();
  let max = 0;
  assistencias.forEach((a) => {
    const m = /AST-\d{4}-(\d+)/.exec(a.protocolo || "");
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return `AST-${year}-${String(max + 1).padStart(4, "0")}`;
}

export function AssistenciaForm() {
  const {
    params,
    navigate,
    assistencias,
    clientes,
    seguradoras,
    saveAssistencia,
    notify,
  } = useApp();

  const editing = params.id
    ? assistencias.find((a) => a.id === params.id)
    : undefined;

  const [form, setForm] = useState<FormState>(() => {
    if (editing) {
      return {
        ...EMPTY,
        protocolo: editing.protocolo,
        clienteId: editing.clienteId,
        clienteNome: editing.clienteNome,
        solicitante: editing.solicitante,
        telefone: editing.telefone,
        seguradoraId: editing.seguradoraId,
        seguradoraNome: editing.seguradoraNome,
        tipo: editing.tipo,
        assunto: editing.assunto,
        descricao: editing.descricao,
        origem: editing.origem,
        destino: editing.destino,
        data: editing.data || todayISODate(),
        horario: editing.horario,
        observacoes: editing.observacoes,
        responsavel: editing.responsavel,
        status: editing.status,
        documentos: editing.documentos || [],
      };
    }
    return {
      ...EMPTY,
      protocolo: nextProtocolo(assistencias),
      responsavel: "",
    };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const isConcluded = editing?.status === "Finalizado";

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.protocolo.trim()) e.protocolo = "Informe o protocolo.";
    if (!form.clienteNome.trim()) e.clienteNome = "Informe o nome do cliente ou segurado.";
    if (!form.solicitante.trim()) e.solicitante = "Informe o solicitante.";
    if (!form.telefone.trim()) e.telefone = "Informe o telefone.";
    else if (!isValidPhone(form.telefone)) e.telefone = "Telefone inválido.";
    if (!form.seguradoraNome.trim()) e.seguradoraNome = "Informe a seguradora.";
    if (!form.tipo) e.tipo = "Selecione o tipo.";
    if (!form.assunto.trim()) e.assunto = "Informe o assunto.";
    if (!form.data) e.data = "Informe a data.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      notify("Verifique os campos destacados.", "error");
      return;
    }
    saveAssistencia({ ...(editing ? { id: editing.id } : {}), ...form });
    navigate("assistencias");
  };

  const section = useMemo(
    () => ({
      title: editing ? "Editar assistência" : "Nova assistência",
      sub: editing
        ? `Editando ${editing.protocolo}`
        : "Preencha os dados para abrir um protocolo de assistência.",
    }),
    [editing],
  );

  return (
    <form onSubmit={submit} className="space-y-5">
      <PageHeader
        title={section.title}
        subtitle={section.sub}
        icon={<IconShield className="h-5 w-5" />}
        actions={
          <>
            <Button type="button" variant="ghost" onClick={() => navigate("assistencias")}>
              <IconArrowLeft className="h-4 w-4" /> Voltar
            </Button>
            <Button type="submit">
              <IconCheck className="h-4 w-4" />
              {editing ? "Salvar alterações" : "Abrir assistência"}
            </Button>
          </>
        }
      />

      {isConcluded && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <IconCheck className="h-4 w-4" />
          Esta assistência foi finalizada e está no histórico.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left col */}
        <div className="space-y-4 lg:col-span-2">
          <FormSection title="Identificação" icon={<IconShield className="h-4 w-4" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Protocolo" required error={errors.protocolo}>
                <Input
                  value={form.protocolo}
                  onChange={(e) => set("protocolo", e.target.value)}
                  placeholder="AST-2026-0001"
                />
              </Field>
              <Field label="Status" required>
                <Select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value as StatusAssistencia)}
                >
                  {STATUS_ASSISTENCIA_OPTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </FormSection>

          <FormSection title="Cliente e Seguradora" icon={<IconUser className="h-4 w-4" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cliente ou segurado" required error={errors.clienteNome}
                hint="Campo livre: não é necessário cadastrar o cliente antes.">
                <Input
                  list="assistencia-clientes"
                  value={form.clienteNome}
                  onChange={(e) => set("clienteNome", e.target.value)}
                  placeholder="Nome da pessoa ou empresa"
                />
                <datalist id="assistencia-clientes">
                  {clientes.map((c) => <option key={c.id} value={c.nome} />)}
                </datalist>
              </Field>
              <Field label="Solicitante" required error={errors.solicitante}>
                <Input
                  value={form.solicitante}
                  onChange={(e) => set("solicitante", e.target.value)}
                  placeholder="Nome de quem solicitou"
                />
              </Field>
              <Field label="Telefone" required error={errors.telefone}>
                <Input
                  value={form.telefone}
                  onChange={(e) => set("telefone", e.target.value)}
                  placeholder="(11) 90000-0000"
                />
              </Field>
              <Field label="Seguradora" required error={errors.seguradoraNome}
                hint="Campo livre: use o nome informado na apólice.">
                <Input
                  list="assistencia-seguradoras"
                  value={form.seguradoraNome}
                  onChange={(e) => set("seguradoraNome", e.target.value)}
                  placeholder="Nome da seguradora"
                />
                <datalist id="assistencia-seguradoras">
                  {seguradoras.map((s) => <option key={s.id} value={s.nome} />)}
                </datalist>
              </Field>
            </div>
          </FormSection>

          <FormSection title="Detalhes da assistência" icon={<IconListAssist className="h-4 w-4" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tipo de assistência" required error={errors.tipo}>
                <Select value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
                  <option value="">Selecione...</option>
                  {TIPOS_ASSISTENCIA.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Assunto" required error={errors.assunto}>
                <Input
                  value={form.assunto}
                  onChange={(e) => set("assunto", e.target.value)}
                  placeholder="Resumo do atendimento"
                />
              </Field>
            </div>
            <Field label="Descrição" className="mt-4">
              <Textarea
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                placeholder="Descreva a ocorrência em detalhes..."
              />
            </Field>
          </FormSection>

          <FormSection title="Logística" icon={<IconMapPin className="h-4 w-4" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Origem">
                <Input value={form.origem} onChange={(e) => set("origem", e.target.value)} placeholder="Local de origem" />
              </Field>
              <Field label="Destino">
                <Input value={form.destino} onChange={(e) => set("destino", e.target.value)} placeholder="Local de destino" />
              </Field>
            </div>
          </FormSection>
        </div>

        {/* Right col */}
        <div className="space-y-4">
          <FormSection title="Agendamento" icon={<IconClock className="h-4 w-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Data" required error={errors.data}>
                <Input type="date" value={form.data} onChange={(e) => set("data", e.target.value)} />
              </Field>
              <Field label="Horário">
                <Input type="time" value={form.horario} onChange={(e) => set("horario", e.target.value)} />
              </Field>
            </div>
            <Field label="Responsável" className="mt-4">
              <Input value={form.responsavel} onChange={(e) => set("responsavel", e.target.value)} placeholder="Quem está cuidando" />
            </Field>
            <Field label="Observações" className="mt-4">
              <Textarea
                value={form.observacoes}
                onChange={(e) => set("observacoes", e.target.value)}
                placeholder="Anotações internas..."
              />
            </Field>
          </FormSection>

          <FormSection title="Documentos" icon={<IconListAssist className="h-4 w-4" />}>
            <DocumentUpload
              documentos={form.documentos}
              onChange={(docs) => set("documentos", docs)}
              notify={notify}
            />
          </FormSection>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={() => navigate("assistencias")}>
          Cancelar
        </Button>
        <Button type="submit" size="lg">
          <IconCheck className="h-4 w-4" />
          {editing ? "Salvar alterações" : "Abrir assistência"}
        </Button>
      </div>
      {editing && (
        <p className="text-center text-[11px] text-faint">
          Última atualização em{" "}
          {new Date(editing.updatedAt || editing.createdAt).toLocaleString("pt-BR")}
        </p>
      )}
    </form>
  );
}

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line-soft bg-card shadow-lg shadow-black/20">
      <div className="flex items-center gap-2 border-b border-line-soft px-5 py-3">
        <span className="text-violet-300">{icon}</span>
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
