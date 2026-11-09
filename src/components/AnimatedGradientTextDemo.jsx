import { cn } from "../lib/utils";
import { AnimatedGradientText } from "./animate-gradient-text";
import { ChevronRight } from "lucide-react";

export function AnimatedGradientTextDemo() {
  return (
    <div className="group relative inline-flex items-center justify-center rounded-full px-4 py-1.5 dark:shadow-[inset_0_-8px_10px_rgba(255,255,255,0.05)] shadow-[inset_0_-2px_6px_rgba(6,182,212,0.15)] transition-shadow duration-500 ease-out dark:hover:shadow-[inset_0_-5px_10px_rgba(255,255,255,0.08)] hover:shadow-[inset_0_-3px_8px_rgba(6,182,212,0.25)] border dark:border-[#444444] border-cyan-200">
      <span
        className={cn(
          "absolute inset-0 block h-full w-50 animate-gradient rounded-[inherit] bg-gradient-to-r from-[#ffffff]/30 via-[#888888]/30 to-[#ffffff]/30 bg-[length:300%_100%] p-[1px]"
        )}
        style={{
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "destination-out",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "subtract",
          WebkitClipPath: "padding-box",
        }}
      />
      ✨
      <AnimatedGradientText
        className="text-sm font-medium"
        colorFrom="#ffffff"
        colorTo="#999999"
      >
        Innovation For the Future
      </AnimatedGradientText>
      <ChevronRight
        className="ml-1 size-4 dark:stroke-[#999999] stroke-cyan-600 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5"
      />
    </div>
  );
}