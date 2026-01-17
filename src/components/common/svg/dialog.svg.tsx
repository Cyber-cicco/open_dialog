import { SvgProps } from "./main.svg"

export const DialogSvg: React.FC<SvgProps> = ({ width = 20, height = 20, color = "currentColor", className = "" }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      viewBox="0 0 24 24"
      width={width}
      fill="none"
      stroke={color}
      strokeWidth={2}
      aria-label="Dialog"
      role="img"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
