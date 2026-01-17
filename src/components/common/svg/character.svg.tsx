import { SvgProps } from "./main.svg"

export const CharacterSvg: React.FC<SvgProps> = ({ width = 20, height = 20, color = "currentColor", className = "" }) => {
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
      aria-label="Character"
      role="img"
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a8.5 8.5 0 0 1 13 0" />
    </svg>
  )
}
