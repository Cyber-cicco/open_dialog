import { useAppForm } from "../../../hooks/form"
import { Button } from "../buttons/base.buttons"
import { ModalProps } from "./types"
import { useCreateProject } from "../../../hooks/queries/projects"
import { useGlobalState } from "../../../context/global-state.context"
import { TinyModaleWrapper } from "./modal-wrapper"
import { useAutoFocusRef } from "../../../hooks/useAutofocusRef"

export const ProjectCreationModale: React.FC<ModalProps> = ({ onClose, isOpen }) => {

  const nameRef = useAutoFocusRef(isOpen);
  const { openProject } = useGlobalState();
  const projMutation = useCreateProject();
  const form = useAppForm({
    defaultValues: {
      name: ''
    },
    onSubmit: async ({ value }) => {
      openProject(await projMutation.mutateAsync(value.name));
      onClose();
    },
  })

  return (

    <TinyModaleWrapper title="New project" onClose={onClose}>
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
            <form.AppField
              name="name"
              children={(field) => (
                <field.TextField label="Name of the project" inputRef={nameRef} />
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
    </TinyModaleWrapper>
  )
}
