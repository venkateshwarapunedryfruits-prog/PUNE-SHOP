"use client";

type Props = {
  checked: boolean;
  onChange?: (value: boolean) => void;
  name?: string;
  disabled?: boolean;
  label: string;
  tone?: "forest" | "gold";
};

/** Accessible on/off switch. With `name`, it also submits "on" inside a form. */
export function Switch({ checked, onChange, name, disabled, label, tone = "forest" }: Props) {
  const on = tone === "gold" ? "bg-gold" : "bg-forest";
  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? on : "bg-line"
        }`}
      >
        <span
          className={`inline-block size-5 rounded-full bg-paper shadow transition-transform duration-200 ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
      {name && checked && <input type="hidden" name={name} value="on" />}
    </>
  );
}
