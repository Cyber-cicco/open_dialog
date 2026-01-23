import { SvgProps } from "./main.svg"

export const CrossSvg: React.FC<SvgProps> = ({ width = 20, height = 20, color = "currentColor", className = "w-4 h-4" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      height={height}
      width={width}
      fill="none"
      stroke={color}
      strokeWidth="2"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )

}
