import React, { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

export function VelocityScroll({
  defaultVelocity = 5,
  numRows = 2,
  children,
  className,
  ...props
}) {
  const rootRef = useRef(null);
  const [isActive, setIsActive] = useState(true);

  // Each row is a very wide element held permanently on its own compositor
  // layer by `will-change: transform`, and the CSS marquee animation runs
  // forever whether or not the section is on screen. Release the layer and
  // pause the animation while it is scrolled away.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting),
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative w-full overflow-hidden text-4xl font-bold tracking-[-0.02em] md:text-7xl md:leading-[5rem]",
        className
      )}
      {...props}
    >
      <style>
        {`
          @keyframes marquee-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .marquee-container {
            display: flex;
            width: fit-content;
            white-space: nowrap;
          }
          .marquee-left {
            animation: marquee-left 15s linear infinite;
          }
          .marquee-right {
            animation: marquee-right 15s linear infinite;
          }
          /* Promote to a layer only while actually animating on screen. */
          .marquee-active .marquee-container {
            will-change: transform;
          }
          .marquee-idle .marquee-container {
            animation-play-state: paused;
          }
        `}
      </style>
      {Array.from({ length: numRows }).map((_, i) => {
        const isLeft = i % 2 === 0;
        const animationClass = isLeft ? (defaultVelocity > 0 ? "marquee-left" : "marquee-right") : (defaultVelocity > 0 ? "marquee-right" : "marquee-left");

        return (
          <div key={i} className="w-full overflow-hidden whitespace-nowrap">
            <div className={cn("marquee-container", animationClass, isActive ? "marquee-active" : "marquee-idle")}>
              <div className="flex px-4">{children}</div>
              <div className="flex px-4">{children}</div>
              <div className="flex px-4">{children}</div>
              <div className="flex px-4">{children}</div>
              <div className="flex px-4">{children}</div>
              <div className="flex px-4">{children}</div>
              <div className="flex px-4">{children}</div>
              <div className="flex px-4">{children}</div>
              <div className="flex px-4">{children}</div>
              <div className="flex px-4">{children}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
