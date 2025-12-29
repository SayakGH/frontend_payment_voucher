import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import type { Vendor } from "./Vendor";
import AddProjectModal from "@/components/AddProjectModal";
import ProjectLedger from "./ProjectLedger";

interface Project {
  id: string;
  name: string;
  billed: number;
  paid: number;
}

interface Props {
  vendor: Vendor;
  onBack: () => void;
}

export default function VendorDetail({ vendor, onBack }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Skyline Towers",
      billed: 128000,
      paid: 64000,
    },
  ]);

  if (selectedProject) {
    return (
      <ProjectLedger
        vendor={vendor}
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  const handleCreateProject = (name: string) => {
    setProjects((prev) => [
      ...prev,
      { id: Date.now().toString(), name, billed: 0, paid: 0 },
    ]);
  };

  const totalBilled = projects.reduce((s, p) => s + p.billed, 0);
  const totalPaid = projects.reduce((s, p) => s + p.paid, 0);
  const totalBalance = totalBilled - totalPaid;

  return (
    <div className="bg-muted/30 min-h-screen space-y-4">
      {/* Header */}
      <div className="px-3 sm:px-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{vendor.name}</h1>
              <p className="text-sm text-muted-foreground">
                {vendor.gstin || vendor.pan} | {vendor.phone}
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-xs text-muted-foreground">
              TOTAL VENDOR LIABILITY
            </div>
            <div className="text-xl font-bold text-red-600">
              ₹ {totalBalance.toLocaleString("en-IN")}
            </div>
            <Button
              size="sm"
              className="gap-1 mt-2"
              onClick={() => setOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Project
            </Button>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="px-3 sm:px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => {
            const balance = p.billed - p.paid;

            return (
              <Card
                key={p.id}
                onClick={() => setSelectedProject(p)}
                className="cursor-pointer hover:shadow-md transition"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-muted-foreground">›</div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Billed</span>
                      <span>₹ {p.billed.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paid</span>
                      <span className="text-green-600">
                        ₹ {p.paid.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Balance</span>
                      <span className="text-red-600">
                        ₹ {balance.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add Project Modal */}
      <AddProjectModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}
