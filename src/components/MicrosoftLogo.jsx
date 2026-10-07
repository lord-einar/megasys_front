// Logo oficial de Microsoft para el botón de ingreso (única excepción a lucide:
// es marca de terceros, ver docs/context/design-system.md §8b).
export default function MicrosoftLogo() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-white" aria-hidden="true">
      <svg viewBox="0 0 21 21" className="h-4 w-4">
        <rect x="0" y="0" width="10" height="10" fill="#f25022" />
        <rect x="11" y="0" width="10" height="10" fill="#7fba00" />
        <rect x="0" y="11" width="10" height="10" fill="#00a4ef" />
        <rect x="11" y="11" width="10" height="10" fill="#ffb900" />
      </svg>
    </span>
  );
}
