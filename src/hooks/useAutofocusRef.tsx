import { useEffect, useRef } from "react";

export const useAutoFocusRef = (isOpen:boolean) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }

  }, [isOpen])
  return inputRef
}
