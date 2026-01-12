import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { CreateVendorPayload } from "@/types/vendorTypes";

interface AddVendorModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateVendorPayload) => void;
}

export default function AddVendorModal({
  open,
  onClose,
  onCreate,
}: AddVendorModalProps) {
  const [form, setForm] = useState<CreateVendorPayload>({
    name: "",
    phone: "",
    address: "",
    pan: "",
    gstin: "",
    type: "Vendor",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: keyof CreateVendorPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" })); // clear error on edit
  };

  /* ================= Validation ================= */

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.type) e.type = "Select a type";
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.address.trim()) e.address = "Address is required";

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      e.phone = "Enter a valid 10-digit Indian mobile number";
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan.toUpperCase())) {
      e.pan = "Invalid PAN format (ABCDE1234F)";
    }

    if (form.gstin) {
      if (
        !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
          form.gstin.toUpperCase()
        )
      ) {
        e.gstin = "Invalid GSTIN format";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onCreate({
      ...form,
      pan: form.pan.toUpperCase(),
      gstin: form.gstin?.toUpperCase(),
    });

    onClose();

    setForm({
      name: "",
      phone: "",
      address: "",
      pan: "",
      gstin: "",
      type: "Vendor",
    });
    setErrors({});
  };

  /* ================= UI ================= */

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Beneficiaries</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          {/* Type */}
          <div className="space-y-1">
            <Label>Type</Label>
            <select
              className="w-full border rounded-md h-10 px-3"
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
            >
              <option value="Vendor">Vendor</option>
              <option value="Salary">Salary</option>
              <option value="Agent">Agent</option>
              <option value="Phone Bill">Phone Bill</option>
              <option value="Rent">Rent</option>
              <option value="Other">Other Expense</option>
            </select>
            {errors.type && (
              <p className="text-xs text-red-600">{errors.type}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              inputMode="numeric"
              maxLength={10}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 10) {
                  handleChange("phone", value);
                }
              }}
              placeholder="10-digit mobile number"
            />

            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1">
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
            {errors.address && (
              <p className="text-xs text-red-600">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* PAN */}
            <div className="space-y-1">
              <Label>PAN</Label>
              <Input
                value={form.pan}
                maxLength={10}
                onChange={(e) => {
                  const value = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "");
                  handleChange("pan", value);
                }}
                placeholder="ABCDE1234F"
              />

              {errors.pan && (
                <p className="text-xs text-red-600">{errors.pan}</p>
              )}
            </div>

            {/* GSTIN */}
            <div className="space-y-1">
              <Label>GSTIN (Optional)</Label>
              <Input
                value={form.gstin}
                onChange={(e) => handleChange("gstin", e.target.value)}
              />
              {errors.gstin && (
                <p className="text-xs text-red-600">{errors.gstin}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
