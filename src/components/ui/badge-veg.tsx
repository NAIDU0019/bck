
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        veg: "border-pickle-600 bg-pickle-100 text-pickle-800",
        "non-veg": "border-spice-600 bg-spice-100 text-spice-800",
      },
    },
    defaultVariants: {
      variant: "veg",
    },
  }
);

export interface BadgeVegProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function BadgeVeg({ className, variant, ...props }: BadgeVegProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      <span className={cn(
        "inline-block w-2 h-2 rounded-full mr-1",
        variant === "veg" ? "bg-pickle-600" : "bg-spice-600"
      )}></span>
      {variant === "veg" ? "Veg" : "Non-Veg"}
    </div>
  );
}

export { BadgeVeg };
