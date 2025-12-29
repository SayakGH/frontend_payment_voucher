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

export type VendorFormData = {
  name: string;
  phone: string;
  address: string;
  pan: string;
  gstin?: string;
};

interface AddVendorModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: VendorFormData) => void;
}

export default function AddVendorModal({
  open,
  onClose,
  onCreate,
}: AddVendorModalProps) {
  const [form, setForm] = useState<VendorFormData>({
    name: "",
    phone: "",
    address: "",
    pan: "",
    gstin: "",
  });

  const handleChange = (key: keyof VendorFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.address || !form.pan) return;
    onCreate(form);
    onClose();
    setForm({ name: "", phone: "", address: "", pan: "", gstin: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Vendor Name"
            />
          </div>

          <div className="space-y-1">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Phone Number"
            />
          </div>

          <div className="space-y-1">
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Business Address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>PAN</Label>
              <Input
                value={form.pan}
                onChange={(e) => handleChange("pan", e.target.value)}
                placeholder="ABCDE1234F"
              />
            </div>

            <div className="space-y-1">
              <Label>GSTIN (Optional)</Label>
              <Input
                value={form.gstin}
                onChange={(e) => handleChange("gstin", e.target.value)}
                placeholder="22ABCDE1234F1Z5"
              />
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
