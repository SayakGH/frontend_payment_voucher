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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CompanyName =
  | "Airde Real Estate"
  | "Airde Developer"
  | "Unique Realcon";

interface AddProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (
    projectName: string,
    companyName: CompanyName,
    estimatedPrice: number
  ) => void;
}

export default function AddProjectModal({
  open,
  onClose,
  onCreate,
}: AddProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [companyName, setCompanyName] = useState<CompanyName | "">("");
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  const handleSubmit = () => {
    const price = Number(estimatedPrice);

    if (!projectName.trim() || !companyName || price <= 0) return;

    onCreate(projectName.trim(), companyName, price);

    setProjectName("");
    setCompanyName("");
    setEstimatedPrice(0);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Project Name */}
          <div className="space-y-1">
            <Label>Project Name</Label>
            <Input
              placeholder="e.g. Skyline Towers"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          {/* Company */}
          <div className="space-y-1">
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
                <SelectItem value="Airde Developer">Airde Developer</SelectItem>
                <SelectItem value="Unique Realcon">Unique Realcon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estimated Price */}
          <div className="space-y-1">
            <Label>Estimated Project Value (₹)</Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 2500000"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={
              !projectName.trim() || !companyName || Number(estimatedPrice) <= 0
            }
          >
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
