import { useProjetCreationModal } from "../../../context/project-creation-modal.context"
import { Button } from "../buttons/base.buttons"
import { Tooltip } from "../tooltips"

export const ProjectCreationButtons = () => {
  const {open} = useProjetCreationModal()
  return (
    <div className="flex gap-2 justify-center">
      <Tooltip content="Créer un nouveau projet vide">
        <Button onClick={() => {
          open();
        }}>New</Button>
      </Tooltip>
      <Tooltip content="Récupérer un projet sur un ordinateur distant (non implémenté)">
        <Button isDisabled model="secondary" >Clone</Button>
      </Tooltip>
    </div>
  )
}
