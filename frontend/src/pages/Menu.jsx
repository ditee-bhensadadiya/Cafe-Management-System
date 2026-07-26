import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { HiOutlineMagnifyingGlass, HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { productApi } from "../api/products";
import { categoryApi } from "../api/categories";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/Skeletons";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import { useDebounce } from "../hooks/useDebounce";

const SORT_OPTIONS = [
  { value: "created_at:desc", label: "Newest first" },
  { value: "price:asc", label: "Price: Low to High" },
  { value: "price:desc", label: "Price: High to Low" },
  { value: "rating:desc", label: "Top rated" },
  { value: "name:asc", label: "Name: A–Z" },
];

export default function Menu() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [sort, setSort] = useState("created_at:desc");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 400);
  const [sortBy, sortOrder] = sort.split(":");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list(),
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", { debouncedSearch, categoryId, sortBy, sortOrder, availableOnly, page }],
    queryFn: () =>
      productApi.list({
        search: debouncedSearch || undefined,
        category_id: categoryId || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        available_only: availableOnly,
        page,
        page_size: 12,
      }),
    keepPreviousData: true,
  });

  const products = data?.items || [];

  const handleCategoryClick = (id) => {
    setCategoryId(id);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="font-body text-sm font-semibold uppercase tracking-widest text-accent">Our Menu</p>
        <h1 className="mt-1 font-display text-4xl font-semibold sm:text-5xl">Made fresh, served warm</h1>
        <p className="mt-3 max-w-xl text-espresso/60 dark:text-cream/60">
          Browse coffee, tea, and cafe favorites — search, filter, and sort to find exactly what you're craving.
        </p>
      </motion.div>

      {/* Search + sort bar */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-espresso/40" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search for cappuccino, margherita, tiramisu…"
            className="input-field pl-11"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="input-field sm:w-56"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="btn-ghost sm:w-auto"
        >
          <HiOutlineAdjustmentsHorizontal /> Filters
        </button>
      </div>

      {filtersOpen && (
        <label className="mt-4 flex w-fit items-center gap-2 text-sm font-medium text-espresso/70 dark:text-cream/60">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => {
              setAvailableOnly(e.target.checked);
              setPage(1);
            }}
            className="h-4 w-4 rounded border-secondary/40 text-accent focus:ring-accent/30"
          />
          Show available items only
        </label>
      )}

      {/* Category chips */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryClick(null)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            categoryId === null
              ? "border-primary bg-primary text-cream"
              : "border-secondary/40 text-espresso/70 hover:bg-primary/5 dark:text-cream/60"
          }`}
        >
          All
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              categoryId === cat.id
                ? "border-primary bg-primary text-cream"
                : "border-secondary/40 text-espresso/70 hover:bg-primary/5 dark:text-cream/60"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="mt-8">
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : isError ? (
          <EmptyState title="Couldn't load the menu" subtitle="Please check your connection and try again." />
        ) : products.length === 0 ? (
          <EmptyState
            title="No items match your search"
            subtitle="Try a different search term, or clear your filters."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {data && (
          <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
