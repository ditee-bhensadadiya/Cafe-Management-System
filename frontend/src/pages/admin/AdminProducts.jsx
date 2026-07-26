import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineArrowDownTray } from "react-icons/hi2";
import { productApi } from "../../api/products";
import { categoryApi } from "../../api/categories";
import Modal from "../../components/Modal";
import FormInput from "../../components/FormInput";
import Pagination from "../../components/Pagination";
import { TableRowSkeleton } from "../../components/Skeletons";
import { formatCurrency } from "../../utils/format";
import { exportToCsv } from "../../utils/csv";

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null = closed, {} = create, {...} = edit
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page],
    queryFn: () => productApi.list({ page, page_size: 10, sort_by: "created_at", sort_order: "desc" }),
    keepPreviousData: true,
  });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: () => categoryApi.list() });

  const saveMutation = useMutation({
    mutationFn: (payload) => (editing?.id ? productApi.update(editing.id, payload) : productApi.create(payload)),
    onSuccess: () => {
      toast.success(editing?.id ? "Product updated" : "Product created");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setEditing(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productApi.remove(id),
    onSuccess: () => {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleDelete = async (product) => {
    const result = await Swal.fire({
      title: `Delete ${product.name}?`,
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#D2691E",
      cancelButtonColor: "#6F4E37",
      confirmButtonText: "Delete",
    });
    if (result.isConfirmed) deleteMutation.mutate(product.id);
  };

  const handleExport = () => {
    exportToCsv(
      "products.csv",
      (data?.items || []).map((p) => ({
        name: p.name,
        category: p.category?.name,
        price: p.price,
        stock: p.stock,
        available: p.is_available,
      }))
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Products</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-ghost !px-4 !py-2 text-sm">
            <HiOutlineArrowDownTray /> Export CSV
          </button>
          <button onClick={() => setEditing({})} className="btn-primary !px-4 !py-2 text-sm">
            <HiOutlinePlus /> Add Product
          </button>
        </div>
      </div>

      <div className="glass-card mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-secondary/20 text-espresso/50 dark:text-cream/40">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary/10">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={6} />)
            ) : (
              (data?.items || []).map((p) => (
                <tr key={p.id}>
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4 text-espresso/60 dark:text-cream/50">{p.category?.name}</td>
                  <td className="p-4">{formatCurrency(p.price)}</td>
                  <td className="p-4">{p.stock}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.is_available ? "bg-green-100 text-green-700" : "bg-secondary/20 text-primary"}`}>
                      {p.is_available ? "Available" : "Hidden"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => setEditing(p)} className="mr-2 text-primary hover:text-accent"><HiOutlinePencil /></button>
                    <button onClick={() => handleDelete(p)} className="text-espresso/30 hover:text-red-500"><HiOutlineTrash /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />}

      <ProductFormModal
        open={editing !== null}
        product={editing}
        categories={categories || []}
        onClose={() => setEditing(null)}
        onSubmit={(payload) => saveMutation.mutate(payload)}
        isSaving={saveMutation.isPending}
      />
    </div>
  );
}

function ProductFormModal({ open, product, categories, onClose, onSubmit, isSaving }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Re-populate the form whenever a different product is opened for editing
  if (open && product && product._loadedId !== product.id) {
    reset({
      name: product.name || "",
      description: product.description || "",
      image_url: product.image_url || "",
      price: product.price || "",
      stock: product.stock ?? 0,
      category_id: product.category?.id || product.category_id || "",
      is_available: product.is_available ?? true,
    });
    product._loadedId = product.id;
  }

  const submit = (data) =>
    onSubmit({
      ...data,
      price: Number(data.price),
      stock: Number(data.stock),
      is_available: data.is_available === true || data.is_available === "true",
    });

  return (
    <Modal open={open} onClose={onClose} title={product?.id ? "Edit Product" : "Add Product"}>
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <FormInput label="Name" register={register("name", { required: "Name is required.", minLength: 2 })} error={errors.name} />
        <FormInput label="Description" register={register("description")} error={errors.description} />
        <FormInput label="Image URL" register={register("image_url")} error={errors.image_url} />
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Price" type="number" step="0.01" register={register("price", { required: "Required", min: 0.01 })} error={errors.price} />
          <FormInput label="Stock" type="number" register={register("stock", { required: "Required", min: 0 })} error={errors.stock} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-espresso/80 dark:text-cream/70">Category</label>
          <select {...register("category_id", { required: true })} className="input-field">
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" defaultChecked {...register("is_available")} className="h-4 w-4 rounded text-accent" />
          Available on menu
        </label>
        <button type="submit" disabled={isSaving} className="btn-primary w-full">
          {isSaving ? "Saving…" : "Save Product"}
        </button>
      </form>
    </Modal>
  );
}
