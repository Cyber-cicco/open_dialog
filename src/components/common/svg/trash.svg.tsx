import { SvgProps } from "./main.svg"

export const TrashSvg: React.FC<SvgProps> = ({ width = 20, height = 20, color = "currentColor", className = "w-4 h-4" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      height={height}
      width={width}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}
