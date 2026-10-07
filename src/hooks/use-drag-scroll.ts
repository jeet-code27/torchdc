"use client";

import * as React from "react";

export function useDragScroll() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const scrollStart = React.useRef(0);
  const hasMoved = React.useRef(false);

  const onMouseDown = (e: React.MouseEvent) => {
    // Only drag with primary mouse button (left click)
    if (e.button !== 0 || !ref.current) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollStart.current = ref.current.scrollLeft;

    // Temporarily disable snap and smooth scroll while dragging
    ref.current.style.scrollBehavior = "auto";
    ref.current.style.scrollSnapType = "none";
    ref.current.style.cursor = "grabbing";
    ref.current.style.userSelect = "none";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !ref.current) return;
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.3;

    if (Math.abs(walk) > 4) {
      hasMoved.current = true;
      e.preventDefault();
    }

    ref.current.scrollLeft = scrollStart.current - walk;
  };

  const stopDragging = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (ref.current) {
      ref.current.style.scrollBehavior = "smooth";
      ref.current.style.scrollSnapType = "x mandatory";
      ref.current.style.cursor = "";
      ref.current.style.userSelect = "";
    }
  };

  // Prevent accidental product navigation when user drags across cards
  const onClickCapture = (e: React.MouseEvent) => {
    if (hasMoved.current) {
      e.preventDefault();
      e.stopPropagation();
      hasMoved.current = false;
    }
  };

  return {
    ref,
    events: {
      onMouseDown,
      onMouseMove,
      onMouseUp: stopDragging,
      onMouseLeave: stopDragging,
      onClickCapture,
    },
  };
}
