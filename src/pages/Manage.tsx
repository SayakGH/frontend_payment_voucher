import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { deleteUser, getAllUsersExceptAdmin, registerUser } from "@/api/users";
import type {
  IDeleteUserResponse,
  IGetAllUsersResponse,
  IUser,
} from "@/types/userType";
import { toast } from "sonner";
import { XCircle } from "lucide-react";

export default function Manage() {
  const [employees, setEmployees] = useState<IUser[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<IUser | null>(null);

  const fetchUsers = async () => {
    const data: IGetAllUsersResponse = await getAllUsersExceptAdmin();
    setEmployees(data.users);
  };

  const addUsers = async (name: string, email: string, password: string) => {
    await registerUser(name, email, password);
  };

  const deleteUsers = async (
    _id: string,
    email: string,
    role: "user" | "admin"
  ) => {
    const data: IDeleteUserResponse = await deleteUser(_id, email, role);
    return data;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);

  const addEmployee = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.custom((t: any) => (
        <div
          className={`${
            t.visible
              ? "animate-in fade-in slide-in-from-top-5"
              : "animate-out fade-out"
          } w-full max-w-sm bg-red-50 border border-red-300 text-red-800 rounded-xl shadow-md p-4 flex gap-3`}
        >
          <XCircle className="w-6 h-6 text-red-600 mt-1" />
          <div className="flex-1">
            <p className="font-semibold text-red-700">Missing fields</p>
            <p className="text-sm text-red-600">
              Please fill in name, email and password.
            </p>
          </div>
        </div>
      ));
      return;
    }

    try {
      await addUsers(name, email, password);
      await fetchUsers();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Failed to add employee.";

      toast.custom((t: any) => (
        <div
          className={`${
            t.visible
              ? "animate-in fade-in slide-in-from-top-5"
              : "animate-out fade-out"
          } w-full max-w-sm bg-red-50 border border-red-300 text-red-800 rounded-xl shadow-md p-4 flex gap-3`}
        >
          <XCircle className="w-6 h-6 text-red-600 mt-1" />
          <div className="flex-1">
            <p className="font-semibold text-red-700">Failed to add employee</p>
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        </div>
      ));
    } finally {
      setOpen(false);
      setName("");
      setEmail("");
      setPassword("");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const data: IDeleteUserResponse = await deleteUsers(
        deleteTarget._id,
        deleteTarget.email,
        deleteTarget.role
      );

      if (data.success === false) {
        toast.error(data.message);
      }

      await fetchUsers();
    } catch (error) {
      console.error("Error deleting employee:", error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Employees</h1>

      {/* Search + Add */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="w-full md:w-1/2">
          <Input
            placeholder="Search employee by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Employee</Button>
          </DialogTrigger>

          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button className="w-full" onClick={addEmployee}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Employees */}
      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredEmployees.map((emp) => (
            <div
              key={emp._id}
              className="flex justify-between items-center border rounded-lg p-4"
            >
              <div>
                <p className="font-semibold">{emp.name}</p>
                <p className="text-sm text-muted-foreground">{emp.email}</p>
              </div>

              <Button
                variant="destructive"
                onClick={() => setDeleteTarget(emp)}
              >
                Delete
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteTarget?.name}</strong>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
