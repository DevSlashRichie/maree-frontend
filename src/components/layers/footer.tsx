export function Footer() {
  return (
    <footer className="bg-white py-16 border-t border-pink-soft/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          
          {/* Columna 1: Branding */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="font-display text-3xl tracking-[0.2em] text-text-main uppercase">
              MARÉE
            </h2>
            <p className="text-[10px] uppercase tracking-[0.25em] font-light mt-2 text-text-main/60">
              Love at first <span className="text-pink-logo font-medium">crêpe</span>
            </p>
            <p className="mt-6 text-xs font-body text-text-main/70 leading-relaxed max-w-xs italic">
              Auténtica receta francesa, elaborada con ingredientes locales y mucho amor en cada capa.
            </p>
          </div>

        </div>

        {/* Línea de Copyright */}
        <div className="mt-16 pt-8 border-t border-pink-soft/20 text-center">
          <p className="text-[9px] uppercase tracking-[0.3em] font-light text-text-main/40">
            © 2026 MARÉE. HECHO CON PASIÓN.
          </p>
        </div>
      </div>
    </footer>
  );
}