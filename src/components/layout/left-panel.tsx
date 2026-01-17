import { useState } from "react";
import { CharacterSvg } from "../common/svg/character.svg";
import { DialogSvg } from "../common/svg/dialog.svg";
import { VariablesSvg } from "../common/svg/variables.svg";
import { CommitsSvg } from "../common/svg/commits.svg";
import { BranchesSvg } from "../common/svg/branches.svg";
import { Tooltip } from "../common/tooltips";
import { LeaveIcon } from "../common/svg/leave.svg";
import { useGlobalState } from "../../context/global-state.context";

type LeftPanelOpt = {
  name: string
  icon: React.ReactNode
  hover: string
}

const opts: LeftPanelOpt[] = [
  {
    name: 'Dialogs',
    icon: <DialogSvg width={25} height={25} color="#ffffff" />,
    hover: "Create the dialogs of your characters",
  },
  {
    name: 'Characters',
    icon: <CharacterSvg width={25} height={25} color="#ffffff" />,
    hover: "Create your characters",
  },
  {
    name: 'Variables',
    icon: <VariablesSvg width={25} height={25} color="#ffffff" />,
    hover: "Create global variables for all dialogs",
  },
  {
    name: 'Versions',
    icon: <CommitsSvg width={25} height={25} color="#ffffff" />,
    hover: "Go back to previous versions",
  },
  {
    name: 'Branches',
    icon: <BranchesSvg width={25} height={25} color="#ffffff" />,
    hover: "Check the work of other writers on this project"
  },
];

const leaveOpt: LeftPanelOpt = {
  name: 'Leave',
  icon: <LeaveIcon width={25} height={25} color="#ffffff" />,
  hover: "Save and go back to the project list"
}

const LayoutLeftPanel = () => {
  const [optionSelected, setOptionSelected] = useState<number | null>(null);
  const [panelOpened, setPanelOpened] = useState(!!optionSelected);
  const  {closeProject} = useGlobalState();

  return (
    <div className="flex w-full h-full">
      <div className="w-12 rounded-r-sm h-full p-2 bg-base-primary flex flex-col gap-1">
        {opts.map((opt, i) => (
          <Tooltip content={opt.hover}>
            <button
              aria-label={opt.hover}
              key={opt.name}
              role="button"
              className={`p-1 rounded hover:cursor-pointer transition-colors duration-150
              ${optionSelected === i && panelOpened
                  ? 'bg-highlight-high'
                  : 'hover:bg-highlight-med'
                }`}
              onClick={() => {
                if (i === optionSelected) {
                  setPanelOpened(!panelOpened);
                } else if (!panelOpened) {
                  setPanelOpened(true)
                }
                setOptionSelected(i);
              }}
            >
              {opt.icon}
            </button>
          </Tooltip>
        ))}
        <div className="grow"></div>
        <Tooltip content={leaveOpt.hover}>
            <button
              aria-label={leaveOpt.hover}
              key={leaveOpt.name}
              role="button"
              className='p-1 rounded hover:cursor-pointer transition-colors duration-150 hover:bg-highlight-med'
              onClick={closeProject}
            >
              {leaveOpt.icon}
            </button>

        </Tooltip>

      </div>
      <div
        className={`left-panel-content h-full bg-base-surface text-white -translate-x-1 ${panelOpened ? 'open' : 'closed'}`}
      >
        <div className="w-[200px] pl-4 pr-2">
          bonjour
        </div>
      </div>
    </div>
  )
}

export default LayoutLeftPanel;
