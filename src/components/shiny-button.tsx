"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

type ShinyButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ className, children, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type} // "button" | "submit" | "reset"
        className={cn(
          "group relative px-2 flex justify-center items-center border-2 border-white/30 gap-2 text-white bg-emerald-700 text-base/7 transform transition-all duration-300 rounded-sm overflow-hidden font-medium hover:ring-2 hover:ring-emerald-700 hover:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-offset-2",
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">
          {children}
          <ArrowRight className="size-4 shrink-0 text-white transition-transform duration-300 ease-in-out group-hover:translate-x-[2px]" />
        </span>
        {/* fix the typo: cubic-bezier */}
        <div className="ease-[cubic-bezier(0.19,0.22,1)] absolute -left-[75px] -top-[50px] -z-10 h-[155px] w-8 rotate-[35deg] bg-white opacity-20 transition-all duration-500 group-hover:left-[120%]" />
      </button>
    );
  }
);

ShinyButton.displayName = "ShinyButton";
