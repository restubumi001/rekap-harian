import { ItemKind, RecapSort, RecapStatus } from "@/backend";
import { CatatPage } from "@/pages/CatatPage";
import { ItemPage } from "@/pages/ItemPage";
import { RekapPage } from "@/pages/RekapPage";
import { RingkasanPage } from "@/pages/RingkasanPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

import {
  type MockActor,
  makeActor,
  makeItem,
  makeRecap,
  makeSummary,
} from "./mockActor";

const actorRef = vi.hoisted(() => {
  return { current: undefined as unknown as MockActor };
});

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: actorRef.current, isFetching: false }),
  useInternetIdentity: () => ({
    isAuthenticated: false,
    isLoggingIn: false,
    login: vi.fn(),
    clear: vi.fn(),
  }),
}));

function buildRouter(path: string) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const catatRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: CatatPage,
  });
  const rekapRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/rekap",
    component: RekapPage,
    validateSearch: (search: Record<string, unknown>) => ({
      startDate:
        typeof search.startDate === "string" ? search.startDate : undefined,
      endDate: typeof search.endDate === "string" ? search.endDate : undefined,
      kind:
        search.kind === ItemKind.rice ||
        search.kind === ItemKind.sideDish ||
        search.kind === ItemKind.other
          ? search.kind
          : undefined,
      status:
        search.status === RecapStatus.surplus ||
        search.status === RecapStatus.shortfall ||
        search.status === RecapStatus.balanced
          ? search.status
          : undefined,
      search: typeof search.search === "string" ? search.search : undefined,
      sort:
        search.sort === RecapSort.dateAsc ||
        search.sort === RecapSort.differenceDesc ||
        search.sort === RecapSort.differenceAsc
          ? search.sort
          : undefined,
    }),
  });
  const ringkasanRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/ringkasan",
    component: RingkasanPage,
  });
  const itemRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/item",
    component: ItemPage,
  });
  const routeTree = rootRoute.addChildren([
    catatRoute,
    rekapRoute,
    ringkasanRoute,
    itemRoute,
  ]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
}

function renderAt(path: string) {
  const router = buildRouter(path);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { router, ...utils };
}

beforeEach(() => {
  actorRef.current = makeActor();
});

describe("App shell", () => {
  it("renders the default route without a blank screen", async () => {
    renderAt("/");
    expect(
      await screen.findByRole("heading", { name: "Catat rekap harian" }),
    ).toBeInTheDocument();
  });
});

describe("CatatPage", () => {
  it("shows the empty state when no items exist", async () => {
    renderAt("/");
    expect(await screen.findByText("Belum ada jenis item")).toBeInTheDocument();
  });

  it("computes surplus 20 from available 100 and used 80", async () => {
    actorRef.current = makeActor({
      listItems: vi.fn(async () => [makeItem()]),
    });
    renderAt("/");

    const available = await screen.findByLabelText("Porsi tersedia");
    const used = screen.getByLabelText("Porsi terpakai");
    await userEvent.type(available, "100");
    await userEvent.type(used, "80");

    expect(screen.getByText("Kelebihan 20 porsi")).toBeInTheDocument();
  });

  it("computes shortfall 15 from available 50 and used 65", async () => {
    actorRef.current = makeActor({
      listItems: vi.fn(async () => [makeItem()]),
    });
    renderAt("/");

    const available = await screen.findByLabelText("Porsi tersedia");
    const used = screen.getByLabelText("Porsi terpakai");
    await userEvent.type(available, "50");
    await userEvent.type(used, "65");

    expect(screen.getByText("Kekurangan 15 porsi")).toBeInTheDocument();
  });

  it("validates that date and positive amounts are required", async () => {
    actorRef.current = makeActor({
      listItems: vi.fn(async () => [makeItem()]),
    });
    renderAt("/");

    await screen.findByLabelText("Porsi tersedia");
    await userEvent.click(screen.getByRole("button", { name: "Simpan rekap" }));

    expect(await screen.findByText("Tanggal wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("Pilih jenis item.")).toBeInTheDocument();
    expect(
      screen.getByText("Jumlah tersedia harus angka positif."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Jumlah terpakai harus angka positif."),
    ).toBeInTheDocument();
    expect(actorRef.current.addRecap).not.toHaveBeenCalled();
  });

  it("saves a recap and shows a confirmation", async () => {
    actorRef.current = makeActor({
      listItems: vi.fn(async () => [makeItem()]),
    });
    renderAt("/");

    const date = await screen.findByLabelText("Tanggal");
    await userEvent.type(date, "2026-10-13");
    await userEvent.click(screen.getByLabelText("Jenis item"));
    await userEvent.click(
      await screen.findByRole("option", { name: /Nasi putih/ }),
    );
    await userEvent.type(screen.getByLabelText("Porsi tersedia"), "100");
    await userEvent.type(screen.getByLabelText("Porsi terpakai"), "80");
    await userEvent.click(screen.getByRole("button", { name: "Simpan rekap" }));

    await waitFor(() =>
      expect(actorRef.current.addRecap).toHaveBeenCalledTimes(1),
    );
    expect(actorRef.current.addRecap).toHaveBeenCalledWith({
      date: "2026-10-13",
      itemId: 0n,
      available: 100n,
      used: 80n,
    });
    expect(await screen.findByText(/1 rekap tersimpan/)).toBeInTheDocument();
  });
});

describe("ItemPage", () => {
  it("adds an item through the real form", async () => {
    renderAt("/item");
    await userEvent.type(
      await screen.findByLabelText("Nama item"),
      "Nasi putih",
    );
    await userEvent.click(screen.getByRole("button", { name: "Tambah item" }));

    await waitFor(() =>
      expect(actorRef.current.addItem).toHaveBeenCalledWith({
        name: "Nasi putih",
        kind: ItemKind.rice,
      }),
    );
  });

  it("renames an item through the inline edit form", async () => {
    actorRef.current = makeActor({
      listItems: vi.fn(async () => [makeItem()]),
    });
    renderAt("/item");

    await userEvent.click(await screen.findByRole("button", { name: "Ubah" }));
    // The add form and the inline edit form both label their input "Nama item",
    // so select the edit input by its current value instead.
    const editName = await screen.findByDisplayValue("Nasi putih");
    await userEvent.clear(editName);
    await userEvent.type(editName, "Nasi merah");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() =>
      expect(actorRef.current.updateItem).toHaveBeenCalledWith(0n, {
        name: "Nasi merah",
        kind: ItemKind.rice,
      }),
    );
  });

  it("asks for confirmation before deleting an item", async () => {
    actorRef.current = makeActor({
      listItems: vi.fn(async () => [makeItem()]),
    });
    renderAt("/item");

    await userEvent.click(await screen.findByRole("button", { name: "Hapus" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(
      within(dialog).getByText("Hapus jenis item ini?"),
    ).toBeInTheDocument();
    expect(actorRef.current.deleteItem).not.toHaveBeenCalled();

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Hapus item" }),
    );
    await waitFor(() =>
      expect(actorRef.current.deleteItem).toHaveBeenCalledWith(0n),
    );
  });
});

describe("RekapPage", () => {
  it("renders stored recaps with their difference and status", async () => {
    actorRef.current = makeActor({
      filterRecaps: vi.fn(async () => [
        makeRecap({ id: 1n, available: 100n, used: 80n }),
        makeRecap({
          id: 2n,
          available: 50n,
          used: 65n,
          itemName: "Lauk ayam",
          kind: ItemKind.sideDish,
        }),
      ]),
    });
    renderAt("/rekap");

    expect(await screen.findByText("Nasi putih")).toBeInTheDocument();
    expect(screen.getByText("Lauk ayam")).toBeInTheDocument();
    expect(screen.getByText("+20")).toBeInTheDocument();
    expect(screen.getByText("-15")).toBeInTheDocument();
    expect(screen.getByText("Kelebihan")).toBeInTheDocument();
    expect(screen.getByText("Kekurangan")).toBeInTheDocument();
  });

  it("reflects the search filter in the URL and the query", async () => {
    const { router } = renderAt("/rekap");
    await screen.findByText("Belum ada rekap tercatat");

    await userEvent.type(screen.getByLabelText("Cari nama item"), "Nasi");

    await waitFor(() => {
      const calls = actorRef.current.filterRecaps.mock.calls;
      const last = calls[calls.length - 1];
      expect(last?.[0]).toMatchObject({ search: "Nasi" });
    });
    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({ search: "Nasi" }),
    );
  });

  it("restores filter, search, and sort state from the URL", async () => {
    renderAt("/rekap?search=Nasi&kind=rice&status=surplus&sort=differenceDesc");

    await waitFor(() => {
      const calls = actorRef.current.filterRecaps.mock.calls;
      const last = calls[calls.length - 1];
      expect(last?.[0]).toMatchObject({
        search: "Nasi",
        kind: ItemKind.rice,
        status: RecapStatus.surplus,
      });
      expect(last?.[1]).toBe(RecapSort.differenceDesc);
    });
    expect(screen.getByLabelText("Cari nama item")).toHaveValue("Nasi");
  });

  it("edits a stored recap through the real form", async () => {
    actorRef.current = makeActor({
      filterRecaps: vi.fn(async () => [makeRecap({ id: 7n })]),
      listItems: vi.fn(async () => [makeItem()]),
    });
    renderAt("/rekap");

    await userEvent.click(
      await screen.findByRole("button", { name: "Ubah rekap Nasi putih" }),
    );
    const available = await screen.findByLabelText("Porsi tersedia");
    await userEvent.clear(available);
    await userEvent.type(available, "120");
    await userEvent.click(
      screen.getByRole("button", { name: "Simpan perubahan" }),
    );

    await waitFor(() =>
      expect(actorRef.current.updateRecap).toHaveBeenCalledWith(7n, {
        date: "2026-10-13",
        itemId: 0n,
        available: 120n,
        used: 80n,
      }),
    );
  });

  it("asks for confirmation before deleting a recap", async () => {
    actorRef.current = makeActor({
      filterRecaps: vi.fn(async () => [makeRecap({ id: 7n })]),
    });
    renderAt("/rekap");

    await userEvent.click(
      await screen.findByRole("button", { name: "Hapus rekap Nasi putih" }),
    );
    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText("Hapus rekap ini?")).toBeInTheDocument();
    expect(actorRef.current.deleteRecap).not.toHaveBeenCalled();

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Hapus rekap" }),
    );
    await waitFor(() =>
      expect(actorRef.current.deleteRecap).toHaveBeenCalledWith(7n),
    );
  });
});

describe("RingkasanPage", () => {
  it("shows total surplus and shortfall for the period", async () => {
    actorRef.current = makeActor({
      recapSummary: vi.fn(async () =>
        makeSummary({ totalSurplus: 20n, totalShortfall: 15n }),
      ),
    });
    renderAt("/ringkasan");

    expect(await screen.findByText("20 porsi")).toBeInTheDocument();
    expect(screen.getByText("15 porsi")).toBeInTheDocument();
    expect(screen.getByText("1 catatan kelebihan")).toBeInTheDocument();
    expect(screen.getByText("1 catatan kekurangan")).toBeInTheDocument();
  });

  it("shows the empty state when there is no data", async () => {
    actorRef.current = makeActor({
      recapSummary: vi.fn(async () =>
        makeSummary({
          totalSurplus: 0n,
          totalShortfall: 0n,
          surplusCount: 0n,
          shortfallCount: 0n,
        }),
      ),
    });
    renderAt("/ringkasan");

    expect(
      await screen.findByText("Belum ada data pada periode ini"),
    ).toBeInTheDocument();
  });

  it("renders the daily trend chart and per-kind accumulation", async () => {
    actorRef.current = makeActor({
      recapSummary: vi.fn(async () => makeSummary()),
      recapDailyTrend: vi.fn(async () => [
        { date: "2026-10-13", surplus: 20n, shortfall: 15n },
      ]),
      recapKindSummary: vi.fn(async () => [
        { kind: ItemKind.rice, surplus: 20n, shortfall: 0n },
        { kind: ItemKind.sideDish, surplus: 0n, shortfall: 15n },
      ]),
    });
    renderAt("/ringkasan");

    expect(await screen.findByText("Tren harian")).toBeInTheDocument();
    expect(screen.getByText("Rincian per jenis item")).toBeInTheDocument();
    expect(screen.getByText("Nasi")).toBeInTheDocument();
    expect(screen.getByText("Lauk")).toBeInTheDocument();
  });
});
