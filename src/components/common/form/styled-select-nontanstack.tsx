import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

type Option = {
  value: string
  label: string
}

type StyledSelectProps = {
  value: string | undefined
  onChange: (value: string | undefined) => void
  options: Option[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function StyledSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  className = ""
}: StyledSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)

  const selectedOption = options.find(opt => opt.value === value)
  const displayValue = selectedOption?.label ?? placeholder

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        containerRef.current && 
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      })
    }
  }, [isOpen])

  const dropdown = isOpen && (
    <ul 
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-base-surface border border-highlight-med rounded shadow-lg max-h-40 overflow-auto"
    >
      <li
        className="px-2 py-1 text-sm text-text-muted cursor-pointer hover:bg-highlight-med"
        onClick={() => { onChange(undefined); setIsOpen(false) }}
      >
        {placeholder}
      </li>
      {options.map((option) => (
        <li
          key={option.value}
          onClick={() => { onChange(option.value); setIsOpen(false) }}
          className={`px-2 text-white py-1 text-sm cursor-pointer hover:bg-highlight-med ${option.value === value ? 'bg-highlight-low' : ''}`}
        >
          {option.label}
        </li>
      ))}
    </ul>
  )

  return (
    <div className={`relative min-w-32 ${className}`} ref={containerRef}>
      <div
        role="combobox"
        aria-expanded={isOpen}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(prev => !prev)
          } else if (e.key === 'Escape') {
            setIsOpen(false)
          }
        }}
        className={`
          bg-base-surface text-text-primary px-2 py-1 rounded text-sm cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${!selectedOption ? 'text-text-muted' : ''}
        `}
      >
        <span className="flex items-center justify-between gap-2">
          {displayValue}
          <svg 
            className={`w-3 h-3 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" 
              clipRule="evenodd" 
            />
          </svg>
        </span>
      </div>
      
      {createPortal(dropdown, document.body)}
    </div>
  )
}
