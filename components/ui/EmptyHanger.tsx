export function EmptyHanger({ className = "" }: { className?: string }) {
  return (
    <svg className={`empty-hanger ${className}`} viewBox="30 -12 140 66" aria-hidden="true">
      <path d="M100 26 L 100 12 C 100 6 107 4 107 -2 C 107 -8 96 -9 95 -3" fill="none" stroke="#9A7B3A" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M41 48 Q100 18 159 48" fill="none" stroke="#7A5230" strokeWidth="6" strokeLinecap="round" />
      <path d="M43 46 Q100 17 157 46" fill="none" stroke="#C49162" strokeWidth="1.6" strokeLinecap="round" opacity=".9" />
    </svg>
  );
}
