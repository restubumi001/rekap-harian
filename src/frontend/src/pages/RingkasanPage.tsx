import { ItemKind } from "@/backend";
import type { RecapFilter } from "@/backend";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { TrendChart } from "@/components/TrendChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBackendReady,
  useRecapDailyTrend,
  useRecapKindSummary,
  useRecapSummary,
} from "@/hooks/useQueries";
import { kindLabel } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Scale, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

export function RingkasanPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filter = useMemo<RecapFilter>(() => {
    const next: RecapFilter = {};
    if (startDate) next.startDate = startDate;
    if (endDate) next.endDate = endDate;
    return next;
  }, [startDate, endDate]);

  const summaryQuery = useRecapSummary(filter);
  const kindQuery = useRecapKindSummary(filter);
  const trendQuery = useRecapDailyTrend(filter);
  const backendReady = useBackendReady();

  const summary = summaryQuery.data;
  const kindSummary = kindQuery.data ?? [];
  const trend = trendQuery.data ?? [];

  const hasData =
    summary !== null &&
    summary !== undefined &&
    (summary.totalSurplus > 0n ||
      summary.totalShortfall > 0n ||
      summary.surplusCount > 0n ||
      summary.shortfallCount > 0n);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:py-14">
      <PageHeader
        eyebrow="Statistik"
        title="Ringkasan & statistik"
        description="Total kelebihan dan kekurangan porsi pada periode terpilih, lengkap dengan tren harian dan rincian per jenis item."
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
              data-ocid="ringkasan.view_recap_link"
            >
              Lihat rekap
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-subtle md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="summary-start">Dari tanggal</Label>
          <Input
            id="summary-start"
            type="date"
            data-ocid="ringkasan.start_input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="summary-end">Sampai tanggal</Label>
          <Input
            id="summary-end"
            type="date"
            data-ocid="ringkasan.end_input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {summaryQuery.isLoading || !backendReady ? (
        <div
          data-ocid="ringkasan.loading_state"
          className="grid gap-4 md:grid-cols-3"
        >
          {Array.from({ length: 3 }, (_, i) => `stat-${i}`).map((id) => (
            <Skeleton key={id} className="h-32 w-full" />
          ))}
        </div>
      ) : !hasData ? (
        <EmptyState
          icon={Scale}
          ocid="ringkasan.empty_state"
          title="Belum ada data pada periode ini"
          description="Catat rekap harian terlebih dahulu, atau perlebar rentang tanggal untuk melihat ringkasan."
          action={
            <Button asChild className="rounded-lg">
              <Link to="/" data-ocid="ringkasan.empty_action_link">
                Catat rekap
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              ocid="ringkasan.surplus_card"
              label="Total kelebihan"
              value={`${summary?.totalSurplus ?? 0n} porsi`}
              hint={`${summary?.surplusCount ?? 0n} catatan kelebihan`}
              icon={ArrowUpRight}
              tone="surplus"
            />
            <StatCard
              ocid="ringkasan.shortfall_card"
              label="Total kekurangan"
              value={`${summary?.totalShortfall ?? 0n} porsi`}
              hint={`${summary?.shortfallCount ?? 0n} catatan kekurangan`}
              icon={ArrowDownRight}
              tone="shortfall"
            />
            <StatCard
              ocid="ringkasan.balance_card"
              label="Selisih bersih"
              value={`${(summary?.totalSurplus ?? 0n) - (summary?.totalShortfall ?? 0n)} porsi`}
              hint="Kelebihan dikurangi kekurangan"
              icon={Scale}
            />
          </div>

          <section className="flex flex-col gap-4">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Tren harian
            </h2>
            {trendQuery.isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : trend.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                ocid="ringkasan.trend_empty_state"
                title="Belum ada tren"
                description="Tren muncul setelah ada rekap pada periode ini."
              />
            ) : (
              <TrendChart data={trend} />
            )}
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Rincian per jenis item
            </h2>
            {kindQuery.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : kindSummary.length === 0 ? (
              <EmptyState
                icon={Scale}
                ocid="ringkasan.kind_empty_state"
                title="Belum ada rincian"
                description="Rincian per jenis item muncul setelah ada rekap pada periode ini."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {kindSummary.map((entry) => (
                  <Card
                    key={entry.kind}
                    data-ocid={`ringkasan.kind_card.${entry.kind}`}
                    className="rounded-xl border-border shadow-subtle"
                  >
                    <CardHeader>
                      <CardTitle className="font-display text-lg">
                        {kindLabel(entry.kind)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Kelebihan
                        </span>
                        <span className="font-mono-num font-semibold text-surplus">
                          {entry.surplus} porsi
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Kekurangan
                        </span>
                        <span className="font-mono-num font-semibold text-shortfall">
                          {entry.shortfall} porsi
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Selisih
                        </span>
                        <span className="font-mono-num font-semibold">
                          {entry.surplus - entry.shortfall} porsi
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Jenis item mencakup {kindLabel(ItemKind.rice)},{" "}
        {kindLabel(ItemKind.sideDish)}, dan {kindLabel(ItemKind.other)}.
      </p>
    </div>
  );
}
