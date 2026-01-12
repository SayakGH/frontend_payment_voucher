import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { ArrowLeft, Plus, Eye, Trash2 } from "lucide-react";

import AddProjectModal, {
  type CompanyName,
} from "@/components/AddProjectModal";
import ProjectLedger from "./ProjectLedger";
import type { Vendor } from "@/types/vendorTypes";
import type { Project } from "@/types/projectType";
import {
  createProject,
  getAllVendorProjects,
  deleteProject,
} from "@/api/vendor";

interface Props {
  vendor: Vendor;
  onBack: () => void;
}

export default function VendorDetail({ vendor, onBack }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  /* ================= Load Projects ================= */

  useEffect(() => {
    if (!selectedProject) {
      loadProjects();
    }
  }, [vendor._id, selectedProject]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getAllVendorProjects(vendor._id);
      setProjects(data.projects);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setLoading(false);
    }
  };
  const role = localStorage.getItem("role");

  /* ================= Create Project ================= */

  const handleCreateProject = async (
    projectName: string,
    companyName: CompanyName,
    estimatedPrice: Number
  ) => {
    try {
      await createProject({
        vendorId: vendor._id,
        projectName,
        companyName,
        estimated: estimatedPrice,
      });
      loadProjects();
    } catch (err) {
      console.error("Create project failed", err);
    }
  };

  /* ================= Delete Project ================= */

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteProject(deleteTarget._id);

      // Optimistic UI
      setProjects((prev) => prev.filter((p) => p._id !== deleteTarget._id));
    } catch (err) {
      console.error("Delete project failed", err);
    } finally {
      setDeleteTarget(null);
    }
  };

  /* ================= Ledger View ================= */

  if (selectedProject) {
    return (
      <ProjectLedger
        vendor={vendor}
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  /* ================= Totals ================= */

  const totalBilled = projects.reduce((s, p) => s + p.billed, 0);
  const totalPaid = projects.reduce((s, p) => s + p.paid, 0);
  const totalBalance = totalBilled - totalPaid;

  /* ================= UI ================= */

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

      {/* Projects Grid */}
      <div className="px-3 sm:px-6 pb-6">
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">
            Loading projects…
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No projects yet. Click <b>Add Project</b> to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((p) => {
              const balance = p.billed - p.paid;

              return (
                <Card
                  key={p._id}
                  className="hover:shadow-md transition flex flex-col"
                >
                  <CardContent className="p-5 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-semibold text-base">
                        {p.projectName}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2 text-sm flex-1">
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

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 flex items-center gap-2"
                        onClick={() => setSelectedProject(p)}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>

                      {role === "admin" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 flex items-center gap-2"
                          onClick={() => setDeleteTarget(p)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      <AddProjectModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={handleCreateProject}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <b>{deleteTarget?.projectName}</b>{" "}
              and all its bills & payments.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
