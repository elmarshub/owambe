export function Busy({ label }: { label: string }) {
  return <><span className="spin" aria-hidden="true" />{label}</>;
}
