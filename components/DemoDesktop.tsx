"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import React, {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type DemoDesktopWindow = {
  id: string;
  title?: string;
  content: React.ReactNode;
  x?: number;
  y?: number;
  widthPx?: number;
  heightPx?: number;
  scale?: number;
  zIndex?: number;
  ctaHref?: string;
  ctaLabel?: React.ReactNode;
  hideOnMobile?: boolean;
  frameless?: boolean;
  shadowless?: boolean;
  allowOverflow?: boolean;
  mobileXOffset?: number;
};

export interface DemoDesktopProps {
  className?: string;
  height?: string | number;
  minHeight?: string | number;
  backgroundImage?: { src: string; darkSrc?: string; alt?: string } | null;
  preload?: boolean;
  windows: DemoDesktopWindow[];
  disableInteractions?: boolean;
  disableResizing?: boolean;
  innerPaddingPx?: number;
  animateEntrance?: boolean;
  entranceStagger?: number;
  mobileBreakpoint?: number;
}

export default function DemoDesktop({
  className,
  height = "min(780px, 70vh)",
  minHeight,
  backgroundImage,
  preload,
  windows,
  disableInteractions = false,
  disableResizing = false,
  innerPaddingPx = 32,
  animateEntrance = false,
  entranceStagger = 0.6,
  mobileBreakpoint = 768,
}: DemoDesktopProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasUserAdjustedLayout, setHasUserAdjustedLayout] = useState(false);
  const [resetVersion, setResetVersion] = useState(0);

  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const [hasEnteredViewport, setHasEnteredViewport] = useState<boolean>(false);
  const [isInViewport, setIsInViewport] = useState<boolean>(false);
  const entrancePlayedRef = useRef<Set<string>>(new Set());
  const [, setEntranceVersion] = useState<number>(0);

  const isMobileViewport =
    typeof window !== "undefined" && window.innerWidth < mobileBreakpoint;
  const visibilityThreshold = isMobileViewport ? 0.3 : 0.66;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    try {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const overlap = Math.max(
        0,
        Math.min(rect.bottom, vh) - Math.max(rect.top, 0)
      );
      const ratio = rect.height > 0 ? overlap / rect.height : 0;
      if (ratio >= visibilityThreshold) {
        setIsInViewport(true);
        setHasEnteredViewport(true);
      }
    } catch {}
  }, [visibilityThreshold]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const ratio = entry?.intersectionRatio ?? 0;
        setIsInViewport(ratio >= visibilityThreshold);
      },
      { root: null, threshold: [0, 0.3, 0.5, 0.66, 0.9, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibilityThreshold]);

  useEffect(() => {
    if (isInViewport && !hasEnteredViewport) setHasEnteredViewport(true);
  }, [isInViewport, hasEnteredViewport]);

  const [hasAppliedMobileLayout, setHasAppliedMobileLayout] = useState(false);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  type WindowState = {
    id: string;
    title?: string;
    xPercent: number;
    yPercent: number;
    originalXPercent: number;
    originalYPercent: number;
    widthPx: number;
    heightPx: number;
    baseWidthPx: number;
    baseHeightPx: number;
    scale: number;
    zIndex: number;
    content: React.ReactNode;
    ctaHref?: string;
    ctaLabel?: React.ReactNode;
    hideOnMobile?: boolean;
    frameless: boolean;
    shadowless: boolean;
    allowOverflow: boolean;
    mobileXOffset: number;
    isWidthFlexible: boolean;
    isHeightFlexible: boolean;
  };

  const DEFAULT_WIDTH = 1024;
  const DEFAULT_HEIGHT = 560;
  const MIN_WIDTH = 420;
  const MIN_HEIGHT = 260;

  const baseWindows = useMemo<WindowState[]>(() => {
    return windows.map((w, index) => {
      const providedWidth = Number(w.widthPx);
      const hasWidth = Number.isFinite(providedWidth);
      const providedHeight = Number(w.heightPx);
      const hasHeight = Number.isFinite(providedHeight);
      const isFrameless = Boolean(w.frameless);
      const isShadowless = Boolean(w.shadowless);
      const allowsOverflow = Boolean(w.allowOverflow);
      const xPct = typeof w.x === "number" ? w.x : 50;
      const yPct = typeof w.y === "number" ? w.y : 50;

      return {
        id: w.id,
        title: w.title,
        xPercent: xPct,
        yPercent: yPct,
        originalXPercent: xPct,
        originalYPercent: yPct,
        widthPx: Math.max(
          hasWidth ? providedWidth : DEFAULT_WIDTH,
          isFrameless ? 0 : MIN_WIDTH
        ),
        heightPx: hasHeight ? providedHeight : DEFAULT_HEIGHT,
        baseWidthPx: Math.max(
          hasWidth ? providedWidth : DEFAULT_WIDTH,
          isFrameless ? 0 : MIN_WIDTH
        ),
        baseHeightPx: hasHeight ? providedHeight : DEFAULT_HEIGHT,
        scale: typeof w.scale === "number" ? w.scale : 1,
        zIndex: typeof w.zIndex === "number" ? w.zIndex : 10 + index,
        content: w.content,
        ctaHref: w.ctaHref,
        ctaLabel: w.ctaLabel,
        hideOnMobile: Boolean(w.hideOnMobile),
        frameless: isFrameless,
        shadowless: isShadowless,
        allowOverflow: allowsOverflow,
        mobileXOffset:
          typeof w.mobileXOffset === "number" ? w.mobileXOffset : 0,
        isWidthFlexible: !hasWidth,
        isHeightFlexible: !hasHeight,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windows.map((w) => w.id).join("|")]);

  const [winStates, setWinStates] = useState<WindowState[]>(baseWindows);

  useLayoutEffect(() => {
    setWinStates(baseWindows);
  }, [baseWindows]);

  useEffect(() => {
    if (!windows.length) return;
    const byId = new Map(windows.map((w) => [w.id, w]));
    setWinStates((prev) =>
      prev.map((w) => {
        const next = byId.get(w.id);
        if (!next) return w;
        return {
          ...w,
          title: next.title ?? w.title,
          content: next.content,
          ctaHref: next.ctaHref,
          ctaLabel: next.ctaLabel,
          hideOnMobile: Boolean(next.hideOnMobile),
          frameless: Boolean(next.frameless),
          shadowless: Boolean(next.shadowless),
          allowOverflow: Boolean(next.allowOverflow),
          mobileXOffset:
            typeof next.mobileXOffset === "number"
              ? next.mobileXOffset
              : w.mobileXOffset,
        };
      })
    );
  }, [windows]);

  const windowIdKey = useMemo(
    () => winStates.map((w) => w.id).join("|"),
    [winStates]
  );

  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  useEffect(() => {
    if (winStates.length === 0) return;
    const top = winStates.reduce(
      (max, w) => (w.zIndex > max.zIndex ? w : max),
      winStates[0]
    );
    if (top.id !== activeWindowId) setActiveWindowId(top.id);
  }, [winStates, activeWindowId]);

  const nextZ = useRef<number>(100);
  function focusWindow(id: string) {
    setWinStates((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: nextZ.current++ } : w))
    );
    setActiveWindowId(id);
  }

  // Drag handling
  const dragRef = useRef<{
    id: string;
    pointerId: number;
    dxCenter: number;
    dyCenter: number;
  } | null>(null);

  function onDragStart(
    e: React.PointerEvent,
    id: string,
    windowEl: HTMLDivElement
  ) {
    const container = containerRef.current;
    if (!container) return;
    const isMobileContainer =
      container.getBoundingClientRect().width < mobileBreakpoint;
    if (isMobileContainer) return;
    focusWindow(id);
    setHasUserAdjustedLayout(true);
    const winRect = windowEl.getBoundingClientRect();
    const centerX = winRect.left + winRect.width / 2;
    const centerY = winRect.top + winRect.height / 2;
    dragRef.current = {
      id,
      pointerId: e.pointerId,
      dxCenter: e.clientX - centerX,
      dyCenter: e.clientY - centerY,
    };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const { id, pointerId, dxCenter, dyCenter } = dragRef.current;
    if (e.pointerId !== pointerId) return;
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const rawCenterX = e.clientX - dxCenter;
    const rawCenterY = e.clientY - dyCenter;
    const isMobileContainer = cRect.width < mobileBreakpoint;

    let clampedCenterX = rawCenterX;
    let clampedCenterY = rawCenterY;

    const windowEl = document.getElementById(`demo-window-${id}`);
    if (!windowEl) return;
    const wRect = windowEl.getBoundingClientRect();

    if (isMobileContainer) {
      const fitsHorizontally =
        wRect.width + 2 * innerPaddingPx <= cRect.width;
      if (fitsHorizontally) {
        clampedCenterX = cRect.left + cRect.width / 2;
      } else {
        clampedCenterX = cRect.left + innerPaddingPx + wRect.width / 2;
      }
      const minCy = cRect.top + wRect.height / 2;
      const maxCy = cRect.bottom - wRect.height / 2;
      clampedCenterY = Math.max(minCy, Math.min(maxCy, rawCenterY));
    } else {
      const minCy = cRect.top + wRect.height / 2;
      const maxCy = cRect.bottom - wRect.height / 2;
      clampedCenterY = Math.max(minCy, Math.min(maxCy, rawCenterY));
    }

    const xPercent = ((clampedCenterX - cRect.left) / cRect.width) * 100;
    const yPercent = ((clampedCenterY - cRect.top) / cRect.height) * 100;
    const originalXPercent = ((rawCenterX - cRect.left) / cRect.width) * 100;
    const originalYPercent = ((rawCenterY - cRect.top) / cRect.height) * 100;

    setWinStates((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              xPercent,
              yPercent,
              ...(isMobileContainer
                ? {}
                : {
                    originalXPercent,
                    originalYPercent,
                  }),
            }
          : w
      )
    );
  }

  function onPointerUp(e: React.PointerEvent) {
    if (dragRef.current && e.pointerId === dragRef.current.pointerId) {
      dragRef.current = null;
    }
    if (resizeRef.current && e.pointerId === resizeRef.current.pointerId) {
      resizeRef.current = null;
    }
  }

  // Resize handling
  type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
  const resizeRef = useRef<{
    id: string;
    pointerId: number;
    edge: ResizeEdge;
    startWidth: number;
    startHeight: number;
    startClientX: number;
    startClientY: number;
    startTopLeftX: number;
    startTopLeftY: number;
    scaleAtStart: number;
  } | null>(null);
  const windowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  function onResizeStart(
    e: React.PointerEvent,
    id: string,
    windowEl: HTMLDivElement,
    edge: ResizeEdge
  ) {
    const container = containerRef.current;
    if (!container) return;
    const isMobileContainer =
      container.getBoundingClientRect().width < mobileBreakpoint;
    if (isMobileContainer) return;
    focusWindow(id);
    setHasUserAdjustedLayout(true);
    const cRect = container.getBoundingClientRect();
    const wRect = windowEl.getBoundingClientRect();
    const win = winStates.find((w) => w.id === id);
    const scaleAtStart = win?.scale ?? 1;
    const topLeftX = wRect.left - cRect.left;
    const topLeftY = wRect.top - cRect.top;
    resizeRef.current = {
      id,
      pointerId: e.pointerId,
      edge,
      startWidth: wRect.width,
      startHeight: wRect.height,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startTopLeftX: topLeftX,
      startTopLeftY: topLeftY,
      scaleAtStart,
    };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onResizeMove(e: React.PointerEvent) {
    if (!resizeRef.current) return;
    const {
      id,
      pointerId,
      edge,
      startWidth,
      startHeight,
      startClientX,
      startClientY,
      startTopLeftX,
      startTopLeftY,
      scaleAtStart,
    } = resizeRef.current;
    if (e.pointerId !== pointerId) return;
    const container = containerRef.current;
    if (!container) return;
    const targetWin = winStates.find((w) => w.id === id);
    const effectiveMinWidth =
      targetWin && targetWin.frameless ? 0 : MIN_WIDTH;
    const isWidthFlexible = targetWin ? targetWin.isWidthFlexible : false;
    const isHeightFlexible = targetWin ? targetWin.isHeightFlexible : false;
    const scale =
      scaleAtStart || (targetWin ? (targetWin.scale ?? 1) : 1);
    const cRect = container.getBoundingClientRect();
    const pad = Math.max(0, innerPaddingPx);
    const innerLeft = pad;
    const innerTop = pad;
    const innerRight = Math.max(innerLeft, cRect.width - pad);
    const innerBottom = Math.max(innerTop, cRect.height - pad);
    const dx = e.clientX - startClientX;
    const dy = e.clientY - startClientY;
    const isMobileContainer = cRect.width < mobileBreakpoint;
    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);

    const effectiveMinWidthScaled = effectiveMinWidth * scale;
    const minHeightScaled = MIN_HEIGHT * scale;
    const availableWidth = Math.max(0, innerRight - innerLeft);
    const availableHeight = Math.max(0, innerBottom - innerTop);
    const minAllowedWidth = Math.min(effectiveMinWidthScaled, availableWidth);
    const minAllowedHeight = Math.min(minHeightScaled, availableHeight);

    const hasLeft = edge.includes("w");
    const hasRight = edge.includes("e");
    const hasTop = edge.includes("n");
    const hasBottom = edge.includes("s");

    let newLeft = startTopLeftX;
    let newRight = startTopLeftX + startWidth;
    let newTop = startTopLeftY;
    let newBottom = startTopLeftY + startHeight;

    if (hasLeft) newLeft = startTopLeftX + dx;
    if (hasRight) newRight = startTopLeftX + startWidth + dx;
    if (hasTop) newTop = startTopLeftY + dy;
    if (hasBottom) newBottom = startTopLeftY + startHeight + dy;

    let newWidth = newRight - newLeft;
    let newHeight = newBottom - newTop;

    const clampWidth = (width: number) =>
      clamp(width, minAllowedWidth, availableWidth);
    const clampHeight = (height: number) =>
      clamp(height, minAllowedHeight, availableHeight);

    if (hasLeft && !hasRight) {
      newWidth = clampWidth(startWidth - dx);
      const maxLeft = innerRight - newWidth;
      newLeft = clamp(newLeft, innerLeft, maxLeft);
      newRight = newLeft + newWidth;
    } else if (hasRight && !hasLeft) {
      newWidth = clampWidth(startWidth + dx);
      const minRight = innerLeft + newWidth;
      newRight = clamp(newRight, minRight, innerRight);
      newLeft = newRight - newWidth;
    } else {
      newWidth = clampWidth(newWidth);
      const currentCenterX = (newLeft + newRight) / 2;
      const minCenterX = innerLeft + newWidth / 2;
      const maxCenterX = innerRight - newWidth / 2;
      const clampedCenterX = clamp(currentCenterX, minCenterX, maxCenterX);
      newLeft = clampedCenterX - newWidth / 2;
      newRight = clampedCenterX + newWidth / 2;
    }

    if (hasTop && !hasBottom) {
      newHeight = clampHeight(startHeight - dy);
      const maxTop = innerBottom - newHeight;
      newTop = clamp(newTop, innerTop, maxTop);
      newBottom = newTop + newHeight;
    } else if (hasBottom && !hasTop) {
      newHeight = clampHeight(startHeight + dy);
      const minBottom = innerTop + newHeight;
      newBottom = clamp(newBottom, minBottom, innerBottom);
      newTop = newBottom - newHeight;
    } else {
      newHeight = clampHeight(newHeight);
      const currentCenterY = (newTop + newBottom) / 2;
      const minCenterY = innerTop + newHeight / 2;
      const maxCenterY = innerBottom - newHeight / 2;
      const clampedCenterY = clamp(currentCenterY, minCenterY, maxCenterY);
      newTop = clampedCenterY - newHeight / 2;
      newBottom = clampedCenterY + newHeight / 2;
    }

    newWidth = Math.max(0, newRight - newLeft);
    newHeight = Math.max(0, newBottom - newTop);

    const centerX = newLeft + newWidth / 2;
    const centerY = newTop + newHeight / 2;
    const xPercent = (centerX / cRect.width) * 100;
    const yPercent = (centerY / cRect.height) * 100;

    const unscaledWidth = newWidth / Math.max(scale, Number.EPSILON);
    const unscaledHeight = newHeight / Math.max(scale, Number.EPSILON);

    setWinStates((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              widthPx: unscaledWidth,
              heightPx: unscaledHeight,
              baseWidthPx: isWidthFlexible ? unscaledWidth : w.baseWidthPx,
              baseHeightPx: isHeightFlexible
                ? unscaledHeight
                : w.baseHeightPx,
              xPercent,
              yPercent,
              ...(isMobileContainer
                ? {}
                : { originalXPercent: xPercent, originalYPercent: yPercent }),
            }
          : w
      )
    );
  }

  const prevContainerWidthRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    windowRefs.current.forEach((node) => {
      if (!node) return;
      const contentNode = node.querySelector(
        "[data-demo-desktop-content]"
      ) as HTMLElement | null;
      if (disableInteractions) contentNode?.setAttribute("inert", "");
      else contentNode?.removeAttribute("inert");
    });
  }, [disableInteractions, windowIdKey]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const cRect = el.getBoundingClientRect();
    const pad = Math.max(0, innerPaddingPx);
    const cWidth = cRect.width;
    const cHeight = cRect.height;
    const innerWidth = Math.max(0, cWidth - 2 * pad);
    const innerHeight = Math.max(0, cHeight - 2 * pad);

    const wasMobile =
      prevContainerWidthRef.current !== null &&
      prevContainerWidthRef.current < mobileBreakpoint;
    const isNowMobile = cWidth < mobileBreakpoint;
    const switchingToDesktop = wasMobile && !isNowMobile;
    prevContainerWidthRef.current = cWidth;

    if (cWidth < mobileBreakpoint && !hasAppliedMobileLayout) {
      setHasAppliedMobileLayout(true);
    }

    setWinStates((prev) =>
      prev.map((w) => {
        let width = w.widthPx;
        let height = w.heightPx;

        if (w.isWidthFlexible) {
          width = Math.min(w.baseWidthPx, innerWidth);
          if (!w.frameless) width = Math.max(MIN_WIDTH, width);
        } else {
          if (!w.frameless) width = Math.max(width, MIN_WIDTH);
        }

        if (w.isHeightFlexible) {
          height = Math.max(MIN_HEIGHT, Math.min(w.baseHeightPx, innerHeight));
        } else {
          height = Math.max(MIN_HEIGHT, Math.min(height, innerHeight));
        }

        let centerX: number;
        let centerY: number;

        if (switchingToDesktop) {
          centerX = (w.originalXPercent / 100) * cWidth;
          centerY = (w.originalYPercent / 100) * cHeight;
        } else {
          centerX = (w.xPercent / 100) * cWidth;
          centerY = (w.yPercent / 100) * cHeight;
        }

        let clampedX = centerX;
        let clampedY = centerY;

        const scale = w.scale ?? 1;
        const windowScaledWidth = width * scale;
        const windowScaledHeight = height * scale;
        const fitsHorizontally = windowScaledWidth + 2 * pad <= cWidth;
        const fitsVertically = windowScaledHeight + 2 * pad <= cHeight;

        if (w.allowOverflow) {
          clampedX = centerX;
        } else if (fitsHorizontally) {
          const minX = pad + windowScaledWidth / 2;
          const maxX = cWidth - pad - windowScaledWidth / 2;
          clampedX = Math.max(minX, Math.min(maxX, centerX));
        } else {
          clampedX = pad + windowScaledWidth / 2;
        }

        if (isNowMobile && w.mobileXOffset !== 0) {
          clampedX += w.mobileXOffset;
        }

        if (w.allowOverflow) {
          clampedY = centerY;
        } else if (fitsVertically) {
          const minY = pad + windowScaledHeight / 2;
          const maxY = cHeight - pad - windowScaledHeight / 2;
          clampedY = Math.max(minY, Math.min(maxY, centerY));
        } else {
          const minY = pad + windowScaledHeight / 2;
          const maxY = cHeight - pad - windowScaledHeight / 2;
          clampedY = Math.max(minY, Math.min(maxY, centerY));
        }

        return {
          ...w,
          widthPx: width,
          heightPx: height,
          xPercent: (clampedX / cWidth) * 100,
          yPercent: (clampedY / cHeight) * 100,
        };
      })
    );
  }, [
    containerSize.width,
    containerSize.height,
    innerPaddingPx,
    hasUserAdjustedLayout,
    hasAppliedMobileLayout,
    mobileBreakpoint,
  ]);

  const resetWindowLayout = () => {
    setWinStates(baseWindows);
    setHasUserAdjustedLayout(false);
    setResetVersion((v) => v + 1);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={
        disableInteractions
          ? undefined
          : (e) => {
              if (dragRef.current) onPointerMove(e);
              else if (resizeRef.current && !disableResizing) onResizeMove(e);
            }
      }
      onPointerUp={disableInteractions ? undefined : onPointerUp}
      className={`no-drag-img relative w-full overflow-hidden select-none rounded-[4px] border border-[var(--color-theme-border-02)] ${className ?? ""}`}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        ...(typeof minHeight !== "undefined"
          ? {
              minHeight:
                typeof minHeight === "number" ? `${minHeight}px` : minHeight,
            }
          : {}),
      }}
    >
      {/* Wallpaper layer */}
      {backgroundImage?.src && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={backgroundImage.src}
            alt={backgroundImage.alt || ""}
            fill
            className="absolute inset-0 object-cover"
            priority={Boolean(preload)}
          />
        </div>
      )}

      {/* Windows layer */}
      <div
        className="absolute top-0 right-0 bottom-0 left-0 z-10 h-full w-full max-[767px]:pointer-events-none max-[767px]:opacity-0"
        style={{
          opacity:
            containerSize.width > 0 && containerSize.width < mobileBreakpoint
              ? hasAppliedMobileLayout
                ? 1
                : 0
              : undefined,
        }}
      >
        {winStates.map((win, idx) => {
          const scale = win.scale ?? 1;
          const isActive = activeWindowId === win.id;
          const isMobile =
            containerSize.width > 0 &&
            containerSize.width < mobileBreakpoint;
          const shouldDelayEntrance =
            animateEntrance &&
            hasEnteredViewport &&
            !entrancePlayedRef.current.has(win.id);
          const delaySeconds = shouldDelayEntrance
            ? idx * entranceStagger
            : 0;

          const pad = Math.max(0, innerPaddingPx);
          const halfScaledW = (win.widthPx * scale) / 2;
          const halfScaledH = (win.heightPx * scale) / 2;

          return (
            <Fragment key={win.id}>
              <motion.div
                aria-hidden="true"
                id={`demo-window-${win.id}`}
                ref={(node) => {
                  if (!node) {
                    windowRefs.current.delete(win.id);
                    return;
                  }
                  windowRefs.current.set(win.id, node);
                }}
                className={`group absolute overflow-hidden rounded-[10px] ${
                  win.hideOnMobile
                    ? "hidden lg:flex lg:flex-col"
                    : "flex flex-col"
                } ${
                  win.frameless
                    ? "bg-[var(--color-theme-product-editor)]"
                    : "bg-[var(--color-theme-product-chrome)] select-none"
                }`}
                style={{
                  left: win.allowOverflow
                    ? `${win.xPercent}%`
                    : `clamp(${pad + halfScaledW}px, ${win.xPercent}%, calc(100% - ${pad + halfScaledW}px))`,
                  top: win.allowOverflow
                    ? `${win.yPercent}%`
                    : `clamp(${pad + halfScaledH}px, ${win.yPercent}%, calc(100% - ${pad + halfScaledH}px))`,
                  width: `${win.widthPx}px`,
                  maxWidth: win.isWidthFlexible
                    ? `calc(100% - ${2 * pad}px)`
                    : undefined,
                  minWidth: win.frameless ? undefined : `${MIN_WIDTH}px`,
                  height: `${win.heightPx}px`,
                  maxHeight: `calc(100% - ${2 * pad}px)`,
                  minHeight: `${MIN_HEIGHT}px`,
                  transform: !animateEntrance
                    ? `translate(-50%, -50%) scale(${scale})`
                    : undefined,
                  transformOrigin: "center center",
                  zIndex: win.zIndex,
                  boxShadow: win.frameless
                    ? ""
                    : win.shadowless
                      ? "0 0 0 1px var(--color-theme-border-02)"
                      : "0 28px 70px rgba(0, 0, 0, 0.14), 0 14px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px var(--color-theme-border-02)",
                }}
                onPointerDown={(e) => {
                  if (!disableInteractions) {
                    focusWindow(win.id);
                    if (win.frameless) {
                      const target = e.target as Element;
                      if (
                        !disableResizing &&
                        target?.closest?.("[data-resize-handle]")
                      )
                        return;
                      if (!target?.closest?.("[data-drag-handle]")) return;
                      const el = document.getElementById(
                        `demo-window-${win.id}`
                      ) as HTMLDivElement | null;
                      if (el)
                        onDragStart(
                          e as unknown as React.PointerEvent,
                          win.id,
                          el
                        );
                    }
                  }
                }}
                initial={
                  animateEntrance
                    ? { opacity: 0, scale: 0.98 * scale }
                    : undefined
                }
                animate={
                  animateEntrance
                    ? hasEnteredViewport
                      ? { opacity: 1, scale: scale }
                      : { opacity: 0, scale: 0.98 * scale }
                    : undefined
                }
                transition={
                  animateEntrance
                    ? {
                        duration: 0.14,
                        ease: "easeOut",
                        delay: delaySeconds,
                      }
                    : undefined
                }
                transformTemplate={
                  animateEntrance
                    ? (_transform, generated) =>
                        `translate(-50%, -50%) ${generated}`
                    : undefined
                }
                onAnimationComplete={() => {
                  if (shouldDelayEntrance) {
                    entrancePlayedRef.current.add(win.id);
                    setEntranceVersion((n) => n + 1);
                  }
                }}
              >
                {/* Title bar */}
                {win.frameless ? null : (
                  <div
                    className={`relative flex h-7 items-center justify-between border-b border-[var(--color-theme-border-02)] px-2 ${
                      isMobile ? "cursor-default" : ""
                    }`}
                    onPointerDown={(e) => {
                      if (disableInteractions) return;
                      const el = document.getElementById(
                        `demo-window-${win.id}`
                      ) as HTMLDivElement | null;
                      if (el) onDragStart(e, win.id, el);
                    }}
                    onDoubleClick={(e) => {
                      if (disableInteractions) return;
                      e.stopPropagation();
                      resetWindowLayout();
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: isActive
                              ? "var(--color-theme-fg-20)"
                              : "var(--color-theme-border-02)",
                          }}
                        />
                      ))}
                    </div>
                    {win.title && (
                      <div
                        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 truncate text-center opacity-70"
                        style={{ fontSize: "12px" }}
                      >
                        {win.title}
                      </div>
                    )}
                    <div className="-mr-1 flex items-center">
                      {win.ctaHref && win.ctaLabel && !isMobile ? (
                        <button
                          type="button"
                          className="cursor-pointer rounded px-2 py-1 text-[var(--color-theme-text-sec)] opacity-0 transition-opacity duration-200 hover:bg-[var(--color-theme-bg-hover)] group-hover:opacity-100"
                          style={{ fontSize: "12px" }}
                          disabled={disableInteractions}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (win.ctaHref) {
                              if (win.ctaHref.startsWith("http")) {
                                window.open(
                                  win.ctaHref,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                              } else {
                                window.location.href = win.ctaHref;
                              }
                            }
                          }}
                        >
                          {win.ctaLabel}
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div
                  className={`min-h-0 w-full flex-1 overflow-hidden ${
                    disableInteractions ? "pointer-events-none" : ""
                  }`}
                  data-demo-desktop-content
                >
                  <div
                    key={`${resetVersion}-${win.id}`}
                    className="h-full min-h-0 w-full"
                  >
                    {win.content}
                  </div>
                </div>

                {/* Resize handles */}
                {!disableInteractions && !disableResizing && (
                  <>
                    {(
                      [
                        {
                          edge: "n" as ResizeEdge,
                          cls: "absolute inset-x-2 top-0 h-2 cursor-ns-resize",
                        },
                        {
                          edge: "s" as ResizeEdge,
                          cls: "absolute inset-x-2 bottom-0 h-2 cursor-ns-resize",
                        },
                        {
                          edge: "e" as ResizeEdge,
                          cls: "absolute inset-y-2 right-0 w-1 cursor-ew-resize",
                        },
                        {
                          edge: "w" as ResizeEdge,
                          cls: "absolute inset-y-2 left-0 w-1 cursor-ew-resize",
                        },
                        {
                          edge: "nw" as ResizeEdge,
                          cls: "absolute top-0 left-0 h-2.5 w-2.5 cursor-nwse-resize",
                        },
                        {
                          edge: "ne" as ResizeEdge,
                          cls: "absolute top-0 right-0 h-2.5 w-2.5 cursor-nesw-resize",
                        },
                        {
                          edge: "sw" as ResizeEdge,
                          cls: "absolute bottom-0 left-0 h-2.5 w-2.5 cursor-nesw-resize",
                        },
                        {
                          edge: "se" as ResizeEdge,
                          cls: "absolute right-0 bottom-0 h-2.5 w-2.5 cursor-nwse-resize",
                        },
                      ] as const
                    ).map(({ edge, cls }) => (
                      <div
                        key={edge}
                        className={cls}
                        data-resize-handle
                        onPointerDown={(e) => {
                          const el = document.getElementById(
                            `demo-window-${win.id}`
                          ) as HTMLDivElement | null;
                          if (el) onResizeStart(e, win.id, el, edge);
                        }}
                      />
                    ))}
                  </>
                )}
              </motion.div>
            </Fragment>
          );
        })}
      </div>

      {/* Reset button */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <AnimatePresence>
          {hasUserAdjustedLayout && !disableInteractions ? (
            <motion.button
              key="demo-desktop-reset"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              onClick={(e) => {
                e.stopPropagation();
                resetWindowLayout();
              }}
              className="pointer-events-auto inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--color-theme-border-01)] bg-[var(--color-theme-card-hex)] text-[var(--color-theme-text-sec)] shadow-sm hover:bg-[var(--color-theme-bg-hover)]"
              aria-label="Reset layout"
              title="Reset"
              style={{
                position: "absolute",
                right: Math.max(0, innerPaddingPx),
                bottom: Math.max(0, innerPaddingPx),
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 256 256"
                fill="currentColor"
              >
                <path d="M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11.8-10.8A80,80,0,1,0,71.43,71.39L43.31,96H80a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V84.69L60.69,60A96,96,0,0,1,224,128Z" />
              </svg>
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
