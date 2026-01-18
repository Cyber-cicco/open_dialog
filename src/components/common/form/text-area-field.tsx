// src/components/common/form/text-area-field.tsx
import { useFieldContext } from '../../../hooks/form'
import { FieldSize } from './types'

type TextAreaFieldProps = {
  label?: string
  placeholder?: string
  mode?: FieldSize
  rows?: number
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  err?: string
  required?: boolean
  inputRef?: React.RefObject<HTMLTextAreaElement | null>
}

const getTextAreaStyles = (mode: FieldSize, resize: string) => {
  const base = "w-full bg-base-overlay text-text-primary placeholder:text-text-muted focus:outline-none focus:bg-highlight-low border border-base-600 focus:border-blue-deep rounded transition-colors duration-150"
  
  const resizeClass = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  }[resize]

  switch (mode) {
    case "small":
      return `${base} px-2 py-1.5 text-sm ${resizeClass}`
    case "large":
      return `${base} px-4 py-3 text-lg ${resizeClass}`
    default:
      return `${base} px-3 py-2 ${resizeClass}`
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
  resize = "vertical",
  required = false, 
  err, 
  inputRef 
}: TextAreaFieldProps) {
  const field = useFieldContext<string>()
  const effectiveRows = rows ?? getDefaultRows(mode)

  return (
    <div className='space-y-4'>
      {label && (
        <label className={getLabelStyles(mode)}>
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <textarea
        ref={inputRef}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        className={getTextAreaStyles(mode, resize)}
        placeholder={placeholder}
        required={required}
        rows={effectiveRows}
      />
      <div className={`text-red-400 ${mode === "small" ? "text-xs" : mode === "large" ? "text-base" : "text-sm"}`}>
        {err ? err : field.state.meta.isDirty && field.state.meta.errors.join(', ')}
      </div>
    </div>
  )
}
