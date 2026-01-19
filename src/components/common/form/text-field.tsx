import { useState, useCallback, FocusEvent } from 'react'
import { useFieldContext } from '../../../hooks/form'
import { EyeIcon } from '../svg/eye.svg'
import { FieldSize } from './types'

type TextFieldProps = {
  label?: string
  placeholder?: string
  mode?: FieldSize
  type?: "text" | "password"
  err?: string
  required?: boolean
  onBlur?: (e:FocusEvent<HTMLInputElement, Element>) => void
  inputRef?: React.RefObject<HTMLInputElement | null>
}

const getInputStyles = (mode: FieldSize, isPassword: boolean) => {
  const base = "w-full bg-base-overlay text-text-primary placeholder:text-text-muted focus:outline-none focus:bg-highlight-low transition-colors duration-150"
  const pr = isPassword ? "pr-10" : ""

  switch (mode) {
    case "small":
      return `${base} px-2 py-1 text-sm ${pr}`
    case "large":
      return `${base} px-4 py-3 text-lg ${pr}`
    default:
      return `${base} px-3 py-2 ${pr}`
  }
}

const getLabelStyles = (mode: FieldSize) => {
  const base = "block text-text-subtle mb-1"
  switch (mode) {
    case "small":
      return `${base} text-xs`
    case "large":
      return `${base} text-base`
    default:
      return `${base} text-sm`
  }
}

const getIconSize = (mode: FieldSize) => {
  switch (mode) {
    case "small": return 16
    case "large": return 28
    default: return 20
  }
}

export default function TextField({ label, placeholder, mode = "normal", type = "text", required = false, err, inputRef, onBlur }: TextFieldProps) {
  const field = useFieldContext<string>()
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  const inputType = isPassword ? (showPassword ? "text" : "password") : type

  return (
    <div className='space-y-4'>
      {label && (
        <label className={getLabelStyles(mode)}>
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          ref={inputRef}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={(e) => {
            field.handleBlur();
            onBlur?.(e);
          }}
          className={getInputStyles(mode, isPassword)}
          placeholder={placeholder}
          required={required}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-2 top-1/2 -translate-y-1/2 hover:cursor-pointer p-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon
              width={getIconSize(mode)}
              height={getIconSize(mode)}
              color={showPassword ? "#9ccfd8" : "#6e6a86"}
            />
          </button>
        )}
      </div>
      <div className={`text-red-400 ${mode === "small" ? "text-xs" : mode === "large" ? "text-base" : "text-sm"}`}>
        {err ? err : field.state.meta.isDirty && field.state.meta.errors.join(', ')}
      </div>
    </div>
  )
}
