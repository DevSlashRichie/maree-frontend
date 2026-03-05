interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'category' | 'action';
  children: React.ReactNode;
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseStyles = "transition-all duration-300 uppercase tracking-[0.2em] text-sm font-medium";
  
  const variants = {
    primary: "px-8 py-3 rounded-full bg-accent text-white border border-pink-soft shadow-[0_0_15px_rgba(232,213,213,0.5)] hover:scale-105",
    category: "px-8 py-3 rounded-full bg-secondary/40 text-text-main hover:bg-pink-soft/40",
    action: "w-full py-3 bg-secondary/30 text-text-main hover:bg-pink-powder hover:text-accent border border-pink-soft/50 text-xs font-bold"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}