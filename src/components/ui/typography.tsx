interface TextProps {
  children: React.ReactNode;
  className?: string;
}

export const Heading = ({ children, className = "" }: TextProps) => (
  <h1 className={`font-display text-[4rem] tracking-[0.1em] uppercase leading-none ${className}`}>
    {children}
  </h1>
);

export const Subheading = ({ children, className = "" }: TextProps) => (
  <h2 className={`font-display text-3xl font-bold tracking-widest uppercase ${className}`}>
    {children}
  </h2>
);

export const Paragraph = ({ children, className = "" }: TextProps) => (
  <p className={`font-body text-sm font-light leading-relaxed tracking-wide ${className}`}>
    {children}
  </p>
);

