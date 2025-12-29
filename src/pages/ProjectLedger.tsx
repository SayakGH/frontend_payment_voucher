import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, CreditCard } from "lucide-react";

/* ================================
   Types
================================ */

interface Bill {
  id: string;
  description: string;
  amount: number;
  date: string;
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  mode: string;
}

interface Props {
  vendor: { name: string };
  project: {
    name: string;
    billed: number;
    paid: number;
    contractValue?: number;
  };
  onBack: () => void;
}

/* ================================
   Utils
================================ */

const formatMoney = (n: number) =>
  `₹ ${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

/* ================================
   Component
================================ */

export default function ProjectLedger({ vendor, project, onBack }: Props) {
  const [tab, setTab] = useState<"bills" | "payments">("bills");

  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [openBill, setOpenBill] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);

  const [billDesc, setBillDesc] = useState("");
  const [billAmount, setBillAmount] = useState("");

  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("Cash");

  const billed = bills.reduce((s, b) => s + b.amount, project.billed);
  const paid = payments.reduce((s, p) => s + p.amount, project.paid);
  const balance = billed - paid;
  const contractValue = project.contractValue || 5000000;

  /* ================= ADD BILL ================= */
  const addBill = () => {
    if (!billDesc || !billAmount) return;

    setBills((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: billDesc,
        amount: Number(billAmount),
        date: new Date().toISOString(),
      },
    ]);

    setBillDesc("");
    setBillAmount("");
    setOpenBill(false);
  };

  /* ================= ADD PAYMENT ================= */
  const addPayment = () => {
    if (!payAmount) return;

    setPayments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        amount: Number(payAmount),
        mode: payMode,
        date: new Date().toISOString(),
      },
    ]);

    setPayAmount("");
    setPayMode("Cash");
    setOpenPayment(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 sm:px-6 py-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 cursor-pointer" onClick={onBack} />
            {vendor.name} /{" "}
            <span className="font-semibold">{project.name}</span>
          </div>
          <h1 className="text-2xl font-bold">Project Ledger</h1>
        </div>

        <div className="flex gap-3">
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

          <Button variant="outline" size="sm" onClick={() => setOpenBill(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Bill
          </Button>

          <Button size="sm" onClick={() => setOpenPayment(true)}>
            <CreditCard className="w-4 h-4 mr-1" /> Pay
          </Button>
        </div>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Summary title="Project Billed" value={formatMoney(billed)} />
        <Summary title="Project Paid" value={formatMoney(paid)} green />
        <Summary
          title="Project Balance"
          value={formatMoney(balance)}
          danger={balance > 0}
        />
        <Summary title="Contract Value" value={formatMoney(contractValue)} />
      </div>

      {/* ================= TABS ================= */}
      <div className="flex gap-6 border-b text-sm">
        {["bills", "payments"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`pb-2 ${
              tab === t
                ? "border-b-2 border-green-600 text-green-600"
                : "text-muted-foreground"
            }`}
          >
            {t === "bills" ? "Bills History" : "Payment History"}
          </button>
        ))}
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        {tab === "bills"
          ? bills.map((b) => (
              <div key={b.id} className="flex justify-between py-2 border-b">
                <div>
                  <div className="font-medium">{b.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(b.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-semibold">{formatMoney(b.amount)}</div>
              </div>
            ))
          : payments.map((p) => (
              <div key={p.id} className="flex justify-between py-2 border-b">
                <div>
                  <div className="font-medium">{p.mode}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(p.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-semibold text-green-600">
                  {formatMoney(p.amount)}
                </div>
              </div>
            ))}
      </div>

      {/* ================= ADD BILL MODAL ================= */}
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
            placeholder="Amount"
            type="number"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={addBill}>Add Bill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================= ADD PAYMENT MODAL ================= */}
      <Dialog open={openPayment} onOpenChange={setOpenPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Amount"
            type="number"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
          />
          <Input
            placeholder="Payment Mode"
            value={payMode}
            onChange={(e) => setPayMode(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={addPayment}>Add Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ================================
   Summary Card
================================ */

function Summary({
  title,
  value,
  green,
  danger,
}: {
  title: string;
  value: string;
  green?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div
        className={`text-lg font-bold mt-1 ${
          green ? "text-green-600" : danger ? "text-red-600" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
