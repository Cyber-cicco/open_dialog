// select-field.tsx
import { useState, useRef, useEffect } from 'react'
import { useFieldContext } from '../../../hooks/form'
import { FieldSize } from './types'

type SelectOption = {
  value: string
  label: string
}

type SelectFieldProps = {
  label?: string
  options: SelectOption[]
  placeholder?: string
  mode?: FieldSize
  required?: boolean
  disabled?: boolean
}

const getSelectStyles = (mode: FieldSize) => {
  const base = "w-full bg-base-overlay/60 text-text-primary focus:outline-none focus:bg-highlight-low transition-colors duration-150 cursor-pointer"
  
  switch (mode) {
    case "small":
      return `${base} px-2 py-1 text-sm pr-8`
    case "large":
      return `${base} px-4 py-3 text-lg pr-10`
    default:
      return `${base} px-3 py-2 pr-9`
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
    case "small": return "w-3 h-3"
    case "large": return "w-5 h-5"
    default: return "w-4 h-4"
  }
}

const getIconPosition = (mode: FieldSize) => {
  switch (mode) {
    case "small": return "right-2"
    case "large": return "right-4"
    default: return "right-3"
  }
}

const getOptionStyles = (mode: FieldSize) => {
  const base = "cursor-pointer text-text-primary hover:bg-highlight-med transition-colors"
  switch (mode) {
    case "small":
      return `${base} px-2 py-1 text-sm`
    case "large":
      return `${base} px-4 py-3 text-lg`
    default:
      return `${base} px-3 py-2`
  }
}

export default function SelectField({ 
  label, 
  options, 
  placeholder, 
  mode = "normal", 
  required = false,
  disabled = false 
}: SelectFieldProps) {
  const field = useFieldContext<string>()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === field.state.value)
  const displayValue = selectedOption?.label ?? placeholder ?? ''

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (value: string) => {
    field.handleChange(value)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(prev => !prev)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="space-y-1" ref={containerRef}>
      {label && (
        <label className={getLabelStyles(mode)}>
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="relative">
        <div
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setIsOpen(prev => !prev)}
          onKeyDown={handleKeyDown}
          onBlur={field.handleBlur}
          className={`${getSelectStyles(mode)} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${!selectedOption ? 'text-text-muted' : ''}`}
        >
          {displayValue}
        </div>
        <div className={`absolute ${getIconPosition(mode)} top-1/2 -translate-y-1/2 pointer-events-none text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg 
            className={getIconSize(mode)} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        
        {isOpen && (
          <ul
            role="listbox"
            className="absolute z-50 w-full mt-1 bg-base-surface border border-highlight-med rounded shadow-lg max-h-60 overflow-auto"
          >
            {placeholder && (
              <li
                className={`${getOptionStyles(mode)} text-text-muted`}
                onClick={() => handleSelect('')}
              >
                {placeholder}
              </li>
            )}
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === field.state.value}
                onClick={() => handleSelect(option.value)}
                className={`${getOptionStyles(mode)} ${option.value === field.state.value ? 'bg-highlight-low' : ''}`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {field.state.meta.isDirty && field.state.meta.errors.length > 0 && (
        <div className={`text-red-400 ${mode === "small" ? "text-xs" : mode === "large" ? "text-base" : "text-sm"}`}>
          {field.state.meta.errors.join(', ')}
        </div>
      )}
    </div>
  )
}
