import { ItemError, ItemKind } from "@/backend";
import type { Item } from "@/backend";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddItem,
  useBackendReady,
  useDeleteItem,
  useItems,
  useUpdateItem,
} from "@/hooks/useQueries";
import { kindLabel } from "@/lib/format";
import { Pencil, Plus, Trash2, Utensils } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

function itemErrorMessage(error: ItemError): string {
  switch (error) {
    case ItemError.invalidName:
      return "Nama item wajib diisi.";
    case ItemError.itemInUse:
      return "Item masih dipakai pada rekap sehingga tidak bisa dihapus.";
    case ItemError.unknownItem:
      return "Item tidak ditemukan.";
    case ItemError.notAuthorized:
      return "Anda tidak memiliki akses.";
    default:
      return "Terjadi kesalahan. Coba lagi.";
  }
}

export function ItemPage() {
  const itemsQuery = useItems();
  const backendReady = useBackendReady();
  const addItem = useAddItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const [name, setName] = useState("");
  const [kind, setKind] = useState<ItemKind>(ItemKind.rice);
  const [editing, setEditing] = useState<Item | null>(null);
  const [editName, setEditName] = useState("");
  const [editKind, setEditKind] = useState<ItemKind>(ItemKind.rice);
  const [deleting, setDeleting] = useState<Item | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const items = itemsQuery.data ?? [];

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage("Nama item wajib diisi.");
      return;
    }
    setErrorMessage(undefined);
    addItem.mutate(
      { name: trimmed, kind },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            setErrorMessage(itemErrorMessage(result.err));
            return;
          }
          setName("");
          toast.success("Jenis item ditambahkan");
        },
        onError: () => setErrorMessage("Gagal menambahkan item."),
      },
    );
  }

  function startEdit(item: Item) {
    setEditing(item);
    setEditName(item.name);
    setEditKind(item.kind);
  }

  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error("Nama item wajib diisi.");
      return;
    }
    updateItem.mutate(
      { id: editing.id, input: { name: trimmed, kind: editKind } },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "err") {
            toast.error(itemErrorMessage(result.err));
            return;
          }
          toast.success("Jenis item diperbarui");
          setEditing(null);
        },
        onError: () => toast.error("Gagal memperbarui item"),
      },
    );
  }

  function handleDelete() {
    if (!deleting) return;
    deleteItem.mutate(deleting.id, {
      onSuccess: (result) => {
        if (result.__kind__ === "err") {
          toast.error(itemErrorMessage(result.err));
          setDeleting(null);
          return;
        }
        toast.success("Jenis item dihapus");
        setDeleting(null);
      },
      onError: () => toast.error("Gagal menghapus item"),
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:py-14">
      <PageHeader
        eyebrow="Pengelolaan"
        title="Jenis item"
        description="Kelola daftar nasi, lauk, dan item lain yang dipakai saat mencatat rekap harian."
      />

      <Card className="rounded-xl border-border shadow-elevated">
        <CardHeader>
          <CardTitle className="font-display text-xl">
            Tambah jenis item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAdd}
            className="flex flex-col gap-4 md:flex-row md:items-end"
          >
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="item-name">Nama item</Label>
              <Input
                id="item-name"
                data-ocid="item.name_input"
                placeholder="Contoh: Nasi putih"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 md:w-56">
              <Label htmlFor="item-kind">Jenis</Label>
              <Select
                value={kind}
                onValueChange={(next) => setKind(next as ItemKind)}
              >
                <SelectTrigger id="item-kind" data-ocid="item.kind_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ItemKind.rice}>Nasi</SelectItem>
                  <SelectItem value={ItemKind.sideDish}>Lauk</SelectItem>
                  <SelectItem value={ItemKind.other}>Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              data-ocid="item.add_button"
              disabled={addItem.isPending}
              className="rounded-lg"
            >
              <Plus className="size-4" aria-hidden="true" />
              {addItem.isPending ? "Menambah…" : "Tambah item"}
            </Button>
          </form>
          {errorMessage ? (
            <p
              data-ocid="item.error_state"
              className="mt-3 text-sm text-destructive"
            >
              {errorMessage}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {itemsQuery.isLoading || !backendReady ? (
        <div data-ocid="item.loading_state" className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, i) => `item-${i}`).map((id) => (
            <Skeleton key={id} className="h-16 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Utensils}
          ocid="item.empty_state"
          title="Belum ada jenis item"
          description="Tambahkan nasi, lauk, atau item lain melalui formulir di atas untuk mulai mencatat rekap."
        />
      ) : (
        <ul data-ocid="item.list" className="flex flex-col gap-3">
          {items.map((item, index) => (
            <li
              key={item.id.toString()}
              data-ocid={`item.item.${index + 1}`}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-subtle md:flex-row md:items-center md:justify-between"
            >
              {editing && editing.id === item.id ? (
                <form
                  onSubmit={handleUpdate}
                  className="flex flex-1 flex-col gap-3 md:flex-row md:items-end"
                >
                  <div className="flex flex-1 flex-col gap-2">
                    <Label htmlFor={`edit-name-${index}`}>Nama item</Label>
                    <Input
                      id={`edit-name-${index}`}
                      data-ocid={`item.edit_input.${index + 1}`}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:w-48">
                    <Label htmlFor={`edit-kind-${index}`}>Jenis</Label>
                    <Select
                      value={editKind}
                      onValueChange={(next) => setEditKind(next as ItemKind)}
                    >
                      <SelectTrigger
                        id={`edit-kind-${index}`}
                        data-ocid={`item.edit_kind_select.${index + 1}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ItemKind.rice}>Nasi</SelectItem>
                        <SelectItem value={ItemKind.sideDish}>Lauk</SelectItem>
                        <SelectItem value={ItemKind.other}>Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      data-ocid={`item.save_button.${index + 1}`}
                      disabled={updateItem.isPending}
                      className="rounded-lg"
                    >
                      Simpan
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      data-ocid={`item.cancel_button.${index + 1}`}
                      onClick={() => setEditing(null)}
                      className="rounded-lg"
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="font-display text-base font-semibold">
                      {item.name}
                    </span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      {kindLabel(item.kind)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-ocid={`item.edit_button.${index + 1}`}
                      onClick={() => startEdit(item)}
                      className="rounded-lg"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      Ubah
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      data-ocid={`item.delete_button.${index + 1}`}
                      onClick={() => setDeleting(item)}
                      className="rounded-lg text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Hapus
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Hapus jenis item ini?"
        description={
          deleting
            ? `${deleting.name} akan dihapus. Item yang masih dipakai pada rekap tidak dapat dihapus.`
            : ""
        }
        confirmLabel="Hapus item"
        pending={deleteItem.isPending}
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
