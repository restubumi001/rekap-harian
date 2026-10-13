import { ItemKind, RecapStatus } from "@/backend";

export function formatPorsi(value: bigint): string {
  return value.toString();
}

export function formatSignedPorsi(value: bigint): string {
  const n = Number(value);
  if (n > 0) return `+${n}`;
  return `${n}`;
}

export function formatTanggal(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTanggalPanjang(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function todayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export function kindLabel(kind: ItemKind): string {
  switch (kind) {
    case ItemKind.rice:
      return "Nasi";
    case ItemKind.sideDish:
      return "Lauk";
    default:
      return "Lainnya";
  }
}

export function statusLabel(status: RecapStatus): string {
  switch (status) {
    case RecapStatus.surplus:
      return "Kelebihan";
    case RecapStatus.shortfall:
      return "Kekurangan";
    default:
      return "Seimbang";
  }
}
