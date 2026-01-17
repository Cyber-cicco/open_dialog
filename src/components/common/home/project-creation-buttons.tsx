import { Button } from "../buttons/base.buttons"
import { Tooltip } from "../tooltips"

export const ProjectCreationButtons = () => {
  return (
    <div className="flex gap-2 justify-center">
      <Tooltip content="Créer un nouveau projet vide">
        <Button>Créer</Button>
      </Tooltip>
      <Tooltip content="Récupérer un projet sur un serveur (non implémenté)">
        <Button isDisabled model="gray" >Cloner</Button>
      </Tooltip>
    </div>
  )
}
