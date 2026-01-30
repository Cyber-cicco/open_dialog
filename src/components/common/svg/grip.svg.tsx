// arrows.svg.tsx (or create grip.svg.tsx)
import { SvgProps } from "./main.svg";

export const GripIcon: React.FC<SvgProps> = ({ width = 20, height = 20, color = "currentColor", className, arialabel }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} aria-label={arialabel} height={height} width={width} fill={color} viewBox="0 0 16 16">
      <circle cx="4" cy="3" r="1.5" />
      <circle cx="12" cy="3" r="1.5" />
      <circle cx="4" cy="8" r="1.5" />
      <circle cx="12" cy="8" r="1.5" />
      <circle cx="4" cy="13" r="1.5" />
      <circle cx="12" cy="13" r="1.5" />
    </svg>
  );
};
