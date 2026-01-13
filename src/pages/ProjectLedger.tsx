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
import { ArrowLeft, Plus, CreditCard, Trash2, Download } from "lucide-react";
import type { Project } from "@/types/projectType";
import type { Bill } from "@/types/billType";
import type { Payment } from "@/types/paymentType";
import { createBill, getBills, deleteBill, deletePayment } from "@/api/vendor";
import { createPayment, getPayments } from "@/api/vendor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Receipt } from "lucide-react";
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

/* ================= Utils ================= */

const formatMoney = (n: number) =>
  `₹ ${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const formatMoneyy = (n: Number) =>
  `₹ ${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

/* ================= Types ================= */

type PayItem = {
  description: string;
  amount: number;
};

/* ================= Props ================= */

interface Props {
  vendor: { name: string };
  project: Project;
  onBack: () => void;
}

/* ================= Component ================= */

export default function ProjectLedger({ vendor, project, onBack }: Props) {
  const [paymentMode, setPaymentMode] = useState<
    "Bank Transfer" | "Cheque" | "UPI" | "Cash" | "Demand Draft" | "Others"
  >("Cash");

  const [bankName, setBankName] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");

  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [openBill, setOpenBill] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);

  const [billDesc, setBillDesc] = useState("");
  const [billAmount, setBillAmount] = useState("");

  const [payItems, setPayItems] = useState<PayItem[]>([
    { description: "", amount: 0 },
  ]);
  const [gstPercent, setGstPercent] = useState(0);
  const [deleteBillId, setDeleteBillId] = useState<string | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const role = localStorage.getItem("role");
  const [paymentSearch, setPaymentSearch] = useState("");

  /* ================= Load Ledger ================= */

  useEffect(() => {
    loadLedger();
  }, [project._id]);

  const loadLedger = async () => {
    try {
      const [billRes, paymentRes] = await Promise.all([
        getBills(project._id),
        getPayments(project._id),
      ]);

      setBills(billRes.bills);
      setPayments(paymentRes.payments);
    } catch (err) {
      console.error("Ledger load failed", err);
    }
  };

  const filteredPayments = payments.filter(
    (p) =>
      p._id.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      (p.company?.name || "—")
        .toLowerCase()
        .includes(paymentSearch.toLowerCase()) ||
      formatMoney(p.total).includes(paymentSearch) ||
      formatDateTime(p.createdAt).includes(paymentSearch) ||
      (p.paymentSummary?.mode || "")
        .toLowerCase()
        .includes(paymentSearch.toLowerCase())
  );

  /* ================= Totals ================= */

  const billed = bills.reduce((s, b) => s + b.amount, 0);
  const paid = payments.reduce((s, p) => s + p.total, 0);
  const balance = billed - paid;
  const estimated = project.estimated;

  const validItems = payItems.filter(
    (i) => i.description.trim() && i.amount > 0
  );

  const itemsTotal = validItems.reduce((s, i) => s + i.amount, 0);

  const gstAmount = (itemsTotal * gstPercent) / 100;
  const grandTotal = itemsTotal + gstAmount;

  /* ================= Bill ================= */

  const addBill = async () => {
    if (!billDesc || !billAmount) return;

    try {
      await createBill({
        projectId: project._id,
        description: billDesc,
        amount: Number(billAmount),
      });

      await loadLedger();
      setBillDesc("");
      setBillAmount("");
      setOpenBill(false);
    } catch (err) {
      console.error("Create bill failed", err);
    }
  };

  /* ================= Payment ================= */

  const addPayment = async () => {
    if (validItems.length === 0) return;
    if (!paymentMode) return;

    if (paymentMode === "Cheque") {
      if (!bankName || !chequeNumber) {
        alert("Bank Name and Cheque Number are required for Cheque payments");
        return;
      }
    }

    try {
      await createPayment({
        projectId: project._id,
        items: validItems,
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

      await loadLedger();

      // reset
      setPayItems([{ description: "", amount: 0 }]);
      setGstPercent(0);
      setPaymentMode("Cash");
      setBankName("");
      setChequeNumber("");
      setOpenPayment(false);
    } catch (err) {
      console.error("Payment failed", err);
    }
  };

  const formatDate = (iso: string) => {
    const [year, month, day] = iso.split("T")[0].split("-");
    return `${day}-${month}-${year}`;
  };
  const formatTime = (iso: string) => iso.split("T")[1].slice(0, 5);

  const formatDateTime = (iso: string) =>
    `${formatDate(iso)} ${formatTime(iso)}`;

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

  const handleDeleteBill = async (billId: string) => {
    try {
      await deleteBill(billId);
      await loadLedger();
    } catch (err) {
      console.error("Delete bill failed", err);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await deletePayment(paymentId);
      await loadLedger();
    } catch (err) {
      console.error("Delete payment failed", err);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-muted/30 p-6 space-y-6">
      {/* Desktop Header */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left side — breadcrumb */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <ArrowLeft
            className="w-4 h-4 cursor-pointer hover:text-black"
            onClick={onBack}
          />
          <span>{vendor.name}</span>
          <span className="opacity-50">/</span>
          <span className="font-semibold text-black">
            {project.projectName}
          </span>
        </div>

        {/* Right side — balance + actions */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">PROJECT BALANCE</div>
            <div
              className={`text-xl font-bold ${
                balance > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {formatMoney(balance)}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenBill(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Bill
            </Button>

            <Button size="sm" onClick={() => setOpenPayment(true)}>
              <CreditCard className="w-4 h-4 mr-1" />
              Pay
            </Button>
          </div>
        </div>
      </div>
      {/* Mobile Header */}
      <div className="flex sm:hidden flex-col gap-4">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" onClick={onBack} />
            <span className="font-medium truncate max-w-[180px]">
              {project.projectName}
            </span>
          </div>

          <div
            className={`text-sm font-bold ${
              balance > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {formatMoney(balance)}
          </div>
        </div>

        {/* Vendor */}
        <div className="text-xs text-muted-foreground">{vendor.name}</div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" onClick={() => setOpenBill(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Bill
          </Button>

          <Button size="sm" onClick={() => setOpenPayment(true)}>
            <CreditCard className="w-4 h-4 mr-1" />
            Pay
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
        <Summary title="Billed" value={formatMoney(billed)} />
        <Summary title="Paid" value={formatMoney(paid)} green />
        <Summary title="Balance" value={formatMoney(balance)} danger />
        <Summary title="Expected Price" value={formatMoneyy(estimated)} />
      </div>

      <Tabs defaultValue="bills" className="w-full">
        <TabsList className="grid grid-cols-2 w-full mb-4">
          <TabsTrigger value="bills" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Bills
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
        </TabsList>

        {/* ================= BILLS ================= */}
        <TabsContent value="bills">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Bills Raised
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-0">
              <ScrollArea className="h-[320px] pr-2">
                {bills.length === 0 && (
                  <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
                    No bills created yet
                  </div>
                )}

                <div className="hidden sm:block space-y-3">
                  {bills.map((b) => (
                    <div
                      key={b._id}
                      className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 transition hover:bg-muted/40"
                    >
                      {/* Left */}
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{b.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(b.createdAt)}
                        </p>
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-sm">
                          {formatMoney(b.amount)}
                        </Badge>

                        {role === "Admin" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteBillId(b._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="sm:hidden space-y-3">
                  {bills.map((b) => (
                    <Card key={b._id} className="border shadow-sm">
                      <CardContent className="p-4 space-y-3">
                        {/* Description */}
                        <div className="text-sm font-medium leading-snug line-clamp-2">
                          {b.description}
                        </div>

                        {/* Date */}
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(b.createdAt)}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <Badge variant="secondary" className="text-sm">
                            {formatMoney(b.amount)}
                          </Badge>

                          {role === "Admin" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteBillId(b._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <AlertDialog
          open={!!deleteBillId}
          onOpenChange={() => setDeleteBillId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Bill?</AlertDialogTitle>
              <AlertDialogDescription>
                This bill will be permanently removed. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  if (deleteBillId) handleDeleteBill(deleteBillId);
                  setDeleteBillId(null);
                }}
              >
                Delete Bill
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ================= PAYMENTS ================= */}
        <TabsContent value="payments">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Payments Made
              </CardTitle>
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

            <CardContent className="pt-0">
              <ScrollArea className="h-[320px] pr-2">
                {filteredPayments.length === 0 && (
                  <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
                    No payments recorded yet
                  </div>
                )}

                <div className="hidden sm:block space-y-3">
                  {filteredPayments.map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 transition hover:bg-muted/40"
                    >
                      {/* Left */}
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">
                          {formatDateTime(p.createdAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Payment sent
                        </p>
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-sm">
                          {formatMoney(p.total)}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 flex items-center gap-2"
                          onClick={() => {
                            window.open(
                              `/payment/${p._id}`,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        {role === "Admin" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => setDeletePaymentId(p._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="sm:hidden space-y-3">
                  {payments.map((p) => (
                    <Card key={p._id} className="border shadow-sm">
                      <CardContent className="p-4 space-y-3">
                        {/* Date */}
                        <div className="text-sm font-medium">
                          {formatDateTime(p.createdAt)}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Payment sent
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <Badge variant="secondary" className="text-sm">
                            {formatMoney(p.total)}
                          </Badge>

                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() =>
                                window.open(
                                  `/payment/${p._id}`,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {role === "Admin" && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => setDeletePaymentId(p._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <AlertDialog
        open={!!deletePaymentId}
        onOpenChange={() => setDeletePaymentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment?</AlertDialogTitle>
            <AlertDialogDescription>
              This payment record will be removed permanently. This may affect
              balances and reports.
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
              Delete Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bill Modal */}
      <Dialog open={openBill} onOpenChange={setOpenBill}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bill</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Description"
            value={billDesc}
            onChange={(e) => setBillDesc(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Amount"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={addBill}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Tax</p>
              <Input
                type="number"
                placeholder="GST %"
                value={gstPercent}
                onChange={(e) => setGstPercent(Number(e.target.value))}
              />
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

function Summary({ title, value, green, danger }: any) {
  return (
    <div className="bg-white p-4 border rounded-xl">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div
        className={`text-lg font-bold ${
          green ? "text-green-600" : danger ? "text-red-600" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
