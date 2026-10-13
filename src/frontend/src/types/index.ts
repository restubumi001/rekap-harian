import { ItemKind, RecapSort, RecapStatus } from "@/backend";
import type {
  DailyTrendPoint,
  Item,
  KindSummary,
  RecapFilter,
  RecapSummary,
  RecapView,
} from "@/backend";

export type {
  DailyTrendPoint,
  Item,
  KindSummary,
  RecapFilter,
  RecapSummary,
  RecapView,
};

export { ItemKind, RecapSort, RecapStatus };

export interface RecapSearch {
  startDate?: string;
  endDate?: string;
  kind?: ItemKind;
  status?: RecapStatus;
  search?: string;
  sort?: RecapSort;
}

export const KIND_LABEL: Record<ItemKind, string> = {
  [ItemKind.rice]: "Nasi",
  [ItemKind.sideDish]: "Lauk",
  [ItemKind.other]: "Lainnya",
};

export const STATUS_LABEL: Record<RecapStatus, string> = {
  [RecapStatus.surplus]: "Kelebihan",
  [RecapStatus.shortfall]: "Kekurangan",
  [RecapStatus.balanced]: "Seimbang",
};

export const SORT_LABEL: Record<RecapSort, string> = {
  [RecapSort.dateDesc]: "Tanggal terbaru",
  [RecapSort.dateAsc]: "Tanggal terlama",
  [RecapSort.differenceDesc]: "Selisih terbesar",
  [RecapSort.differenceAsc]: "Selisih terkecil",
};
