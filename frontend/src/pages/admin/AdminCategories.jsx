import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from "react-icons/hi2";
import { categoryApi } from "../../api/categories";
import Modal from "../../components/Modal";
import FormInput from "../../components/FormInput";
import { TableRowSkeleton } from "../../components/Skeletons";

export default function AdminCategories() {
  const [editing, setEditing] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["admin-categories"], queryFn: () => categoryApi.list(true) });

  const saveMutation = useMutation({
    mutationFn: (payload) => (editing?.id ? categoryApi.update(editing.id, payload) : categoryApi.create(payload)),
    onSuccess: () => {
      toast.success(editing?.id ? "Category updated" : "Category created");
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      setEditing(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryApi.remove(id),
    onSuccess: () => {
      toast.success("Category deleted");
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleDelete = async (cat) => {
    const result = await Swal.fire({
      title: `Delete ${cat.name}?`,
      text: "Products in this category will also be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#D2691E",
      cancelButtonColor: "#6F4E37",
      confirmButtonText: "Delete",
    });
    if (result.isConfirmed) deleteMutation.mutate(cat.id);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Categories</h1>
        <button onClick={() => setEditing({})} className="btn-primary !px-4 !py-2 text-sm">
          <HiOutlinePlus /> Add Category
        </button>
      </div>

      <div className="glass-card mt-6 overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead className="border-b border-secondary/20 text-espresso/50 dark:text-cream/40">
            <tr><th className="p-4">Name</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-secondary/10">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} columns={3} />)
            ) : (
              (data || []).map((c) => (
                <tr key={c.id}>
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.is_active ? "bg-green-100 text-green-700" : "bg-secondary/20 text-primary"}`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => setEditing(c)} className="mr-2 text-primary hover:text-accent"><HiOutlinePencil /></button>
                    <button onClick={() => handleDelete(c)} className="text-espresso/30 hover:text-red-500"><HiOutlineTrash /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing?.id ? "Edit Category" : "Add Category"}>
        <CategoryForm category={editing} onSubmit={(p) => saveMutation.mutate(p)} isSaving={saveMutation.isPending} />
      </Modal>
    </div>
  );
}

function CategoryForm({ category, onSubmit, isSaving }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: category?.name || "", description: category?.description || "", is_active: category?.is_active ?? true },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput label="Name" register={register("name", { required: "Name is required.", minLength: 2 })} error={errors.name} />
      <FormInput label="Description" register={register("description")} error={errors.description} />
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" {...register("is_active")} defaultChecked className="h-4 w-4 rounded text-accent" />
        Active
      </label>
      <button type="submit" disabled={isSaving} className="btn-primary w-full">{isSaving ? "Saving…" : "Save Category"}</button>
    </form>
  );
}
