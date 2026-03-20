interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId =
    id || props.name || props.placeholder?.toLowerCase().replace(/\s/g, "-");

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="font-body text-sm font-light tracking-wide text-text-main/80 uppercase"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-6 py-3 rounded-full bg-secondary/30 border border-pink-soft/50 text-text-main font-body text-sm tracking-wide placeholder:text-text-main/40 focus:outline-none focus:border-accent focus:shadow-[0_0_15px_rgba(232,213,213,0.5)] transition-all duration-300 ${className}`}
        {...props}
      />
      {error && (
        <span className="font-body text-xs text-red-500 tracking-wide">
          {error}
        </span>
      )}
    </div>
  );
}
