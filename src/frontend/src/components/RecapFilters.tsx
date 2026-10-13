import { ItemKind, RecapSort, RecapStatus } from "@/backend";
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
import { Search, X } from "lucide-react";

export interface FilterState {
  startDate: string;
  endDate: string;
  kind: string;
  status: string;
  search: string;
  sort: RecapSort;
}

export const EMPTY_FILTERS: FilterState = {
  startDate: "",
  endDate: "",
  kind: "all",
  status: "all",
  search: "",
  sort: RecapSort.dateDesc,
};

interface RecapFiltersProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
}

export function RecapFilters({ value, onChange }: RecapFiltersProps) {
  function patch(partial: Partial<FilterState>) {
    onChange({ ...value, ...partial });
  }

  const hasActive =
    value.startDate !== "" ||
    value.endDate !== "" ||
    value.kind !== "all" ||
    value.status !== "all" ||
    value.search !== "";

  return (
    <div
      data-ocid="recap.filters"
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-subtle"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="filter-start">Dari tanggal</Label>
          <Input
            id="filter-start"
            type="date"
            data-ocid="recap.filter.start_input"
            value={value.startDate}
            onChange={(e) => patch({ startDate: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="filter-end">Sampai tanggal</Label>
          <Input
            id="filter-end"
            type="date"
            data-ocid="recap.filter.end_input"
            value={value.endDate}
            onChange={(e) => patch({ endDate: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="filter-kind">Jenis item</Label>
          <Select
            value={value.kind}
            onValueChange={(next) => patch({ kind: next })}
          >
            <SelectTrigger
              id="filter-kind"
              data-ocid="recap.filter.kind_select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua jenis</SelectItem>
              <SelectItem value={ItemKind.rice}>Nasi</SelectItem>
              <SelectItem value={ItemKind.sideDish}>Lauk</SelectItem>
              <SelectItem value={ItemKind.other}>Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="filter-status">Status</Label>
          <Select
            value={value.status}
            onValueChange={(next) => patch({ status: next })}
          >
            <SelectTrigger
              id="filter-status"
              data-ocid="recap.filter.status_select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua status</SelectItem>
              <SelectItem value={RecapStatus.surplus}>Kelebihan</SelectItem>
              <SelectItem value={RecapStatus.shortfall}>Kekurangan</SelectItem>
              <SelectItem value={RecapStatus.balanced}>Seimbang</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="filter-search">Cari nama item</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="filter-search"
              type="search"
              placeholder="Contoh: Nasi putih"
              data-ocid="recap.search_input"
              className="pl-9"
              value={value.search}
              onChange={(e) => patch({ search: e.target.value })}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="filter-sort">Urutkan</Label>
          <Select
            value={value.sort}
            onValueChange={(next) => patch({ sort: next as RecapSort })}
          >
            <SelectTrigger id="filter-sort" data-ocid="recap.sort_select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RecapSort.dateDesc}>
                Tanggal terbaru
              </SelectItem>
              <SelectItem value={RecapSort.dateAsc}>Tanggal terlama</SelectItem>
              <SelectItem value={RecapSort.differenceDesc}>
                Selisih terbesar
              </SelectItem>
              <SelectItem value={RecapSort.differenceAsc}>
                Selisih terkecil
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActive ? (
        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-ocid="recap.filter.reset_button"
            className="rounded-lg"
            onClick={() => onChange({ ...EMPTY_FILTERS, sort: value.sort })}
          >
            <X className="size-4" aria-hidden="true" />
            Bersihkan filter
          </Button>
        </div>
      ) : null}
    </div>
  );
}
