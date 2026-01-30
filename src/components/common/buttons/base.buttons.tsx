// base.buttons.tsx
import { SpinnerIcon } from "../svg/spinner.svg"

const getModelStyles = (disabled: boolean, model: ButtonModel) => {
  if (disabled) {
    return "bg-base-700 text-text-muted cursor-not-allowed"
  }
  switch (model) {
    case "secondary":
      return "text-text-subtle hover:text-text-primary hover:cursor-pointer bg-base-overlay hover:bg-base-500"
    case "danger":
      return "text-white bg-red-900 hover:bg-red-950 hover:cursor-pointer"
    case "primary":
    default:
      return "text-base-primary bg-blue-primary hover:bg-blue-light hover:cursor-pointer"
  }
}

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case "small":
      return "px-3 py-1.5 text-xs"
    case "large":
      return "px-5 py-3 text-base"
    case "base":
    default:
      return "px-4 py-2 text-sm"
  }
}

export type ButtonModel = "primary" | "secondary" | "danger"
export type ButtonSize = "base" | "small" | "large"

type ButtonProps = {
  type?: "submit" | "reset" | "button"
  isDisabled?: boolean
  isLoading?: boolean
  children?: React.ReactNode
  model?: ButtonModel
  size?: ButtonSize
  fullWidth?: boolean
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({
  type = "button",
  isDisabled = false,
  isLoading = false,
  children,
  model = "primary",
  size = "base",
  fullWidth = false,
  onClick,
}) => {
  const spinnerSize = size === "small" ? "h-3 w-3" : size === "large" ? "h-5 w-5" : "h-4 w-4"

  return (
    <button
      type={type}
      className={`
        flex items-center justify-center gap-2
        ${getSizeStyles(size)} 
        ${fullWidth && 'w-full'}
        font-medium rounded-sm 
        transition-colors
        outline-none focus-visible:ring-2 focus-visible:ring-blue-deep/50 focus-visible:ring-offset-2 focus-visible:ring-offset-base-surface
        ${getModelStyles(isDisabled, model)}
      `}
      disabled={isDisabled || isLoading}
      onClick={onClick}
    >
      {isLoading && (
        <SpinnerIcon className={`animate-spin ${spinnerSize}`} />
      )}
      {children}
    </button>
  )
}
