import { createContext, useContext, useCallback, useEffect, useId, useRef, PropsWithChildren } from 'react'

export enum KEYMAP_PRIO {
  GLOBAL = 0,
  PANEL = 1,
  MODAL = 2,
  DROPDOWN = 3,
  CONTEXT_MENU = 4,
}

type KeyHandler = () => boolean | void // return true = consumed

type KeymapContextType = {
  register: (id: string, key: string, handler: KeyHandler, priority: number) => void
  unregister: (id: string, key: string) => void
}

const KeymapContext = createContext<KeymapContextType | null>(null)

function formatKey(e: KeyboardEvent): string {
  const parts: string[] = []
  if (e.ctrlKey || e.metaKey) parts.push('Ctrl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')
  parts.push(e.key)
  return parts.join('+')
}

export function KeymapProvider({ children }: PropsWithChildren) {
  const entriesRef = useRef<Map<string, Array<{ id: string; handler: KeyHandler; priority: number }>>>(new Map())

  const register = useCallback((id: string, key: string, handler: KeyHandler, priority: number) => {
    const list = entriesRef.current.get(key) ?? []
    list.push({ id, handler, priority })
    list.sort((a, b) => b.priority - a.priority)
    entriesRef.current.set(key, list)
  }, [])

  const unregister = useCallback((id: string, key: string) => {
    const list = entriesRef.current.get(key)?.filter(e => e.id !== id) ?? []
    if (list.length) entriesRef.current.set(key, list)
    else entriesRef.current.delete(key)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = formatKey(e)
      const handlers = entriesRef.current.get(key)
      if (!handlers?.length) return

      for (const { handler } of handlers) {
        const result = handler()
        if (result !== false) {
          e.preventDefault()
          e.stopPropagation()
          return
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [])

  return (
    <KeymapContext.Provider value={{ register, unregister }}>
      {children}
    </KeymapContext.Provider>
  )
}

// The core hook
export function useKeyBinding(
  key: string,
  handler: KeyHandler,
  options: { enabled?: boolean; priority?: number } = {}
) {
  const { enabled = true, priority = 0 } = options;
  const ctx = useContext(KeymapContext);
  if (!ctx) throw new Error('useKeyBinding requires KeymapProvider');

  const id = useId();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return
    const stableHandler = () => handlerRef.current();
    ctx.register(id, key, stableHandler, priority);
    return () => ctx.unregister(id, key)
  }, [enabled, key, priority, id, ctx]);
}

// Convenience for multiple bindings
export function useKeybindings(
  bindings: Record<string, KeyHandler>,
  options: { enabled?: boolean; priority?: number } = {}
) {
  const { enabled = true, priority = 0 } = options
  const ctx = useContext(KeymapContext)
  if (!ctx) throw new Error('useKeybindings requires KeymapProvider')

  const id = useId()
  const bindingsRef = useRef(bindings)
  bindingsRef.current = bindings

  useEffect(() => {
    if (!enabled) return

    const keys = Object.keys(bindingsRef.current)
    keys.forEach(key => {
      ctx.register(`${id}-${key}`, key, () => bindingsRef.current[key](), priority)
    })
    return () => keys.forEach(key => ctx.unregister(`${id}-${key}`, key))
  }, [enabled, priority, id, ctx])
}
