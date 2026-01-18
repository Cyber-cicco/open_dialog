import { useEffect, useRef, useState } from "react"
import { Button } from "../common/buttons/base.buttons"
import { TinyModaleWrapper } from "../common/modal/modal-wrapper"
import { ModalProps } from "../common/modal/types"
import { useAutoFocusRef } from "../../hooks/useAutofocusRef"

export const CharacterMenu = () => {
  const [modalVisible, setModaleVisible] = useState(false)
  return (
    <div className="flex h-full flex-col w-full">
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex">
          <Button
            fullWidth
            onClick={() => {
              setModaleVisible(true);
            }}>New Character</Button>
        </div>
      </div>
      {modalVisible &&
        <CharacterCreationModale isOpen={modalVisible} onClose={() => {
          setModaleVisible(false);
        }} />
      }
    </div>
  )
}

export const CharacterCreationModale: React.FC<ModalProps> = ({ onClose, isOpen }) => {
  const ref = useAutoFocusRef(isOpen);
  return (

    <TinyModaleWrapper onClose={onClose} title="New Character">
    </TinyModaleWrapper>
  )
}
