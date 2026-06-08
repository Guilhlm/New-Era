'use client';

import { useEffect, useRef, useState } from 'react';

type UseAnchoredMenuOptions = {
  menuWidth?: number;
  menuDataAttribute?: string;
};

export function useAnchoredMenu({
  menuWidth = 144,
  menuDataAttribute = 'data-anchored-menu',
}: UseAnchoredMenuOptions = {}) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if ((target as Element).closest?.(`[${menuDataAttribute}]`)) return;
      setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [menuDataAttribute]);

  useEffect(() => {
    if (!open || !triggerRef.current) {
      setMenuPosition(null);
      return;
    }

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - menuWidth,
      });
    }

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, menuWidth]);

  return {
    open,
    setOpen,
    menuPosition,
    triggerRef,
    menuDataAttribute,
  };
}
