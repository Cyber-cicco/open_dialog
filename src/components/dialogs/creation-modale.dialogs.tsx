import { TinyModaleWrapper } from "../common/modal/modal-wrapper"
import { ModalProps } from "../common/modal/types"
import { useAutoFocusRef } from "../../hooks/useAutofocusRef"
import { useCreateDialog } from "../../hooks/queries/dialogs"
import { useAppForm } from "../../hooks/form"
import { useGlobalState } from "../../context/global-state.context"
import { Button } from "../common/buttons/base.buttons"

export const DialogCreationModale: React.FC<ModalProps> = ({ onClose, isOpen }) => {

  const { project } = useGlobalState();
  const ref = useAutoFocusRef(isOpen);
  const createMutation = useCreateDialog();

  const form = useAppForm({
    defaultValues: {
      name: '',
      mainCharacterId: '',
    },
    onSubmit: async ({ value }) => {
      if (!project) return;

      await createMutation.mutateAsync({
        projectId: project.id,
        form: {
          name: value.name,
          main_char_id: value.mainCharacterId,
        },
      });
      form.reset();
      onClose();
    },
  });

  return (
    <TinyModaleWrapper onClose={onClose} title="New Dialog">
      <form
        className="p-6"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.AppField
          name="name"
          children={(field) => (
            <field.TextField
              inputRef={ref}
              label="Dialog name"
            />
          )}
        />

        <form.AppField
          name="mainCharacterId"
          children={(field) => (
            <field.CharacterSearchField label="Main interlocutor" />
          )}
        />

        <div className="flex justify-end gap-3 mt-8">
          <Button model="secondary" onClick={onClose}>
            Cancel
          </Button>
          <form.AppForm>
            <form.SubscribeButton label="Create" />
          </form.AppForm>
        </div>

        {createMutation.isError && (
          <span className="text-red-500 mt-2 block">An error occurred</span>
        )}
      </form>
    </TinyModaleWrapper>
  );
};
