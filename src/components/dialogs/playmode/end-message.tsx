export const EndMessage = ({ onRestart }: { onRestart: () => void }) => (
  <div className="p-3 rounded border border-base-700 bg-base-500 text-center">
    <div className="text-text-subtle mb-3">End of dialog</div>
    <button
      onClick={onRestart}
      className="py-2 px-4 bg-blue-deep hover:bg-blue-700 text-text-primary rounded transition-colors text-sm"
    >
      Restart
    </button>
  </div>
);

