import { useMemo, useState } from "react";
import { useApp } from "@/store/AppStore";
import { Button, Field, Input, Select, Textarea, PageHeader } from "@/components/ui";
import { DocumentUpload } from "@/components/DocumentUpload";
import {
  STATUS_SINISTRO_OPTS,
  PARTE_ENVOLVIDA,
  PARTE_ENVOLVIDA_OPTS,
} from "@/lib/constants";
import type { Documento, Sinistro, StatusSinistro, TipoSinistro } from "@/lib/types";
import { isValidPlaca, todayISODate, formatPlaca } from "@/lib/utils";
import {
  IconArrowLeft,
  IconCheck,
  IconCar,
  IconUser,
  IconBuilding,
  IconCalendar,
} from "@/components/Icons";

type FormState = {
  numero: string;
  categoria: TipoSinistro;
  clienteId: string;
  clienteNome: string;
  veiculo: string;
  placa: string;
  seguradoraId: string;
  seguradoraNome: string;
  oficinaId: string;
  oficinaNome: string;
  data: string;
  horaOcorrencia: string;
  tipoBem: string;
  naturezaSinistro: string;
  localizacaoSinistro: string;
  descricaoDanos: string;
  contatoSegurado: string;
  testemunhas: string;
  descricao: string;
  observacoes: string;
  status: StatusSinistro;
  documentos: Documento[];
  parteEnvolvida: "segurado" | "terceiro";
};

const EMPTY: FormState = {
  numero: "",
  categoria: "Automóvel",
  clienteId: "",
  clienteNome: "",
  veiculo: "",
  placa: "",
  seguradoraId: "",
  seguradoraNome: "",
  oficinaId: "",
  oficinaNome: "",
  data: todayISODate(),
  horaOcorrencia: "",
  tipoBem: "",
  naturezaSinistro: "",
  localizacaoSinistro: "",
  descricaoDanos: "",
  contatoSegurado: "",
  testemunhas: "",
  descricao: "",
  observacoes: "",
  status: "Pendente",
  documentos: [],
  parteEnvolvida: "segurado",
};

function nextNumero(sinistros: Sinistro[]): string {
  const year = new Date().getFullYear();
  let max = 0;
  sinistros.forEach((s) => {
    const m = /SIN-\d{4}-(\d+)/.exec(s.numero || "");
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return `SIN-${year}-${String(max + 1).padStart(4, "0")}`;
}

export function SinistroForm() {
  const {
    params,
    navigate,
    sinistros,
    clientes,
    seguradoras,
    oficinas,
    saveSinistro,
    notify,
  } = useApp();

  const editing = params.id ? sinistros.find((s) => s.id === params.id) : undefined;

  const [form, setForm] = useState<FormState>(() => {
    if (editing) {
      return {
        ...EMPTY,
        numero: editing.numero,
        categoria: editing.categoria || "Automóvel",
        clienteId: editing.clienteId,
        clienteNome: editing.clienteNome,
        veiculo: editing.veiculo,
        placa: editing.placa,
        seguradoraId: editing.seguradoraId,
        seguradoraNome: editing.seguradoraNome,
        oficinaId: editing.oficinaId,
        oficinaNome: editing.oficinaNome,
        data: editing.data || todayISODate(),
        horaOcorrencia: editing.horaOcorrencia || "",
        tipoBem: editing.tipoBem || "",
        naturezaSinistro: editing.naturezaSinistro || "",
        localizacaoSinistro: editing.localizacaoSinistro || "",
        descricaoDanos: editing.descricaoDanos || "",
        contatoSegurado: editing.contatoSegurado || "",
        testemunhas: editing.testemunhas || "",
        descricao: editing.descricao,
        observacoes: editing.observacoes,
        status: editing.status,
        documentos: editing.documentos || [],
        parteEnvolvida: editing.parteEnvolvida || "segurado",
      };
    }
    return { ...EMPTY, numero: nextNumero(sinistros) };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.numero.trim()) e.numero = "Informe o número do sinistro.";
    if (!form.clienteNome.trim()) e.clienteNome = "Informe o nome do cliente ou segurado.";
    if (!form.seguradoraNome.trim()) e.seguradoraNome = "Informe a seguradora.";
    if (!form.data) e.data = "Informe a data.";
    if (form.categoria === "Automóvel") {
      if (!form.veiculo.trim()) e.veiculo = "Informe o veículo.";
      if (!form.placa.trim()) e.placa = "Informe a placa.";
      else if (!isValidPlaca(form.placa)) e.placa = "Formato de placa inválido (ex: ABC1D23).";
      if (!form.oficinaNome.trim()) e.oficinaNome = "Informe a oficina ou destino do veículo.";
    } else {
      if (!form.tipoBem.trim()) e.tipoBem = "Informe o bem segurado.";
      if (!form.naturezaSinistro.trim()) e.naturezaSinistro = "Informe a natureza do sinistro.";
      if (!form.localizacaoSinistro.trim()) e.localizacaoSinistro = "Informe a localização.";
      if (!form.descricaoDanos.trim()) e.descricaoDanos = "Descreva os danos observados.";
      if (!form.contatoSegurado.trim()) e.contatoSegurado = "Informe um contato do segurado.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      notify("Verifique os campos destacados.", "error");
      return;
    }
    saveSinistro({
      ...(editing ? { id: editing.id } : {}),
      ...form,
       categoria: form.categoria,
      placa: formatPlaca(form.placa),
      parteEnvolvida: form.parteEnvolvida,
    });
    navigate("sinistros");
  };

  const meta = useMemo(
    () => ({
      title: editing ? "Editar sinistro" : "Novo sinistro",
      sub: editing
        ? `Editando ${editing.numero}`
        : "Registre um novo sinistro com documentos e status.",
    }),
    [editing],
  );

  const isResolved = editing?.status === "Finalizado";

  return (
    <form onSubmit={submit} className="space-y-5">
      <PageHeader
        title={meta.title}
        subtitle={meta.sub}
        icon={<IconCar className="h-5 w-5" />}
        actions={
          <>
            <Button type="button" variant="ghost" onClick={() => navigate("sinistros")}>
              <IconArrowLeft className="h-4 w-4" /> Voltar
            </Button>
            <Button type="submit">
              <IconCheck className="h-4 w-4" />
              {editing ? "Salvar alterações" : "Registrar sinistro"}
            </Button>
          </>
        }
      />

      {isResolved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <IconCheck className="h-4 w-4" />
          Este sinistro foi resolvido e está no histórico.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <FormSection title="Sinistro" icon={<IconCar className="h-4 w-4" />}>
            <Field
              label="Tipo de apólice"
              required
              hint="Escolha Ramos Elementares para casas, barracões e outros bens."
            >
              <Select
                value={form.categoria}
                onChange={(e) => set("categoria", e.target.value as TipoSinistro)}
              >
                <option value="Automóvel">Automóvel</option>
                <option value="Ramos Elementares">Ramos Elementares (RE)</option>
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Número do sinistro" required error={errors.numero}>
                <Input
                  value={form.numero}
                  onChange={(e) => set("numero", e.target.value)}
                  placeholder="SIN-2026-0001"
                />
              </Field>
              <Field label="Status" required>
                <Select value={form.status} onChange={(e) => set("status", e.target.value as StatusSinistro)}>
                  {STATUS_SINISTRO_OPTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            {form.categoria === "Automóvel" ? (
              <Field label="Descrição do sinistro" className="mt-4">
                <Textarea
                  value={form.descricao}
                  onChange={(e) => set("descricao", e.target.value)}
                  placeholder="Descreva a ocorrência, danos e circunstâncias..."
                />
              </Field>
            ) : (
              <p className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-xs leading-relaxed text-violet-200">
                Para RE, os detalhes do evento e dos danos serão registrados
                nos campos específicos abaixo.
              </p>
            )}
          </FormSection>

          {form.categoria === "Automóvel" ? (
            <>
              <FormSection title="Veículo" icon={<IconCar className="h-4 w-4" />}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Veículo / modelo" required error={errors.veiculo}>
                    <Input
                      value={form.veiculo}
                      onChange={(e) => set("veiculo", e.target.value)}
                      placeholder="Ex: Honda Civic 2022"
                    />
                  </Field>
                  <Field label="Placa" required error={errors.placa} hint="Padrão Mercosul: ABC1D23">
                    <Input
                      value={form.placa}
                      onChange={(e) => set("placa", e.target.value.toUpperCase())}
                      placeholder="ABC1D23"
                      maxLength={8}
                    />
                  </Field>
                </div>
              </FormSection>

              <FormSection title="Parte envolvida" icon={<IconCar className="h-4 w-4" />}>
                <Field label="Tipo de envolvido" hint="Azul = Segurado • Amarelo = Terceiro">
                  <div className="grid grid-cols-2 gap-3">
                    {PARTE_ENVOLVIDA_OPTS.map((parte) => {
                      const cfg = PARTE_ENVOLVIDA[parte];
                      const active = form.parteEnvolvida === parte;
                      return (
                        <button
                          key={parte}
                          type="button"
                          onClick={() => set("parteEnvolvida", parte)}
                          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left transition-all ${active ? cfg.chip : "border-line bg-surface hover:bg-hover"}`}
                        >
                          <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
                          <span className="font-semibold">{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </FormSection>
            </>
          ) : (
            <FormSection title="Detalhes do sinistro RE" icon={<IconBuilding className="h-4 w-4" />}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Bem segurado" required error={errors.tipoBem} hint="Ex: casa, barracão ou conteúdo.">
                  <Input
                    value={form.tipoBem}
                    onChange={(e) => set("tipoBem", e.target.value)}
                    placeholder="Ex: Casa residencial"
                  />
                </Field>
                <Field label="Natureza do sinistro" required error={errors.naturezaSinistro}>
                  <Input
                    list="naturezas-re"
                    value={form.naturezaSinistro}
                    onChange={(e) => set("naturezaSinistro", e.target.value)}
                    placeholder="Ex: incêndio, roubo, vendaval..."
                  />
                  <datalist id="naturezas-re">
                    {["Incêndio", "Roubo", "Danos elétricos", "Vendaval", "Inundação", "Alagamento", "Outros"].map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </Field>
              </div>
              <Field label="Descrição detalhada dos danos" required error={errors.descricaoDanos} className="mt-4">
                <Textarea
                  value={form.descricaoDanos}
                  onChange={(e) => set("descricaoDanos", e.target.value)}
                  placeholder="Informe o que foi danificado, a extensão e as circunstâncias observadas..."
                />
              </Field>
            </FormSection>
          )}
        </div>

        <div className="space-y-4">
          <FormSection title="Envolvidos" icon={<IconUser className="h-4 w-4" />}>
            <div className="space-y-4">
              <Field label="Cliente ou segurado" required error={errors.clienteNome}
                hint="Campo livre: não é necessário cadastrar o cliente antes.">
                <Input list="sinistro-clientes" value={form.clienteNome} onChange={(e) => set("clienteNome", e.target.value)} placeholder="Nome da pessoa ou empresa" />
                <datalist id="sinistro-clientes">
                  {clientes.map((c) => <option key={c.id} value={c.nome} />)}
                </datalist>
              </Field>
              <Field label="Seguradora" required error={errors.seguradoraNome}
                hint="Campo livre: use o nome informado na apólice.">
                <Input list="sinistro-seguradoras" value={form.seguradoraNome} onChange={(e) => set("seguradoraNome", e.target.value)} placeholder="Nome da seguradora" />
                <datalist id="sinistro-seguradoras">
                  {seguradoras.map((s) => <option key={s.id} value={s.nome} />)}
                </datalist>
              </Field>
              {form.categoria === "Automóvel" ? (
                <Field label="Oficina ou destino" required error={errors.oficinaNome}
                  hint="Campo livre para oficina, concessionária ou endereço.">
                  <Input list="sinistro-oficinas" value={form.oficinaNome} onChange={(e) => set("oficinaNome", e.target.value)} placeholder="Nome da oficina ou destino" />
                  <datalist id="sinistro-oficinas">
                    {oficinas.map((o) => <option key={o.id} value={o.nome} />)}
                  </datalist>
                </Field>
              ) : (
                <>
                  <Field label="Contato do segurado" required error={errors.contatoSegurado} hint="Telefone e/ou e-mail.">
                    <Input
                      value={form.contatoSegurado}
                      onChange={(e) => set("contatoSegurado", e.target.value)}
                      placeholder="Telefone e e-mail"
                    />
                  </Field>
                  <Field label="Testemunhas" hint="Opcional. Informe nomes e contatos, se houver.">
                    <Textarea
                      value={form.testemunhas}
                      onChange={(e) => set("testemunhas", e.target.value)}
                      placeholder="Nome, telefone ou outras informações..."
                    />
                  </Field>
                </>
              )}
            </div>
          </FormSection>

          <FormSection title="Datas e observações" icon={<IconCalendar className="h-4 w-4" />}>
            <Field label="Data do sinistro" required error={errors.data}>
              <Input type="date" value={form.data} onChange={(e) => set("data", e.target.value)} />
            </Field>
            <Field label="Hora aproximada" className="mt-4">
              <Input type="time" value={form.horaOcorrencia} onChange={(e) => set("horaOcorrencia", e.target.value)} />
            </Field>
            {form.categoria === "Ramos Elementares" && (
              <Field label="Localização do sinistro" required error={errors.localizacaoSinistro} className="mt-4" hint="Endereço completo ou referência do local.">
                <Textarea
                  value={form.localizacaoSinistro}
                  onChange={(e) => set("localizacaoSinistro", e.target.value)}
                  placeholder="Rua, número, bairro, cidade..."
                />
              </Field>
            )}
            <Field label="Observações" className="mt-4">
              <Textarea
                value={form.observacoes}
                onChange={(e) => set("observacoes", e.target.value)}
                placeholder="BO, perícia, pendências..."
              />
            </Field>
          </FormSection>

          <FormSection title="Documentos" icon={<IconBuilding className="h-4 w-4" />}>
            <DocumentUpload
              documentos={form.documentos}
              onChange={(docs) => set("documentos", docs)}
              notify={notify}
            />
          </FormSection>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={() => navigate("sinistros")}>
          Cancelar
        </Button>
        <Button type="submit" size="lg">
          <IconCheck className="h-4 w-4" />
          {editing ? "Salvar alterações" : "Registrar sinistro"}
        </Button>
      </div>
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
