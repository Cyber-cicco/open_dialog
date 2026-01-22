// src/components/common/form/array-text-field.tsx
import { useFieldContext } from '../../../hooks/form'
import { FieldSize } from './types'

type ArrayTextFieldProps = {
  label?: string
  placeholder?: string
  mode?: FieldSize
}

const getInputStyles = (mode: FieldSize) => {
  const base = "flex-1 bg-base-overlay/60 text-text-primary placeholder:text-text-muted focus:outline-none focus:bg-highlight-low transition-colors duration-150"
  switch (mode) {
    case "small": return `${base} px-2 py-1 text-sm`
    case "large": return `${base} px-4 py-3 text-lg`
    default: return `${base} px-3 py-2`
  }
}

const getLabelStyles = (mode: FieldSize) => {
  const base = "block text-text-subtle mb-1"
  switch (mode) {
    case "small": return `${base} text-xs`
    case "large": return `${base} text-base`
    default: return `${base} text-sm`
  }
}

export default function ArrayTextField({ label, placeholder, mode = "normal" }: ArrayTextFieldProps) {
  const field = useFieldContext<string[]>()
  const values = field.state.value

  const handleChange = (idx: number, newValue: string) => {
    const updated = [...values]
    updated[idx] = newValue
    
    const isLast = idx === values.length - 1
    const isSecondToLast = idx === values.length - 2
    
    // Auto-add: typing in last empty field spawns new one
    if (isLast && newValue !== '' && values[idx] === '') {
      updated.push('')
    }
    
    // Auto-remove: if second-to-last becomes empty and last is empty, remove last
    if (isSecondToLast && newValue === '' && values[values.length - 1] === '') {
      updated.pop()
    }
    
    field.setValue(updated)
  }

  const handleDelete = (idx: number) => {
    const updated = values.filter((_, i) => i !== idx)
    // Ensure at least one empty field remains
    if (updated.length === 0 || updated[updated.length - 1] !== '') {
      updated.push('')
    }
    field.setValue(updated)
  }

  return (
    <div className="space-y-2">
      {label && <label className={getLabelStyles(mode)}>{label}</label>}
      {values.map((value, idx) => {
        const isLastEmpty = idx === values.length - 1 && value === ''
        return (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(idx, e.target.value)}
              className={getInputStyles(mode)}
              placeholder={placeholder}
            />
            {!isLastEmpty && (
              <button
                type="button"
                onClick={() => handleDelete(idx)}
                className="p-1 text-text-muted hover:text-red-400 transition-colors"
                aria-label="Remove"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
