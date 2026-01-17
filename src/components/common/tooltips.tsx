import { useState, useRef, useEffect, ReactNode } from "react"
import { createPortal } from "react-dom"

type TooltipPosition = "top" | "bottom" | "left" | "right"

type TooltipProps = {
  content: ReactNode
  children: ReactNode
  delay?: number
  preferredPosition?: TooltipPosition
}

type Coords = { x: number; y: number; position: TooltipPosition }

const OFFSET = 8
const TOOLTIP_MARGIN = 4

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  delay = 300,
  preferredPosition = "bottom",
}) => {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState<Coords | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<number | null>(null)

  const calculatePosition = (): Coords | null => {
    if (!triggerRef.current) return null

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipWidth = tooltipRef.current?.offsetWidth ?? 120
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 32

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    const centerX = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2
    const centerY = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2

    const positions: Record<TooltipPosition, { x: number; y: number }> = {
      bottom: {
        x: centerX,
        y: triggerRect.bottom + OFFSET,
      },
      top: {
        x: centerX,
        y: triggerRect.top - tooltipHeight - OFFSET,
      },
      right: {
        x: triggerRect.right + OFFSET,
        y: centerY,
      },
      left: {
        x: triggerRect.left - tooltipWidth - OFFSET,
        y: centerY,
      },
    }

    const fits = (pos: TooltipPosition): boolean => {
      const { x, y } = positions[pos]
      return (
        x >= TOOLTIP_MARGIN &&
        x + tooltipWidth <= viewport.width - TOOLTIP_MARGIN &&
        y >= TOOLTIP_MARGIN &&
        y + tooltipHeight <= viewport.height - TOOLTIP_MARGIN
      )
    }

    const fallbackOrder: TooltipPosition[] = ["bottom", "top", "right", "left"]
    const preferred = fits(preferredPosition)
      ? preferredPosition
      : fallbackOrder.find(fits) ?? "bottom"

    let { x, y } = positions[preferred]

    // Clamp to viewport
    x = Math.max(TOOLTIP_MARGIN, Math.min(x, viewport.width - tooltipWidth - TOOLTIP_MARGIN))
    y = Math.max(TOOLTIP_MARGIN, Math.min(y, viewport.height - tooltipHeight - TOOLTIP_MARGIN))

    return { x, y, position: preferred }
  }

  const showTooltip = () => {
    timeoutRef.current = window.setTimeout(() => {
      setVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setVisible(false)
    setCoords(null)
  }

  useEffect(() => {
    if (visible) {
      // Defer calculation to next frame so tooltip is rendered
      requestAnimationFrame(() => {
        setCoords(calculatePosition())
      })
    }
  }, [visible])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className="fixed z-50 px-2 py-1 text-sm rounded bg-base-overlay text-text-primary border border-highlight-med shadow-lg whitespace-nowrap pointer-events-none transition-opacity duration-150"
            style={{
              left: coords?.x ?? -9999,
              top: coords?.y ?? -9999,
              opacity: coords ? 1 : 0,
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  )
}
