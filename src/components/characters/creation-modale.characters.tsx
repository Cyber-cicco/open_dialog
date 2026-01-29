import { TinyModaleWrapper } from "../common/modal/modal-wrapper"
import { ModalProps } from "../common/modal/types"
import { useAutoFocusRef } from "../../hooks/useAutofocusRef"
import { useCreateCharacter } from "../../hooks/queries/character"
import { useAppForm } from "../../hooks/form"
import { useGlobalState } from "../../context/global-state.context"
import { Button } from "../common/buttons/base.buttons"
import { useNavigate } from "react-router-dom"

type CharacterCreationModaleProps = ModalProps & { order: number }

export const CharacterCreationModale: React.FC<CharacterCreationModaleProps> = ({ onClose, isOpen, order }) => {
  const { project } = useGlobalState();
  const ref = useAutoFocusRef(isOpen);
  const navigate = useNavigate();
  const chatMutation = useCreateCharacter();
  const form = useAppForm({
    defaultValues: {
      name: ''
    },
    onSubmit: async ({ value }) => {
      if (!project) {
        return
      }
      const newChar = await chatMutation.mutateAsync({
        projectId: project.id,
        name: value.name,
        order,
      });
      form.reset();
      navigate(`/character/${newChar.id}`);
      onClose();
    },
  })
  return (

    <TinyModaleWrapper onClose={onClose} title="New Character">
      <form
        className="p-6"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}>
        <form.AppField
          name="name"
          children={(field) => (
            <field.TextField
              inputRef={ref}
              label="Name of the new character"
            />
          )}
        />
        <div className="flex justify-end gap-3 mt-8">
          <Button model="secondary" onClick={onClose}>
            Annuler
          </Button>
          <form.AppForm >
            <form.SubscribeButton label="Créer"></form.SubscribeButton>
          </form.AppForm>
        </div>
        {chatMutation.isError && (
          <span className="text-red-500">An error occured</span>
        )}
      </form>
    </TinyModaleWrapper>
  )
}
