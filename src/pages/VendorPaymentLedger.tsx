import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Trash2, Download } from "lucide-react";
import type { Payment } from "@/types/paymentType";
import {
  createPaymentv2,
  //getPaymentsByVendor,,
  getPaymentbyIdv2,
  deletePayment,
} from "@/api/vendor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

/* ================= Utils ================= */

const formatMoney = (n: number) =>
  `₹ ${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const formatDate = (iso: string) => {
  const [year, month, day] = iso.split("T")[0].split("-");
  return `${day}-${month}-${year}`;
};
const formatTime = (iso: string) => iso.split("T")[1].slice(0, 5);
const formatDateTime = (iso: string) => `${formatDate(iso)} ${formatTime(iso)}`;

/* ================= Types ================= */

type PayItem = {
  description: string;
  amount: number;
};

interface Props {
  vendor: {
    _id: string;
    name: string;
  };
  onBack: () => void;
}

/* ================= Component ================= */

export default function VendorPaymentLedger({ vendor, onBack }: Props) {
  const [paymentMode, setPaymentMode] = useState<
    "Bank Transfer" | "Cheque" | "UPI" | "Cash" | "Demand Draft" | "Others"
  >("Cash");

  const [bankName, setBankName] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");

  const [payments, setPayments] = useState<Payment[]>([]);
  const [openPayment, setOpenPayment] = useState(false);
  type CompanyName = "Airde Real Estate" | "Airde Developer" | "Unique Realcon";

  const [companyName, setCompanyName] = useState<CompanyName | undefined>();

  const [payItems, setPayItems] = useState<PayItem[]>([
    { description: "", amount: 0 },
  ]);
  const [gstPercent, setGstPercent] = useState(0);

  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const role = localStorage.getItem("role");
  const [paymentSearch, setPaymentSearch] = useState("");

  const filteredPayments = payments.filter((p) => {
    const q = paymentSearch.toLowerCase();

    return (
      p.paymentSummary?.mode?.toLowerCase().includes(q) ||
      String(p.total).includes(q) ||
      p.createdAt.toLowerCase().includes(q) ||
      p.company?.name?.toLowerCase().includes(q)
    );
  });

  /* ================= Load Payments ================= */

  useEffect(() => {
    loadPayments();
  }, [vendor._id]);

  const loadPayments = async () => {
    try {
      const res = await getPaymentbyIdv2(vendor._id);
      setPayments(res.payments);
    } catch (err) {
      console.error("Load payments failed", err);
    }
  };

  /* ================= Totals ================= */

  const totalPaid = payments.reduce((s, p) => s + p.total, 0);
  const totalPayments = payments.length;

  const validItems = payItems.filter(
    (i) => i.description.trim() && i.amount > 0
  );

  const itemsTotal = validItems.reduce((s, i) => s + i.amount, 0);

  const gstAmount = (itemsTotal * gstPercent) / 100;
  const grandTotal = itemsTotal + gstAmount;

  /* ================= Payment ================= */

  const addPayment = async () => {
    if (validItems.length === 0) return;

    if (paymentMode === "Cheque") {
      if (!bankName || !chequeNumber) {
        alert("Bank Name and Cheque Number are required");
        return;
      }
    }

    try {
      await createPaymentv2({
        vendorId: vendor._id,
        items: validItems,
        companyName,
        itemsTotal,
        gst: {
          percentage: gstPercent,
          amount: gstAmount,
        },
        total: grandTotal,

        paymentSummary: {
          mode: paymentMode,
          bankName: paymentMode === "Cheque" ? bankName : null,
          chequeNumber: paymentMode === "Cheque" ? chequeNumber : null,
        },
      });

      await loadPayments();

      setPayItems([{ description: "", amount: 0 }]);
      setPaymentMode("Cash");
      setBankName("");
      setChequeNumber("");
      setOpenPayment(false);
    } catch (err) {
      console.error("Payment failed", err);
    }
  };

  const updatePayItem = (
    index: number,
    field: keyof PayItem,
    value: string | number
  ) => {
    setPayItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === "amount" ? Number(value) : String(value),
            }
          : item
      )
    );
  };

  const addPayItem = () => {
    setPayItems([...payItems, { description: "", amount: 0 }]);
  };

  const removePayItem = (i: number) => {
    setPayItems(payItems.filter((_, idx) => idx !== i));
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await deletePayment(paymentId);
      await loadPayments();
    } catch (err) {
      console.error("Delete payment failed", err);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-muted/30 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <ArrowLeft className="w-4 h-4 cursor-pointer" onClick={onBack} />
          <span className="font-semibold">{vendor.name}</span>
        </div>

        <Button size="sm" onClick={() => setOpenPayment(true)}>
          <CreditCard className="w-4 h-4 mr-1" />
          Pay
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Summary title="Total Paid" value={formatMoney(totalPaid)} green />
        <Summary title="Payments" value={String(totalPayments)} />
      </div>

      {/* Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <div className="mx-4 mb-4">
          {" "}
          {/* mx-4 adds horizontal margin, mb-4 adds bottom margin */}
          <Input
            placeholder="Search payments by mode, amount, date or company..."
            value={paymentSearch}
            onChange={(e) => setPaymentSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <CardContent>
          <ScrollArea className="h-[400px]">
            {filteredPayments.length === 0 && (
              <div className="text-center text-sm text-muted-foreground">
                No payments yet
              </div>
            )}

            <div className="space-y-3">
              {filteredPayments.map((p) => (
                <div
                  key={p._id}
                  className="flex justify-between items-center border rounded-lg p-4 bg-white"
                >
                  {/* Left info */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">ID: {p._id}</p>
                    <p className="text-sm font-medium">
                      {p.company?.name || "—"}
                    </p>
                    <p className="text-sm font-medium">
                      {formatDateTime(p.createdAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.paymentSummary?.mode}
                    </p>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{formatMoney(p.total)}</Badge>

                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => window.open(`/payment/${p._id}`, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    {role === "admin" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => setDeletePaymentId(p._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Delete Payment */}
      <AlertDialog
        open={!!deletePaymentId}
        onOpenChange={() => setDeletePaymentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment?</AlertDialogTitle>
            <AlertDialogDescription>
              This payment will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deletePaymentId) handleDeletePayment(deletePaymentId);
                setDeletePaymentId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Modal */}
      {openPayment && (
        <Dialog open={openPayment} onOpenChange={setOpenPayment}>
          <DialogContent className="max-w-xl">
            {/* ================= HEADER ================= */}
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Create Payment
              </DialogTitle>
            </DialogHeader>

            {/* ================= ITEMS ================= */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Payment Items
              </p>

              {payItems.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_140px_40px] gap-2 items-center"
                >
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      updatePayItem(i, "description", e.target.value)
                    }
                    placeholder="Description"
                  />

                  <Input
                    type="number"
                    value={item.amount}
                    onChange={(e) => updatePayItem(i, "amount", e.target.value)}
                    placeholder="Amount"
                  />

                  {payItems.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => removePayItem(i)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}

              <Button variant="outline" size="sm" onClick={addPayItem}>
                + Add another item
              </Button>
            </div>

            {/* ================= PAYMENT MODE ================= */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Payment Method
              </p>

              <select
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Demand Draft">Demand Draft</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* ================= CHEQUE DETAILS ================= */}
            {paymentMode === "Cheque" && (
              <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-lg border">
                <Input
                  placeholder="Bank Name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
                <Input
                  placeholder="Cheque Number"
                  value={chequeNumber}
                  onChange={(e) => setChequeNumber(e.target.value)}
                />
              </div>
            )}

            {/* ================= GST ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* GST */}
              <div className="space-y-2">
                <Label>GST %</Label>
                <Input
                  type="number"
                  placeholder="Enter GST %"
                  value={gstPercent}
                  onChange={(e) => setGstPercent(Number(e.target.value))}
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label>Company</Label>
                <Select
                  value={companyName}
                  onValueChange={(v) => setCompanyName(v as CompanyName)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Airde Real Estate">
                      Airde Real Estate
                    </SelectItem>
                    <SelectItem value="Airde Developer">
                      Airde Developer
                    </SelectItem>
                    <SelectItem value="Unique Realcon">
                      Unique Realcon
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ================= TOTALS ================= */}
            <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span>{formatMoney(itemsTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST</span>
                <span>{formatMoney(gstAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-1 border-t mt-1">
                <span>Grand Total</span>
                <span>{formatMoney(grandTotal)}</span>
              </div>
            </div>

            {/* ================= ACTION ================= */}
            <DialogFooter>
              <Button className="w-full" onClick={addPayment}>
                Create Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* ================= Summary ================= */

function Summary({ title, value, green }: any) {
  return (
    <div className="bg-white p-4 border rounded-xl">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className={`text-lg font-bold ${green ? "text-green-600" : ""}`}>
        {value}
      </div>
    </div>
  );
}
