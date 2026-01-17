import { SvgProps } from "./main.svg"

export const VariablesSvg: React.FC<SvgProps> = ({ width = 20, height = 20, color = "currentColor", className = "" }) => {
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
      aria-label="Variables"
      role="img"
    >
      <path d="M4 7h6m4 0h6M4 12h16M4 17h6m4 0h6" />
    </svg>
  )
}
