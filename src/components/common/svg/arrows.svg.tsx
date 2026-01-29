import { SvgProps } from "./main.svg";

export const ArrowUpIcon: React.FC<SvgProps> = ({ width = 20, height = 20, color = "currentColor", className, arialabel }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} aria-label={arialabel} height={height} width={width} fill={color} viewBox="0 -960 960 960">
      <path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z" />
    </svg>
  );
};

export const ArrowDownIcon: React.FC<SvgProps> = ({ width = 20, height = 20, color = "currentColor", className, arialabel }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} aria-label={arialabel} height={height} width={width} fill={color} viewBox="0 -960 960 960">
      <path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z" />
    </svg>
  );
};
