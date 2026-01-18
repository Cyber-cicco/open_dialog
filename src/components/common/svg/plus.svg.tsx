import { SvgProps } from "./main.svg";

export const PlusIcon: React.FC<SvgProps> = ({ width = 24, height = 24, color = "#259591", className, arialabel }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} aria-label={arialabel} height={height} width={width} fill={color} viewBox="0 -960 960 960">
      <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
    </svg>
  );
};
