import { createFormHook } from '@tanstack/react-form'
import { createFormHookContexts } from '@tanstack/react-form'
import { Button, ButtonModel, ButtonSize } from '../components/common/buttons/base.buttons';
import TextField from '../components/common/form/text-field';
import TextAreaField from '../components/common/form/text-area-field';
import { CharacterSearchField } from '../components/common/form/character-search-field';
import ArrayTextField from '../components/common/form/array-text-field';
import SelectField from '../components/common/form/select-field';

export const { fieldContext, useFieldContext, formContext, useFormContext } = createFormHookContexts();

function SubscribeButton({ label, model = "primary", size = "base" }: { label: string, model?: ButtonModel, size? : ButtonSize }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => <Button 
        type='submit' 
        model={model} 
        size={size} 
        isLoading={isSubmitting}
      >{label}</Button>}
    </form.Subscribe>
  )
}

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,
    TextAreaField,
    CharacterSearchField,
    ArrayTextField,
    SelectField,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})

