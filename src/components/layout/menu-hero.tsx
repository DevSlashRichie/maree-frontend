export function MenuHero() {
  return (
    <div className="relative w-full h-[350px] lg:h-[450px] overflow-hidden shadow-2xl mb-12 group border border-pink-soft/20">
      <img
        alt="Artesanal Crepe Background"
        className="absolute inset-0 z-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-20"
        src="https://images.unsplash.com/photo-1693857230386-ce2e29512ab0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-background-light/95 via-background-light/60 to-transparent flex flex-col justify-center px-8 sm:px-16 z-10">
        <h2 className="font-display text-5xl lg:text-7xl text-text-main font-normal mb-4 tracking-tight leading-none">
          Nuestro <br />
          <span className="italic font-light">Menú</span>
        </h2>

        <p className="text-text-main/70 text-sm sm:text-base max-w-sm font-body font-light leading-relaxed mb-8">
          ¿Se te antoja algo dulce o salado hoy? Descubre nuestras
          especialidades preparadas al momento.
        </p>
      </div>
    </div>
  );
}
