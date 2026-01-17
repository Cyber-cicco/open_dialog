import { useEffect, useRef } from "react"
import { useAppForm } from "../../../hooks/form"
import { Button } from "../buttons/base.buttons"
import { ModalProps } from "./types"
import { useCreateProject } from "../../../hooks/queries/projects"
import { useGlobalState } from "../../../context/global-state.context"

export const ProjectCreationModale: React.FC<ModalProps> = ({ onClose, isOpen }) => {

  const nameRef = useRef<HTMLInputElement | null>(null);
  const {openProject} = useGlobalState();
  const projMutation = useCreateProject();
  const form = useAppForm({
    defaultValues: {
      name: ''
    },
    onSubmit:async ({value}) => {
      openProject(await projMutation.mutateAsync(value.name));
      onClose();
    },
  })

  useEffect(() => {
    if (isOpen && nameRef.current) {
      nameRef.current.focus();
    }

  }, [isOpen])

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-base-surface border border-base-500 rounded-lg shadow-2xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-500">
          <h2 className="text-lg font-semibold text-text-primary">Nouveau projet</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1 rounded hover:bg-base-overlay"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form
          className="p-6"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-subtle mb-2">
                Nom du projet
              </label>
              <form.AppField
                name="name"
                
                children={(field) => (
                  <field.TextField inputRef={nameRef} />
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button model="secondary" onClick={onClose}>
              Annuler
            </Button>
            <form.AppForm >
              <form.SubscribeButton label="Créer"></form.SubscribeButton>
            </form.AppForm>
          </div>
        </form>
      </div>
    </div>
  )
}
