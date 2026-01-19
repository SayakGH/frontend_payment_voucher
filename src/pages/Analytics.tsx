import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getFinancialData, getSummary } from "@/api/analytics";
import type { IChart } from "@/types/analyticsTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ================= TYPES ================= */

type Stats = {
  totalPaymentCount: number;
  totalPayments: number;
  totalBilled: number;
};

/* ================= Helpers ================= */

const formatYAxis = (value: number) => {
  if (value >= 1_00_00_000) return `${(value / 1_00_00_000).toFixed(1)} Cr`;
  if (value >= 1_00_000) return `${(value / 1_00_000).toFixed(1)} L`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)} K`;
  return value.toString();
};

export default function Analytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartRaw, setChartRaw] = useState<IChart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [financial, summary] = await Promise.all([
        getFinancialData(),
        getSummary(),
      ]);

      setStats(financial.stats);
      setChartRaw(summary?.analytics?.last30DaysPayments || []);
    } catch (err) {
      console.error("Analytics load failed", err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    return (chartRaw || []).map((d) => ({
      date: `${String(d.day).padStart(2, "0")} ${d.month}`,
      amount: Number(d.price) || 0,
    }));
  }, [chartRaw]);

  const maxAmount = useMemo(() => {
    return chartData.length > 0
      ? Math.max(...chartData.map((d) => d.amount))
      : 0;
  }, [chartData]);

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading analytics…</div>;
  }

  if (!stats) {
    return <div className="p-6 text-destructive">Failed to load analytics</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {/* ================= METRICS ================= */}

      {/* DESKTOP VIEW (grid) */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Metric title="Total Paid" value={stats.totalPayments} color="green" />
        <Metric title="Total Billed" value={stats.totalBilled} />
        <Metric
          title="Total Payments"
          value={stats.totalPaymentCount}
          isCount
        />
      </div>

      {/* MOBILE VIEW (TABS) */}
      <div className="sm:hidden">
        <Tabs defaultValue="paid">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="billed">Billed</TabsTrigger>
            <TabsTrigger value="count">Count</TabsTrigger>
          </TabsList>

          <TabsContent value="paid" className="mt-4">
            <Metric
              title="Total Paid"
              value={stats.totalPayments}
              color="green"
            />
          </TabsContent>

          <TabsContent value="billed" className="mt-4">
            <Metric title="Total Billed" value={stats.totalBilled} />
          </TabsContent>

          <TabsContent value="count" className="mt-4">
            <Metric
              title="Total Payments"
              value={stats.totalPaymentCount}
              isCount
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* ================= CHART ================= */}

      <Card>
        <CardHeader>
          <CardTitle>Payments Received (Last 30 Days)</CardTitle>
        </CardHeader>

        <CardContent className="h-[320px] sm:h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                tickFormatter={formatYAxis}
                domain={[0, Math.ceil(maxAmount * 1.1)]}
              />
              <Tooltip
                formatter={(v) => [
                  `₹ ${Number(v || 0).toLocaleString("en-IN")}`,
                  "Amount",
                ]}
              />
              <Line
                type="monotone"
                dataKey="amount"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

/* ================= Metric ================= */

function Metric({
  title,
  value,
  color,
  isCount,
}: {
  title: string;
  value: number;
  color?: "red" | "green";
  isCount?: boolean;
}) {
  const safe = Number(value) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent
        className={`text-2xl font-bold ${
          color === "red"
            ? "text-destructive"
            : color === "green"
              ? "text-green-600"
              : ""
        }`}
      >
        {isCount ? safe : `₹ ${safe.toLocaleString("en-IN")}`}
      </CardContent>
    </Card>
  );
}
