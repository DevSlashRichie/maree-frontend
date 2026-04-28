import PhoneInputFromLib from "react-phone-number-input";
import "react-phone-number-input/style.css";
import type { E164Number } from "libphonenumber-js";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  className?: string;
  labelClassName?: string;
}

export function PhoneInput({
  value,
  onChange,
  label,
  error,
  placeholder = "Enter phone number",
  required,
  disabled,
  readOnly,
  id,
  className,
  labelClassName,
}: PhoneInputProps) {
  const inputId = id || "phone-input";

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={
            labelClassName ||
            "font-body text-sm font-light tracking-wide text-text-main/80 uppercase"
          }
        >
          {label}
        </label>
      )}
      <div className="phone-input-container">
        <PhoneInputFromLib
          international
          defaultCountry="MX"
          id={inputId}
          value={value as E164Number}
          onChange={(val) => onChange(val || "")}
          placeholder={placeholder}
          required={required}
          disabled={disabled || readOnly}
          className={
            className ||
            "flex w-full px-6 py-3 rounded-full bg-secondary/30 border border-pink-soft/50 text-text-main font-body text-sm tracking-wide placeholder:text-text-main/40 focus-within:border-accent focus-within:shadow-[0_0_15px_rgba(232,213,213,0.5)] transition-all duration-300"
          }
        />
      </div>
      {error && (
        <span className="font-body text-xs text-red-500 tracking-wide">
          {error}
        </span>
      )}
      <style>{`
        .phone-input-container .PhoneInputInput {
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          color: inherit;
          font-family: inherit;
          font-size: inherit;
          margin-left: 0.5rem;
        }
        .phone-input-container .PhoneInputCountrySelect {
          cursor: pointer;
        }
        .phone-input-container .PhoneInputCountryIcon {
          width: 1.5rem;
          height: auto;
        }
      `}</style>
    </div>
  );
}
