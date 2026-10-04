"use client";

interface Props<T extends string> {
  label: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (v: T) => void;
}

/** A pill-shaped segmented control (On hanger / On dummy, Front / Back, build, height). */
export function Segment<T extends string>({ label, value, options, onChange }: Props<T>) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" className="segbtn" aria-pressed={v === value} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}
