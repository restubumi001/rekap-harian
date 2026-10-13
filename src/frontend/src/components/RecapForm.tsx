import { ItemKind } from "@/backend";
import type { Item, RecapInput, RecapView } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { kindLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { type FormEvent, useMemo, useState } from "react";

export interface RecapFormValues {
  date: string;
  itemId: string;
  available: string;
  used: string;
}

interface RecapFormProps {
  items: Item[];
  initial?: RecapView;
  submitLabel: string;
  pending: boolean;
  errorMessage?: string;
  onSubmit: (input: RecapInput) => void;
  onCancel?: () => void;
}

function initialValues(initial?: RecapView): RecapFormValues {
  if (!initial) {
    return { date: "", itemId: "", available: "", used: "" };
  }
  return {
    date: initial.date,
    itemId: initial.itemId.toString(),
    available: initial.available.toString(),
    used: initial.used.toString(),
  };
}

export function RecapForm({
  items,
  initial,
  submitLabel,
  pending,
  errorMessage,
  onSubmit,
  onCancel,
}: RecapFormProps) {
  const [values, setValues] = useState<RecapFormValues>(() =>
    initialValues(initial),
  );
  const [touched, setTouched] = useState(false);

  const errors = useMemo(() => {
    const next: Partial<Record<keyof RecapFormValues, string>> = {};
    if (!values.date) next.date = "Tanggal wajib diisi.";
    if (!values.itemId) next.itemId = "Pilih jenis item.";
    const available = Number(values.available);
    if (!values.available || Number.isNaN(available) || available <= 0) {
      next.available = "Jumlah tersedia harus angka positif.";
    }
    const used = Number(values.used);
    if (!values.used || Number.isNaN(used) || used <= 0) {
      next.used = "Jumlah terpakai harus angka positif.";
    }
    return next;
  }, [values]);

  const hasErrors = Object.keys(errors).length > 0;

  const difference = useMemo(() => {
    const available = Number(values.available);
    const used = Number(values.used);
    if (Number.isNaN(available) || Number.isNaN(used)) return null;
    if (!values.available || !values.used) return null;
    return available - used;
  }, [values.available, values.used]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (hasErrors) return;
    onSubmit({
      date: values.date,
      itemId: BigInt(values.itemId),
      available: BigInt(values.available),
      used: BigInt(values.used),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="recap-date">Tanggal</Label>
          <Input
            id="recap-date"
            type="date"
            data-ocid="recap.date_input"
            value={values.date}
            aria-invalid={touched && !!errors.date}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, date: e.target.value }))
            }
          />
          {touched && errors.date ? (
            <p
              data-ocid="recap.date_error"
              className="text-xs text-destructive"
            >
              {errors.date}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="recap-item">Jenis item</Label>
          <Select
            value={values.itemId}
            onValueChange={(value) =>
              setValues((prev) => ({ ...prev, itemId: value }))
            }
          >
            <SelectTrigger
              id="recap-item"
              data-ocid="recap.item_select"
              aria-invalid={touched && !!errors.itemId}
            >
              <SelectValue placeholder="Pilih item" />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem
                  key={item.id.toString()}
                  value={item.id.toString()}
                  data-ocid="recap.item_option"
                >
                  {item.name} · {kindLabel(item.kind)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {touched && errors.itemId ? (
            <p
              data-ocid="recap.item_error"
              className="text-xs text-destructive"
            >
              {errors.itemId}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="recap-available">Porsi tersedia</Label>
          <Input
            id="recap-available"
            type="number"
            min="1"
            inputMode="numeric"
            data-ocid="recap.available_input"
            value={values.available}
            aria-invalid={touched && !!errors.available}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, available: e.target.value }))
            }
          />
          {touched && errors.available ? (
            <p
              data-ocid="recap.available_error"
              className="text-xs text-destructive"
            >
              {errors.available}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="recap-used">Porsi terpakai</Label>
          <Input
            id="recap-used"
            type="number"
            min="1"
            inputMode="numeric"
            data-ocid="recap.used_input"
            value={values.used}
            aria-invalid={touched && !!errors.used}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, used: e.target.value }))
            }
          />
          {touched && errors.used ? (
            <p
              data-ocid="recap.used_error"
              className="text-xs text-destructive"
            >
              {errors.used}
            </p>
          ) : null}
        </div>
      </div>

      <div
        data-ocid="recap.difference_preview"
        className={cn(
          "flex items-center justify-between rounded-lg border px-4 py-3",
          difference === null
            ? "border-border bg-muted/40"
            : difference > 0
              ? "border-surplus bg-surplus-soft"
              : difference < 0
                ? "border-shortfall bg-shortfall-soft"
                : "border-border bg-muted/40",
        )}
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Selisih otomatis
        </span>
        <span
          className={cn(
            "font-mono-num text-lg font-bold",
            difference === null
              ? "text-muted-foreground"
              : difference > 0
                ? "text-surplus"
                : difference < 0
                  ? "text-shortfall"
                  : "text-foreground",
          )}
        >
          {difference === null
            ? "—"
            : difference > 0
              ? `Kelebihan ${difference} porsi`
              : difference < 0
                ? `Kekurangan ${Math.abs(difference)} porsi`
                : "Seimbang"}
        </span>
      </div>

      {errorMessage ? (
        <p data-ocid="recap.error_state" className="text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          data-ocid="recap.submit_button"
          disabled={pending}
          className="rounded-lg"
        >
          {pending ? "Menyimpan…" : submitLabel}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            data-ocid="recap.cancel_button"
            onClick={onCancel}
            className="rounded-lg"
          >
            Batal
          </Button>
        ) : null}
      </div>
    </form>
  );
}
