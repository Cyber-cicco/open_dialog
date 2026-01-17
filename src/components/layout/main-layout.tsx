import { PropsWithChildren } from "react"
import { Header } from "./header"
import LayoutLeftPanel from "./left-panel"

export const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="h-screen flex flex-col">
      <Header/>
      <div className="w-full flex-1 overflow-hidden">
        <LayoutLeftPanel/>
        {children}
      </div>
    </div>
  )
}
