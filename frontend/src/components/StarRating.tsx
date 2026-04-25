import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  value: number;
  size?: number;
  className?: string;
};

/** Read-only star display. For interactive input, see StarRatingInput. */
export function StarRating({ value, size = 16, className }: Props) {
  const rounded = Math.round(value);
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={cn(
            n <= rounded ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300",
          )}
        />
      ))}
    </div>
  );
}
