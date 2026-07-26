import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { HiOutlineTrash } from "react-icons/hi2";
import { adminUserApi } from "../../api/admin";
import Pagination from "../../components/Pagination";
import { TableRowSkeleton } from "../../components/Skeletons";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, role, page],
    queryFn: () => adminUserApi.list({ search: search || undefined, role: role || undefined, page, page_size: 10 }),
    keepPreviousData: true,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }) => adminUserApi.setActiveStatus(id, isActive),
    onSuccess: () => {
      toast.success("User status updated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminUserApi.remove(id),
    onSuccess: () => {
      toast.success("User deleted");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: `Delete ${user.name}?`,
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#D2691E",
      cancelButtonColor: "#6F4E37",
      confirmButtonText: "Delete",
    });
    if (result.isConfirmed) deleteMutation.mutate(user.id);
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Users</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search name or email…"
          className="input-field sm:w-72"
        />
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="input-field sm:w-40">
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="glass-card mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-secondary/20 text-espresso/50 dark:text-cream/40">
            <tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-secondary/10">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={5} />)
            ) : (
              (data?.items || []).map((u) => (
                <tr key={u.id}>
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-espresso/60 dark:text-cream/50">{u.email}</td>
                  <td className="p-4 capitalize">{u.role}</td>
                  <td className="p-4">
                    <button
                      onClick={() => statusMutation.mutate({ id: u.id, isActive: !u.is_active })}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.is_active ? "bg-green-100 text-green-700" : "bg-secondary/20 text-primary"}`}
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(u)} className="text-espresso/30 hover:text-red-500"><HiOutlineTrash /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />}
    </div>
  );
}
