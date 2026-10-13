import { createActor } from "@/backend";
import type { ItemInput, RecapFilter, RecapInput, RecapSort } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const RECAP_KEYS = {
  list: (filter: RecapFilter, sort: RecapSort) =>
    ["recaps", "list", filter, sort] as const,
  summary: (filter: RecapFilter) => ["recaps", "summary", filter] as const,
  kindSummary: (filter: RecapFilter) =>
    ["recaps", "kindSummary", filter] as const,
  trend: (filter: RecapFilter) => ["recaps", "trend", filter] as const,
  detail: (id: bigint) => ["recaps", "detail", id.toString()] as const,
};

export const ITEM_KEYS = {
  list: ["items", "list"] as const,
};

export function useBackendReady() {
  const { actor, isFetching } = useActor(createActor);
  return !!actor && !isFetching;
}

function invalidateRecaps(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["recaps"] });
}

export function useRecaps(filter: RecapFilter, sort: RecapSort) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: RECAP_KEYS.list(filter, sort),
    queryFn: async () => {
      if (!actor) return [];
      return actor.filterRecaps(filter, sort);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecap(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: RECAP_KEYS.detail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getRecap(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useRecapSummary(filter: RecapFilter) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: RECAP_KEYS.summary(filter),
    queryFn: async () => {
      if (!actor) return null;
      return actor.recapSummary(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecapKindSummary(filter: RecapFilter) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: RECAP_KEYS.kindSummary(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.recapKindSummary(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecapDailyTrend(filter: RecapFilter) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: RECAP_KEYS.trend(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.recapDailyTrend(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useItems() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ITEM_KEYS.list,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddRecap() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RecapInput) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.addRecap(input);
    },
    onSuccess: () => {
      invalidateRecaps(queryClient);
    },
  });
}

export function useUpdateRecap() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: RecapInput }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.updateRecap(id, input);
    },
    onSuccess: () => {
      invalidateRecaps(queryClient);
    },
  });
}

export function useDeleteRecap() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.deleteRecap(id);
    },
    onSuccess: () => {
      invalidateRecaps(queryClient);
    },
  });
}

export function useAddItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ItemInput) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.addItem(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ITEM_KEYS.list });
    },
  });
}

export function useUpdateItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: ItemInput }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.updateItem(id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ITEM_KEYS.list });
    },
  });
}

export function useDeleteItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.deleteItem(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ITEM_KEYS.list });
    },
  });
}
