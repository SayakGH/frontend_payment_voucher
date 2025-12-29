import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Analytics() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Payable</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-red-600">
            ₹ 12,45,000
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Paid</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-green-600">
            ₹ 8,20,000
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GST Payable</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            ₹ 1,48,500
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Vendors</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">18</CardContent>
        </Card>
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Vendors by Outstanding</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            This will show vendors with highest pending payments.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Payment Trend</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Line chart will be added here later.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
