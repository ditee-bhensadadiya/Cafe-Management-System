import { HiOutlineFaceFrown } from "react-icons/hi2";

export default function EmptyState({ title = "Nothing here yet", subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-secondary/40 px-6 py-16 text-center">
      <HiOutlineFaceFrown size={40} className="mb-4 text-secondary" />
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {subtitle && <p className="mt-2 max-w-sm text-sm text-espresso/60 dark:text-cream/50">{subtitle}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
