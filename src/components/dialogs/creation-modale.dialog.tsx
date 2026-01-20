// creation-modale.dialog.tsx
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
          main_character: value.mainCharacterId,
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

        {/* TODO: CharacterSearchAutocomplete - will set mainCharacterId */}
        <form.AppField
          name="mainCharacterId"
          children={(field) => (
            <div className="mt-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Main Character
              </label>
              <div className="border border-highlight-300 rounded-md p-3 text-text-muted text-sm bg-base-surface min-h-[42px]">
                [ Character autocomplete placeholder ]
              </div>
              {/* When implemented, pass field.setValue to update mainCharacterId */}
            </div>
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
