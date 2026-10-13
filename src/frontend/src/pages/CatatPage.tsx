import { RecapError } from "@/backend";
import type { RecapInput } from "@/backend";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { RecapForm } from "@/components/RecapForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddRecap, useBackendReady, useItems } from "@/hooks/useQueries";
import { todayIso } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, PackagePlus, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function recapErrorMessage(error: RecapError): string {
  switch (error) {
    case RecapError.invalidDate:
      return "Tanggal tidak valid.";
    case RecapError.invalidAmount:
      return "Jumlah porsi harus angka positif.";
    case RecapError.unknownItem:
      return "Jenis item tidak ditemukan.";
    case RecapError.invalidName:
      return "Nama item wajib diisi.";
    case RecapError.unknownRecap:
      return "Rekap tidak ditemukan.";
    case RecapError.notAuthorized:
      return "Anda tidak memiliki akses untuk mencatat rekap.";
    default:
      return "Gagal menyimpan rekap. Coba lagi.";
  }
}

export function CatatPage() {
  const itemsQuery = useItems();
  const backendReady = useBackendReady();
  const addRecap = useAddRecap();
  const [savedCount, setSavedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const items = itemsQuery.data ?? [];

  function handleSubmit(input: RecapInput) {
    setErrorMessage(undefined);
    addRecap.mutate(input, {
      onSuccess: (result) => {
        if (result.__kind__ === "err") {
          setErrorMessage(recapErrorMessage(result.err));
          return;
        }
        setSavedCount((count) => count + 1);
        toast.success("Rekap harian tersimpan", {
          description: `${result.ok.itemName} · ${result.ok.date}`,
        });
      },
      onError: () => {
        setErrorMessage("Gagal menyimpan rekap. Coba lagi.");
      },
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:py-14">
      <PageHeader
        eyebrow="Pencatatan"
        title="Catat rekap harian"
        description="Masukkan jumlah porsi tersedia dan terpakai. Sistem menghitung selisih otomatis dan menandai kelebihan atau kekurangan."
        action={
          <Button asChild variant="outline" className="rounded-lg">
            <Link
              to="/rekap"
              search={{
                startDate: undefined,
                endDate: undefined,
                kind: undefined,
                status: undefined,
                search: undefined,
                sort: undefined,
              }}
              data-ocid="catat.view_recap_link"
            >
              Lihat rekap
            </Link>
          </Button>
        }
      />

      {savedCount > 0 ? (
        <div
          data-ocid="catat.success_state"
          className="flex items-center gap-3 rounded-xl border border-surplus bg-surplus-soft px-4 py-3 text-sm text-surplus"
        >
          <CheckCircle2 className="size-5" aria-hidden="true" />
          <span>
            {savedCount} rekap tersimpan. Lanjutkan mencatat atau lihat daftar
            rekap.
          </span>
        </div>
      ) : null}

      <Card className="rounded-xl border-border shadow-elevated">
        <CardHeader>
          <CardTitle className="font-display text-xl">
            Entri rekap baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          {itemsQuery.isLoading || !backendReady ? (
            <div
              data-ocid="catat.loading_state"
              className="flex flex-col gap-4"
            >
              {Array.from({ length: 4 }, (_, i) => `field-${i}`).map((id) => (
                <Skeleton key={id} className="h-10 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={PackagePlus}
              ocid="catat.empty_state"
              title="Belum ada jenis item"
              description="Tambahkan nasi, lauk, atau item lain terlebih dahulu sebelum mencatat rekap harian."
              action={
                <Button asChild className="rounded-lg">
                  <Link to="/item" data-ocid="catat.manage_items_link">
                    Kelola jenis item
                  </Link>
                </Button>
              }
            />
          ) : (
            <RecapForm
              items={items}
              submitLabel="Simpan rekap"
              pending={addRecap.isPending}
              errorMessage={errorMessage}
              onSubmit={handleSubmit}
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-subtle">
          <UtensilsCrossed
            className="mt-0.5 size-5 text-primary"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <span className="font-display text-sm font-semibold">
              Nasi &amp; lauk
            </span>
            <span className="text-xs text-muted-foreground">
              Catat setiap item secara terpisah agar akumulasi per jenis akurat.
            </span>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-subtle">
          <CheckCircle2
            className="mt-0.5 size-5 text-surplus"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <span className="font-display text-sm font-semibold">
              Kelebihan porsi
            </span>
            <span className="text-xs text-muted-foreground">
              Tersedia lebih banyak daripada terpakai — ditandai hijau.
            </span>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-subtle">
          <CheckCircle2
            className="mt-0.5 size-5 text-shortfall"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <span className="font-display text-sm font-semibold">
              Kekurangan porsi
            </span>
            <span className="text-xs text-muted-foreground">
              Terpakai melebihi tersedia — ditandai merah.
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Tanggal hari ini: {todayIso()}
      </p>
    </div>
  );
}
