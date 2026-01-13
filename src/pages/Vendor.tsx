import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddVendorModal from "@/components/AddVendorModal";
import VendorDetail from "./VendorDetails";
import VendorPaymentLedger from "./VendorPaymentLedger";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { updateVendorPanPhone } from "@/api/vendor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type {
  CreateVendorPayload,
  IGetVendorsResponse,
  Vendor,
} from "@/types/vendorTypes";
import {
  createVendor,
  getAllVendors,
  deleteVendor,
  deleteVendorv2,
} from "@/api/vendor";

type VendorType =
  | "Vendor"
  | "Salary"
  | "Agent"
  | "Phone Bill"
  | "Rent"
  | "Other";

export default function Vendors() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [deleteVendorId, setDeleteVendorId] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOther, setSelectedOther] = useState<Vendor | null>(null);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [editPan, setEditPan] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const role = localStorage.getItem("role");

  const vendorTypeBadge = (type?: VendorType) => {
    if (!type) return <Badge variant="outline">Unknown</Badge>;

    const map: Record<
      VendorType,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      Vendor: "default",
      Salary: "secondary",
      Agent: "outline",
      "Phone Bill": "secondary",
      Rent: "default",
      Other: "outline",
    };

    return <Badge variant={map[type]}>{type}</Badge>;
  };

  /* ================= Load Vendors ================= */

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data: IGetVendorsResponse = await getAllVendors();
      setVendors(data.vendors);
    } catch {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  /* ================= Create Vendor ================= */

  const handleCreateVendor = async (data: CreateVendorPayload) => {
    try {
      await createVendor(data);
      toast.success("Vendor created");
      fetchVendors();
    } catch {
      toast.error("Failed to create vendor");
    }
  };

  /* ================= Delete Vendor ================= */

  const handleDelete = async () => {
    if (!deleteVendorId) return;

    try {
      await deleteVendor(deleteVendorId._id);

      // Optimistic UI
      setVendors((prev) => prev.filter((v) => v._id !== deleteVendorId._id));
      toast.success("Vendor deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteVendorId(null);
    }
  };

  const handleDeletev2 = async () => {
    if (!deleteVendorId) return;

    try {
      await deleteVendorv2(deleteVendorId._id || "");
      // Optimistic UI
      setVendors((prev) => prev.filter((v) => v._id !== deleteVendorId._id));
      toast.success("Vendor deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteVendorId(null);
    }
  };
  /* ================= Search ================= */

  const filteredVendors = vendors.filter((v) =>
    `${v.name} ${v.pan} ${v.gstin || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* ================= Project View ================= */

  if (selectedVendor) {
    return (
      <div className="p-6">
        <VendorDetail
          vendor={selectedVendor}
          onBack={() => setSelectedVendor(null)}
        />
      </div>
    );
  }
  if (selectedOther) {
    return (
      <div className="p-6">
        <VendorPaymentLedger
          vendor={selectedOther}
          onBack={() => setSelectedOther(null)}
        />
      </div>
    );
  }
  const handleUpdateVendor = async () => {
    if (!editVendor) return;

    try {
      setSaving(true);
      await updateVendorPanPhone(editVendor._id, {
        pan: editPan,
        phone: editPhone,
      });

      toast.success("Vendor updated");

      setEditVendor(null);
      fetchVendors();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Beneficiaries</h1>
          <p className="text-sm text-muted-foreground">
            Manage vendors, salary, agents, phone bills and more.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Add Vendor</Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by name, PAN or GSTIN..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full"
      />

      {/* Vendors Table */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Type</TableHead> {/* new */}
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead>PAN</TableHead>
                <TableHead className="hidden sm:table-cell">GSTIN</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Loading vendors…
                  </TableCell>
                </TableRow>
              ) : filteredVendors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No vendors found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendors.map((v) => (
                  <TableRow
                    key={v._id}
                    className="hover:bg-muted/40 transition"
                  >
                    {/* Vendor */}
                    <TableCell className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
                        {v.name.charAt(0)}
                      </div>

                      <div>
                        <p className="font-medium leading-tight">{v.name}</p>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {v.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{vendorTypeBadge(v.type)}</TableCell>

                    {/* Phone */}
                    <TableCell className="hidden md:table-cell">
                      {v.phone}
                    </TableCell>

                    {/* PAN */}
                    <TableCell className="font-mono text-sm">{v.pan}</TableCell>

                    {/* GSTIN */}
                    <TableCell className="hidden sm:table-cell font-mono text-sm">
                      {v.gstin || "—"}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right space-x-2">
                      {role === "admin" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditVendor(v);
                            setEditPan(v.pan);
                            setEditPhone(v.phone);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={
                          v.type === "Vendor"
                            ? () => setSelectedVendor(v)
                            : () => setSelectedOther(v)
                        }
                      >
                        View
                      </Button>

                      {role === "admin" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteVendorId(v)}
                        >
                          Delete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteVendorId}
        onOpenChange={() => setDeleteVendorId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the vendor and all linked projects,
              bills and payments.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={
                deleteVendorId?.type === "Vendor"
                  ? handleDelete
                  : handleDeletev2
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editVendor} onOpenChange={() => setEditVendor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm">PAN</label>
              <Input
                value={editPan}
                onChange={(e) => setEditPan(e.target.value.toUpperCase())}
              />
            </div>

            <div>
              <label className="text-sm">Phone</label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>

            <Button
              onClick={handleUpdateVendor}
              className="w-full"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Vendor Modal */}
      <AddVendorModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={handleCreateVendor}
      />
    </div>
  );
}
