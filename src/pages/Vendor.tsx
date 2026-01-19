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
import { Card, CardContent } from "@/components/ui/card";

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
      .includes(search.toLowerCase()),
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

      {/* ================= MOBILE VIEW ================= */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="space-y-3">
            <VendorCardSkeleton />
            <VendorCardSkeleton />
            <VendorCardSkeleton />
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No vendors found
          </div>
        ) : (
          filteredVendors.map((v) => (
            <Card key={v._id} className="shadow-sm">
              <CardContent className="pt-4 space-y-3">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
                      {v.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold leading-tight">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.phone}</p>
                    </div>
                  </div>

                  {vendorTypeBadge(v.type)}
                </div>

                {/* Mini Info Row */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">PAN</p>
                    <p className="font-mono">{v.pan}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">GSTIN</p>
                    <p className="font-mono">{v.gstin || "—"}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={
                      v.type === "Vendor"
                        ? () => setSelectedVendor(v)
                        : () => setSelectedOther(v)
                    }
                  >
                    View
                  </Button>

                  {role === "admin" && (
                    <>
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

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteVendorId(v)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ================= DESKTOP VIEW ================= */}
      <div className="hidden md:block border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead>PAN</TableHead>
                <TableHead className="hidden sm:table-cell">GSTIN</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                      <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredVendors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
                    <TableCell className="flex items-center gap-2 pr-2">
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

                    <TableCell className="hidden md:table-cell">
                      {v.phone}
                    </TableCell>

                    <TableCell className="font-mono text-sm">{v.pan}</TableCell>

                    <TableCell className="hidden sm:table-cell font-mono text-sm">
                      {v.gstin || "—"}
                    </TableCell>

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

function VendorCardSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            <div className="space-y-1">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="h-3 w-10 bg-muted rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="h-3 w-10 bg-muted rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <div className="h-9 flex-1 bg-muted rounded animate-pulse" />
          <div className="h-9 w-9 bg-muted rounded animate-pulse" />
          <div className="h-9 w-9 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
