import { type ItemKind, RecapSort, type RecapStatus } from "@/backend";
import type { RecapFilter, RecapView } from "@/backend";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { type FilterState, RecapFilters } from "@/components/RecapFilters";
import { RecapForm } from "@/components/RecapForm";
import { RecapTable } from "@/components/RecapTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBackendReady,
  useDeleteRecap,
  useItems,
  useRecaps,
  useUpdateRecap,
} from "@/hooks/useQueries";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { NotebookPen, PackagePlus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function toFilter(state: FilterState): RecapFilter {
  const filter: RecapFilter = {};
  if (state.startDate) filter.startDate = state.startDate;
  if (state.endDate) filter.endDate = state.endDate;
  if (state.kind !== "all") filter.kind = state.kind as ItemKind;
  if (state.status !== "all") filter.status = state.status as RecapStatus;
  if (state.search.trim()) filter.search = state.search.trim();
  return filter;
}

export function RekapPage() {
  const search = useSearch({ from: "/rekap" });
  const navigate = useNavigate();

  const filters = useMemo<FilterState>(
    () => ({
      startDate: search.startDate ?? "",
      endDate: search.endDate ?? "",
      kind: search.kind ?? "all",
      status: search.status ?? "all",
      search: search.search ?? "",
      sort: search.sort ?? RecapSort.dateDesc,
    }),
    [search],
  );

  function setFilters(next: FilterState) {
    void navigate({
      to: "/rekap",
      search: {
        startDate: next.startDate || undefined,
        endDate: next.endDate || undefined,
        kind: next.kind === "all" ? undefined : (next.kind as ItemKind),
        status:
          next.status === "all" ? undefined : (next.status as RecapStatus),
        search: next.search || undefined,
        sort: next.sort,
      },
      replace: true,
    });
  }

  const [editing, setEditing] = useState<RecapView | null>(null);
  const [deleting, setDeleting] = useState<RecapView | null>(null);

  const filter = useMemo(() => toFilter(filters), [filters]);
  const recapsQuery = useRecaps(filter, filters.sort);
  const itemsQuery = useItems();
  const backendReady = useBackendReady();
  const updateRecap = useUpdateRecap();
  const deleteRecap = useDeleteRecap();

  const recaps = recapsQuery.data ?? [];
  const items = itemsQuery.data ?? [];

  function handleDelete() {
    if (!deleting) return;
    deleteRecap.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Rekap dihapus");
        setDeleting(null);
      },
      onError: () => toast.error("Gagal menghapus rekap"),
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:py-14">
      <PageHeader
        eyebrow="Riwayat"
        title="Daftar & riwayat rekap"
        description="Filter berdasarkan rentang tanggal, jenis item, dan status. Cari nama item lalu urutkan sesuai kebutuhan."
        action={
          <Button asChild className="rounded-lg">
            <Link to="/" data-ocid="rekap.new_recap_link">
              <Plus className="size-4" aria-hidden="true" />
              Rekap baru
            </Link>
          </Button>
        }
      />

      <RecapFilters value={filters} onChange={setFilters} />

      {recapsQuery.isLoading || !backendReady ? (
        <div data-ocid="rekap.loading_state" className="flex flex-col gap-3">
          {Array.from({ length: 6 }, (_, i) => `row-${i}`).map((id) => (
            <Skeleton key={id} className="h-12 w-full" />
          ))}
        </div>
      ) : recaps.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          ocid="rekap.empty_state"
          title="Belum ada rekap tercatat"
          description="Mulai catat porsi nasi dan lauk hari ini, atau sesuaikan filter untuk menemukan data lama."
          action={
            <Button asChild className="rounded-lg">
              <Link to="/" data-ocid="rekap.empty_action_link">
                Catat rekap pertama
              </Link>
            </Button>
          }
        />
      ) : (
        <RecapTable
          recaps={recaps}
          onEdit={(recap) => setEditing(recap)}
          onDelete={(recap) => setDeleting(recap)}
        />
      )}

      {editing ? (
        <Card
          data-ocid="rekap.edit_panel"
          className="rounded-xl border-border shadow-elevated"
        >
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Ubah rekap — {editing.itemName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <EmptyState
                icon={PackagePlus}
                ocid="rekap.edit_empty_state"
                title="Belum ada jenis item"
                description="Tambahkan jenis item terlebih dahulu untuk mengubah rekap ini."
                action={
                  <Button asChild className="rounded-lg">
                    <Link to="/item" data-ocid="rekap.manage_items_link">
                      Kelola jenis item
                    </Link>
                  </Button>
                }
              />
            ) : (
              <RecapForm
                key={editing.id.toString()}
                items={items}
                initial={editing}
                submitLabel="Simpan perubahan"
                pending={updateRecap.isPending}
                onCancel={() => setEditing(null)}
                onSubmit={(input) => {
                  updateRecap.mutate(
                    { id: editing.id, input },
                    {
                      onSuccess: (result) => {
                        if (result.__kind__ === "err") {
                          toast.error("Gagal memperbarui rekap");
                          return;
                        }
                        toast.success("Rekap diperbarui");
                        setEditing(null);
                      },
                      onError: () => toast.error("Gagal memperbarui rekap"),
                    },
                  );
                }}
              />
            )}
          </CardContent>
        </Card>
      ) : null}

      <ConfirmDialog
        open={deleting !== null}
        title="Hapus rekap ini?"
        description={
          deleting
            ? `Rekap ${deleting.itemName} pada ${deleting.date} akan dihapus permanen.`
            : ""
        }
        confirmLabel="Hapus rekap"
        pending={deleteRecap.isPending}
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
