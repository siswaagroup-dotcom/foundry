import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[10px] border border-[#e5e7eb] bg-white px-3 pr-10 text-sm text-[#111827] outline-none transition-colors placeholder:text-[#9b9b9b] focus:border-primary focus:ring-2 focus:ring-primary/15 sm:h-11 lg:h-12",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
