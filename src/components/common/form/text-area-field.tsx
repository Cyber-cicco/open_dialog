import { FocusEvent } from 'react'
import { useFieldContext } from '../../../hooks/form'
import { FieldSize } from './types'

type TextAreaFieldProps = {
  label?: string
  placeholder?: string
  mode?: FieldSize
  rows?: number
  fillContainer?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  err?: string
  required?: boolean
  onBlur?: (e: FocusEvent<HTMLTextAreaElement, Element>) => void
  inputRef?: React.RefObject<HTMLTextAreaElement | null>
}

const getTextAreaStyles = (mode: FieldSize, resize: string, fillContainer: boolean) => {
  const base = "w-full bg-base-overlay text-text-primary placeholder:text-text-muted focus:outline-none focus:bg-highlight-low border border-base-600 focus:border-blue-deep rounded transition-colors duration-150"

  const resizeClass = fillContainer ? 'resize-none' : {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  }[resize]

  const fillClass = fillContainer ? 'h-full min-h-0' : ''

  switch (mode) {
    case "small":
      return `${base} px-2 py-1.5 text-sm ${resizeClass} ${fillClass}`
    case "large":
      return `${base} px-4 py-3 text-lg ${resizeClass} ${fillClass}`
    default:
      return `${base} px-3 py-2 ${resizeClass} ${fillClass}`
  }
}

const getLabelStyles = (mode: FieldSize) => {
  const base = "block text-text-subtle mb-1 flex-shrink-0"
  switch (mode) {
    case "small":
      return `${base} text-xs`
    case "large":
      return `${base} text-base`
    default:
      return `${base} text-sm`
  }
}

const getDefaultRows = (mode: FieldSize) => {
  switch (mode) {
    case "small": return 3
    case "large": return 8
    default: return 5
  }
}

export default function TextAreaField({
  label,
  placeholder,
  mode = "normal",
  rows,
  fillContainer = false,
  resize = "vertical",
  required = false,
  onBlur,
  err,
  inputRef
}: TextAreaFieldProps) {
  const field = useFieldContext<string>()
  const effectiveRows = fillContainer ? undefined : (rows ?? getDefaultRows(mode))

  const wrapperClass = fillContainer
    ? 'flex flex-col h-full min-h-0'
    : 'space-y-1'

  return (
    <div className={wrapperClass}>
      {label && (
        <label className={getLabelStyles(mode)}>
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <textarea
        ref={inputRef}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={(e) => {
          field.handleBlur();
          onBlur?.(e);
        }}
        className={getTextAreaStyles(mode, resize, fillContainer)}
        placeholder={placeholder}
        required={required}
        rows={effectiveRows}
      />
      {(err || (field.state.meta.isDirty && field.state.meta.errors.length > 0)) && (
        <div className={`text-red-400 flex-shrink-0 ${mode === "small" ? "text-xs" : mode === "large" ? "text-base" : "text-sm"}`}>
          {err ? err : field.state.meta.errors.join(', ')}
        </div>
      )}
    </div>
  )
}
