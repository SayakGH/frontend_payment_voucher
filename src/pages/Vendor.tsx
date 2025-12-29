import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddVendorModal from "@/components/AddVendorModal";
import type { VendorFormData } from "@/components/AddVendorModal";
import VendorDetail from "./VendorDetails";
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

export type Vendor = {
  id: string;
  name: string;
  phone: string;
  address: string;
  pan: string;
  gstin?: string;
};

export default function Vendors() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const handleDelete = () => {
    if (!deleteId) return;

    setVendors((prev) => prev.filter((v) => v.id !== deleteId));
    setDeleteId(null);
  };

  const handleCreateVendor = (data: VendorFormData) => {
    setVendors((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        ...data,
      },
    ]);
  };

  const filteredVendors = vendors.filter((v) =>
    `${v.name} ${v.pan} ${v.gstin || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-sm text-muted-foreground">
            Manage contractors and suppliers
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

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="bg-muted sticky top-0 z-10">
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead>PAN</TableHead>
                  <TableHead className="hidden sm:table-cell">GSTIN</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredVendors.map((v) => (
                  <TableRow key={v.id} className="hover:bg-muted/40 transition">
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedVendor(v)}
                      >
                        View
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteId(v.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredVendors.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No vendors found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this vendor and all linked projects.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddVendorModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={handleCreateVendor}
      />
    </div>
  );
}
