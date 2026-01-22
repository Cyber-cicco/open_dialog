import { useGlobalState } from "../../context/global-state.context";
import { useAppForm } from "../../hooks/form"
import { LocalVariable } from "../../hooks/useVariables"
import { Button } from "../common/buttons/base.buttons";
import { TinyModaleWrapper } from "../common/modal/modal-wrapper"
import { ModalProps } from "../common/modal/types"

type VariableModalProps = ModalProps & { variable?: LocalVariable | undefined };

export const VariableModal: React.FC<VariableModalProps> = ({ onClose, variable = undefined }) => {
  const { addGlobalVariable } = useGlobalState();
  const form = useAppForm({
    defaultValues: {
      name: variable?.name || '',
      potential_states: variable?.potential_states || ['True', 'False', ''],
    },
    onSubmit: async ({ value }) => {
      try {
        value = {
          ...value,
          potential_states: value.potential_states.filter(x => x !== ''),
        }
        if (value.potential_states.length === 0) {
          throw new Error("cannot create a variable without states")
        }
        await addGlobalVariable({
          id: crypto.randomUUID(),
          name: value.name,
          current_state: value.potential_states[0],
          potential_states: value.potential_states,
        })

      } catch (e) {
        console.error(e);
      }
    },
  });

  return (
    <TinyModaleWrapper title="New variable" onClose={onClose}>
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
          children={(field) =>
            <field.TextField label="Variable name" />
          } />
        <form.AppField
          name="potential_states"
          children={(field) =>
            <field.ArrayTextField label="Possible states" />
          }
        />
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
