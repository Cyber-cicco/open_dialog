import { createFormHook } from '@tanstack/react-form'
import { createFormHookContexts } from '@tanstack/react-form'
import { Button, ButtonModel, ButtonSize } from '../components/common/buttons/base.buttons';
import TextField from '../components/common/form/text-field';

export const { fieldContext, useFieldContext, formContext, useFormContext } = createFormHookContexts();

function SubscribeButton({ label, model = "base", size = "long" }: { label: string, model?: ButtonModel, size? : ButtonSize }) {
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
    TextField
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})

