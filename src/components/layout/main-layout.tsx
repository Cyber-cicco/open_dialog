import { PropsWithChildren } from "react"
import { Header } from "./header"
import LayoutLeftPanel from "./left-panel"

export const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="h-screen flex bg-base-primary flex-col">
      <Header />
      <div className="w-full flex flex-1 overflow-hidden">
        <LayoutLeftPanel />
        <div className="flex m-1 rounded-lg ring-blue-deep ring-2 flex-1 text-white justify-center items-center bg-base-primary">
          {children}
        </div>
      </div>
    </div>
  )
}
