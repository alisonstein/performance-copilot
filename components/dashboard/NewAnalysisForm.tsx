"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { UploadDropzone } from "@/components/dashboard/UploadDropzone";
import { AnalysisProgress } from "@/components/dashboard/AnalysisProgress";
import { PLATFORM_OPTIONS, MAX_CSV_FILE_SIZE_BYTES } from "@/lib/constants";
import { PRIMARY_RESULT_OPTIONS } from "@/lib/analysis/primary-result";
import { cn } from "@/lib/utils";
import type { Platform } from "@/types/database";
import type { PrimaryResultType } from "@/types/domain";

interface ClientOption {
  id: string;
  name: string;
}

interface NewAnalysisFormProps {
  clients: ClientOption[];
  preselectedClientId?: string;
}

function defaultDates() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  const toIso = (date: Date) => date.toISOString().slice(0, 10);
  return { start: toIso(start), end: toIso(end) };
}

export function NewAnalysisForm({ clients, preselectedClientId }: NewAnalysisFormProps) {
  const router = useRouter();
  const { start, end } = defaultDates();

  const [clientId, setClientId] = useState(preselectedClientId ?? clients[0]?.id ?? "");
  const [platform, setPlatform] = useState<Platform>("meta_ads");
  const [primaryResultType, setPrimaryResultType] = useState<PrimaryResultType>("other");
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFileSelect(selected: File | null) {
    setFileError(undefined);
    setFormError(null);

    if (!selected) {
      setFile(null);
      return;
    }

    const isCsv = selected.name.toLowerCase().endsWith(".csv");
    if (!isCsv) {
      setFileError("Envie um arquivo no formato .csv.");
      setFile(null);
      return;
    }

    if (selected.size > MAX_CSV_FILE_SIZE_BYTES) {
      setFileError("O arquivo excede o limite de 10 MB.");
      setFile(null);
      return;
    }

    if (selected.size === 0) {
      setFileError("O arquivo está vazio.");
      setFile(null);
      return;
    }

    setFile(selected);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!clientId) {
      setFormError("Selecione um cliente.");
      return;
    }
    if (!file) {
      setFormError("Selecione um arquivo CSV para continuar.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setFormError("A data inicial não pode ser depois da data final.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("clientId", clientId);
      formData.set("platform", platform);
      formData.set("primaryResultType", primaryResultType);
      formData.set("startDate", startDate);
      formData.set("endDate", endDate);
      formData.set("file", file);

      const response = await fetch("/api/analysis", { method: "POST", body: formData });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFormError(payload.error ?? "Não foi possível processar o arquivo. Tente novamente.");
        setIsSubmitting(false);
        return;
      }

      router.push(`/dashboard/analysis/${payload.analysisId}`);
    } catch {
      setFormError("Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.");
      setIsSubmitting(false);
    }
  }

  if (isSubmitting) {
    return <AnalysisProgress />;
  }

  if (clients.length === 0) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="text-[15px] font-medium text-ink">Cadastre um cliente antes de criar uma análise.</p>
        <p className="mt-1.5 text-sm text-ink-secondary">
          Toda análise precisa estar vinculada a um cliente.
        </p>
        <Link href="/dashboard/clients" className="btn-primary mt-5 inline-flex !px-5 !py-2.5 !text-sm">
          Adicionar cliente
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface flex flex-col gap-5 p-6 sm:p-8" noValidate>
      {formError ? (
        <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-3.5 py-2.5 text-sm text-red-300">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="clientId" className="text-sm font-medium text-ink-secondary">
            Cliente
          </label>
          <select
            id="clientId"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            className="w-full rounded-xl border border-border bg-white/[0.03] px-4 py-3 text-[15px] text-ink focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light"
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="platform" className="text-sm font-medium text-ink-secondary">
            Plataforma
          </label>
          <select
            id="platform"
            value={platform}
            onChange={(event) => setPlatform(event.target.value as Platform)}
            className="w-full rounded-xl border border-border bg-white/[0.03] px-4 py-3 text-[15px] text-ink focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light"
          >
            {PLATFORM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="primaryResultType" className="text-sm font-medium text-ink-secondary">
            Resultado principal
          </label>
          <select
            id="primaryResultType"
            value={primaryResultType}
            onChange={(event) => setPrimaryResultType(event.target.value as PrimaryResultType)}
            className="w-full rounded-xl border border-border bg-white/[0.03] px-4 py-3 text-[15px] text-ink focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light"
          >
            {PRIMARY_RESULT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-ink-secondary">
            O que você está otimizando nesta campanha — define o KPI de destaque e o foco da análise.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="startDate" className="text-sm font-medium text-ink-secondary">
            Data inicial
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            max={endDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="w-full rounded-xl border border-border bg-white/[0.03] px-4 py-3 text-[15px] text-ink focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="endDate" className="text-sm font-medium text-ink-secondary">
            Data final
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="w-full rounded-xl border border-border bg-white/[0.03] px-4 py-3 text-[15px] text-ink focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light"
          />
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-secondary">Arquivo de campanha</p>
        <UploadDropzone file={file} onFileSelect={handleFileSelect} error={fileError} />
      </div>

      <button type="submit" className={cn("btn-primary w-full")}>
        <Sparkles size={17} />
        Analisar campanha
      </button>
    </form>
  );
}
