import { SvgProps } from "./main.svg"

export const FullscreenSvg: React.FC<SvgProps> = ({ width = 20, height = 20, color = "currentColor", className = "" }) => {
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
      aria-label="Fullscreen"
      role="img"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  )
}
