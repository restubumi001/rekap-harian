import type {
  DailyTrendPoint,
  Item,
  ItemInput,
  KindSummary,
  RecapFilter,
  RecapInput,
  RecapSummary,
  RecapView,
} from "@/backend";
import { ItemKind, type RecapSort, RecapStatus } from "@/backend";
import { vi } from "vitest";

export interface MockActor {
  addItem: ReturnType<typeof vi.fn>;
  addRecap: ReturnType<typeof vi.fn>;
  deleteItem: ReturnType<typeof vi.fn>;
  deleteRecap: ReturnType<typeof vi.fn>;
  filterRecaps: ReturnType<typeof vi.fn>;
  getRecap: ReturnType<typeof vi.fn>;
  listItems: ReturnType<typeof vi.fn>;
  listRecaps: ReturnType<typeof vi.fn>;
  recapDailyTrend: ReturnType<typeof vi.fn>;
  recapKindSummary: ReturnType<typeof vi.fn>;
  recapSummary: ReturnType<typeof vi.fn>;
  updateItem: ReturnType<typeof vi.fn>;
  updateRecap: ReturnType<typeof vi.fn>;
}

export function makeRecap(overrides: Partial<RecapView> = {}): RecapView {
  const available = overrides.available ?? 100n;
  const used = overrides.used ?? 80n;
  const difference = available - used;
  return {
    id: 0n,
    status:
      difference > 0n
        ? RecapStatus.surplus
        : difference < 0n
          ? RecapStatus.shortfall
          : RecapStatus.balanced,
    itemId: 0n,
    date: "2026-10-13",
    difference,
    kind: ItemKind.rice,
    createdAt: 0n,
    used,
    available,
    itemName: "Nasi putih",
    ...overrides,
  };
}

export function makeItem(overrides: Partial<Item> = {}): Item {
  return { id: 0n, kind: ItemKind.rice, name: "Nasi putih", ...overrides };
}

export function makeSummary(
  overrides: Partial<RecapSummary> = {},
): RecapSummary {
  return {
    totalSurplus: 20n,
    totalShortfall: 15n,
    surplusCount: 1n,
    shortfallCount: 1n,
    ...overrides,
  };
}

export function makeTrend(data: DailyTrendPoint[] = []): DailyTrendPoint[] {
  return data;
}

export function makeKindSummary(data: KindSummary[] = []): KindSummary[] {
  return data;
}

export function makeActor(overrides: Partial<MockActor> = {}): MockActor {
  return {
    addItem: vi.fn(async (input: ItemInput) => ({
      __kind__: "ok" as const,
      ok: makeItem({ name: input.name, kind: input.kind }),
    })),
    addRecap: vi.fn(async (input: RecapInput) => ({
      __kind__: "ok" as const,
      ok: makeRecap(input),
    })),
    deleteItem: vi.fn(async () => ({ __kind__: "ok" as const, ok: null })),
    deleteRecap: vi.fn(async () => ({ __kind__: "ok" as const, ok: null })),
    filterRecaps: vi.fn(async (_filter: RecapFilter, _sort: RecapSort) => []),
    getRecap: vi.fn(async () => null),
    listItems: vi.fn(async () => []),
    listRecaps: vi.fn(async () => []),
    recapDailyTrend: vi.fn(async () => []),
    recapKindSummary: vi.fn(async () => []),
    recapSummary: vi.fn(async () => makeSummary()),
    updateItem: vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: makeItem(),
    })),
    updateRecap: vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: makeRecap(),
    })),
    ...overrides,
  };
}
