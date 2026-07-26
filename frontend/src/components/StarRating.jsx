import { HiStar, HiOutlineStar } from "react-icons/hi2";

export default function StarRating({ rating = 0, count = 0, size = 14 }) {
  const rounded = Math.round(Number(rating));
  return (
    <div className="flex items-center gap-1">
      <div className="flex text-accent">
        {Array.from({ length: 5 }).map((_, i) =>
          i < rounded ? <HiStar key={i} size={size} /> : <HiOutlineStar key={i} size={size} />
        )}
      </div>
      {count > 0 && <span className="text-xs text-espresso/40 dark:text-cream/40">({count})</span>}
    </div>
  );
}
