// src/context/confirmation-modal.context.tsx
import { createContext, useContext, useState, useCallback, PropsWithChildren } from "react"
import { TinyModaleWrapper } from "../components/common/modal/modal-wrapper"
import { Button } from "../components/common/buttons/base.buttons"

type ConfirmationOptions = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "primary"
  onConfirm: () => void | Promise<void>
}

type ConfirmationContextType = {
  openConfirmation: (options: ConfirmationOptions) => void
}

const ConfirmationContext = createContext<ConfirmationContextType | null>(null)

export const useConfirmation = () => {
  const ctx = useContext(ConfirmationContext)
  if (!ctx) throw new Error("useConfirmation must be used within ConfirmationProvider")
  return ctx
}

export const ConfirmationProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [options, setOptions] = useState<ConfirmationOptions | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const openConfirmation = useCallback((opts: ConfirmationOptions) => {
    setOptions(opts)
  }, [])

  const handleClose = () => {
    if (!isLoading) setOptions(null)
  }

  const handleConfirm = async () => {
    if (!options) return
    setIsLoading(true)
    try {
      await options.onConfirm()
      setOptions(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ConfirmationContext.Provider value={{ openConfirmation }}>
      {children}
      {options && (
        <TinyModaleWrapper title={options.title} onClose={handleClose}>
          <div className="p-6">
            <p className="text-white mb-6">{options.message}</p>
            <div className="flex justify-end gap-3">
              <Button model="secondary" onClick={handleClose} isDisabled={isLoading}>
                {options.cancelLabel ?? "Cancel"}
              </Button>
              <Button
                model={options.variant ?? "primary"}
                onClick={handleConfirm}
                isLoading={isLoading}
              >
                {options.confirmLabel ?? "Confirm"}
              </Button>
            </div>
          </div>
        </TinyModaleWrapper>
      )}
    </ConfirmationContext.Provider>
  )
}
