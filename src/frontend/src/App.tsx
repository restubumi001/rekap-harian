import { ItemKind, RecapSort, RecapStatus } from "@/backend";
import { Layout } from "@/components/Layout";
import { Toaster } from "@/components/ui/sonner";
import { CatatPage } from "@/pages/CatatPage";
import { ItemPage } from "@/pages/ItemPage";
import { RekapPage } from "@/pages/RekapPage";
import { RingkasanPage } from "@/pages/RingkasanPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

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

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
