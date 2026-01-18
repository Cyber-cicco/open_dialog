import { DialogSvg } from "../components/common/svg/dialog.svg"
import { CharacterSvg } from "../components/common/svg/character.svg"
import { VariablesSvg } from "../components/common/svg/variables.svg"
import { CommitsSvg } from "../components/common/svg/commits.svg"
import { BranchesSvg } from "../components/common/svg/branches.svg"

export const ProjectPage = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background gradient - same as character page */}
      <div className="absolute inset-0 bg-gradient-to-br from-base-400 to-base-200" />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center h-full overflow-y-auto py-12 px-8">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-lobster text-blue-primary mb-2 text-center">
            Welcome to your project
          </h1>
          <p className="text-text-subtle mb-10 text-center">
            Start by creating characters or dialogs from the left panel.
          </p>

          <div className="flex justify-center gap-6 mb-12">
            <Hint 
              icon={<CharacterSvg width={32} height={32} color="#9ccfd8" />}
              label="Characters"
              description="Define who speaks"
            />
            <Hint 
              icon={<DialogSvg width={32} height={32} color="#9ccfd8" />}
              label="Dialogs"
              description="Write conversations"
            />
          </div>

          <div className="bg-base-surface rounded-lg p-6">
            <h2 className="text-lg font-medium text-text-primary mb-4">Getting Started</h2>
            
            <div className="space-y-4">
              <TutorialStep 
                step={1}
                icon={<CharacterSvg width={20} height={20} color="#9ccfd8" />}
                title="Create your characters"
                description="Open the Characters panel and add the people who will speak in your dialogues. Give them names, artworks and avatars."
              />
              
              <TutorialStep 
                step={2}
                icon={<DialogSvg width={20} height={20} color="#9ccfd8" />}
                title="Write your first dialogue"
                description="Create a dialogue and start adding nodes. Connect them to build conversation flows. Add choices to let players decide where the story goes."
              />
              
              <TutorialStep 
                step={3}
                icon={<VariablesSvg width={20} height={20} color="#9ccfd8" />}
                title="Add variables for branching"
                description="Create global boolean variables to track player decisions and game state. Use them in conditions to unlock different dialogue paths."
              />
              
              <TutorialStep 
                step={4}
                icon={<CommitsSvg width={20} height={20} color="#9ccfd8" />}
                title="Save your progress"
                description="Your work is versioned. Press the 'Commit' button to save snapshots you can return to at anytime. Never lose any work, return to older versions without any problems."
              />
              
              <TutorialStep 
                step={5}
                icon={<BranchesSvg width={20} height={20} color="#9ccfd8" />}
                title="Experiment with branches"
                description="Create branches to collaborate on different parts of the story with other writers. Merge them back when you're all happy with the result."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Hint = ({ icon, label, description }: { 
  icon: React.ReactNode
  label: string
  description: string 
}) => (
  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-base-surface/50">
    {icon}
    <span className="text-text-primary text-sm font-medium">{label}</span>
    <span className="text-text-muted text-xs">{description}</span>
  </div>
)

const TutorialStep = ({ step, icon, title, description }: {
  step: number
  icon: React.ReactNode
  title: string
  description: string
}) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-deep/30 flex items-center justify-center text-blue-primary text-sm font-medium">
      {step}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-text-primary text-sm font-medium">{title}</span>
      </div>
      <p className="text-text-muted text-sm leading-relaxed">{description}</p>
    </div>
  </div>
)
