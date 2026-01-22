Create a form component that handles arrays of text fields. I must be able to delete this field with a button at the right of it. By default, when adding text to an input of the array, it must spawn a new input at end of the array. If the next to last input becomes empty, then it must delete the last input if it is empty. So basically you do not need to press a button to add an option to the string array field. Here is a way I created something similar on another project:

```tsx
import { useEffect, useRef, useState } from 'react'
import { useFieldContext } from '../../hooks/form-context'
import { ChevronDownIcon } from '../svg/ChevronDownIcon'
import { TrashIcon } from '../svg/TrashIcon'
import { Validator } from './types'

export default function ArrayTextField<T>({
  placeholder,
  err,
  idx,
  getValue,
  setValue,
  deletable = true,
  disabled = false,
  toggleAble = false,
  toggleAriaLabel = "",
  onToggle = () => { },
  expanded = false,
  validator = {},
  getDefaultValue,
}: {
  placeholder: string,
  err?: string,
  idx: number,
  getValue: (value: T) => string,
  setValue: (newVal: string) => void,
  deletable?: boolean
  disabled?: boolean
  toggleAble?: boolean
  onToggle?: () => void
  toggleAriaLabel?: string
  expanded?: boolean
  validator?: Validator<string>
  getDefaultValue?: () => T

}) {
  const field = useFieldContext<T[]>()
  const [clientSideError, setClientSideError] = useState<string | undefined>(undefined)
  const value = field.state.value[idx]
  const touched = useRef(!(idx === field.state.value.length - 1))
  useEffect(() => {
    touched.current = !(idx === field.state.value.length - 1)
  }, [field.state.value.length, idx])

  return (
    <div>
      <div className='flex items-center gap-2'>
        <input type="text"
          value={getValue(value)}
          disabled={disabled}
          onChange={(e) => {
            setValue(e.target.value)
            field.setValue(field.state.value)
            if (validator.onChange) {
              setClientSideError(validator.onChange(getValue(field.state.value[idx])));
            }
            if (getValue(value) !== "" && !touched.current && getDefaultValue !== undefined) {
              field.pushValue(getDefaultValue());
              touched.current = true;
            }
          }}
          onBlur={() => {
            if (validator.onBlur) {
              setClientSideError(validator.onBlur(getValue(field.state.value[idx])));
            }
          }}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-primary"
          placeholder={placeholder} />

        {deletable &&
          <button
            type="button"
            onClick={() => {
              const newVals = [...field.state.value];
              newVals.splice(idx, 1);
              field.setValue(newVals);
            }}
            className="text-gray-400 hover:text-red-500"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        }
        {toggleAble &&

          <button
            type="button"
            onClick={onToggle}
            className="p-1 hover:cursor-pointer text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
            aria-label={toggleAriaLabel}
          >
            <ChevronDownIcon
              className={`h-5 w-5 transition-transform ${expanded && 'rotate-180'}`}
            />
          </button>

        }
      </div>
      <div className='text-red-500'>{err ? err : clientSideError}</div>
    </div>
  )
}

```

If you find a cleaner way to do it, than please do. Also I don't want a trash icon, a cross will do the work.
