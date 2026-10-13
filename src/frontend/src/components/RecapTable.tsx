import type { RecapView } from "@/backend";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatPorsi,
  formatSignedPorsi,
  formatTanggal,
  kindLabel,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";

interface RecapTableProps {
  recaps: RecapView[];
  onEdit: (recap: RecapView) => void;
  onDelete: (recap: RecapView) => void;
}

export function RecapTable({ recaps, onEdit, onDelete }: RecapTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-subtle">
      <Table data-ocid="recap.table">
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="px-4 py-3">Tanggal</TableHead>
            <TableHead className="px-4 py-3">Item</TableHead>
            <TableHead className="px-4 py-3">Jenis</TableHead>
            <TableHead className="px-4 py-3 text-right">Tersedia</TableHead>
            <TableHead className="px-4 py-3 text-right">Terpakai</TableHead>
            <TableHead className="px-4 py-3 text-right">Selisih</TableHead>
            <TableHead className="px-4 py-3">Status</TableHead>
            <TableHead className="px-4 py-3 text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recaps.map((recap, index) => (
            <TableRow
              key={recap.id.toString()}
              data-ocid={`recap.row.${index + 1}`}
              className="transition-smooth hover:bg-muted/50"
            >
              <TableCell className="px-4 py-3 font-medium">
                {formatTanggal(recap.date)}
              </TableCell>
              <TableCell className="px-4 py-3">{recap.itemName}</TableCell>
              <TableCell className="px-4 py-3 text-muted-foreground">
                {kindLabel(recap.kind)}
              </TableCell>
              <TableCell className="px-4 py-3 text-right font-mono-num">
                {formatPorsi(recap.available)}
              </TableCell>
              <TableCell className="px-4 py-3 text-right font-mono-num">
                {formatPorsi(recap.used)}
              </TableCell>
              <TableCell
                className={cn(
                  "px-4 py-3 text-right font-mono-num font-semibold",
                  recap.difference > 0n
                    ? "text-surplus"
                    : recap.difference < 0n
                      ? "text-shortfall"
                      : "text-muted-foreground",
                )}
              >
                {formatSignedPorsi(recap.difference)}
              </TableCell>
              <TableCell className="px-4 py-3">
                <StatusBadge status={recap.status} />
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Ubah rekap ${recap.itemName}`}
                    data-ocid={`recap.edit_button.${index + 1}`}
                    onClick={() => onEdit(recap)}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Hapus rekap ${recap.itemName}`}
                    data-ocid={`recap.delete_button.${index + 1}`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(recap)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
