import { SpinnerIcon } from "../svg/spinner.svg"

const getModelStyles = (disabled: boolean, model: string) => {
  if (disabled) {
    return "bg-base-700 text-text-muted cursor-not-allowed"
  }
  switch (model) {
    case "gray":
      return "bg-gray-400 ring-white text-black hover:bg-gray-500"
    case "empty":
      return "bg-transparent text-blue-primary border border-blue-primary hover:bg-muted-200"
    case "red":
      return "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg"
    case "base":
    default:
      return "bg-blue-deep ring-blue-primary text-text-primary hover:bg-blue-deepest hover:shadow-lg"
  }
}

const getSizeStyles = (size: string) => {
  switch (size) {
    case "small":
      return "px-2 py-1 text-sm"
    case "big":
      return "px-5 py-3 text-lg"
    case "long":
      return "px-8 py-2 w-full"
    case "base":
    default:
      return "px-3 py-2"
  }
}

type ButtonProps = {
  type?: "submit" | "reset" | "button"
  isDisabled?: boolean
  isLoading?: boolean
  children?: React.ReactNode
  model?: "base" | "gray" | "empty" | "red"
  size?: "base" | "long" | "big" | "small"
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({
  type = "button",
  isDisabled = false,
  isLoading = false,
  children = "Créer",
  model = "base",
  size = "base",
  onClick = () => {},
}) => {

  const spinnerSize = size === "small" ? "h-3 w-3" : size === "big" ? "h-5 w-5" : "h-4 w-4"

  return (
    <button
      type={type}
      className={`
        relative flex items-center justify-center gap-2
        ${getSizeStyles(size)} 
        font-medium rounded-sm
        overflow-hidden
        transition-all duration-100
        ${getModelStyles(isDisabled, model)}
        ring-2 focus:outline-none focus:ring-3 focus:ring-opacity-50
        hover:cursor-pointer
      `}
      disabled={isDisabled || isLoading}
      onClick={onClick}
    >
      {isLoading && (
        <SpinnerIcon className={`animate-spin -ml-1 mr-2 ${spinnerSize}`} />
      )}
      {children}
    </button>
  )
}
