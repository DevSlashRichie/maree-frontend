export function LoyaltyHero() {
  return (
    <div className="relative w-full h-[280px] lg:h-[320px] overflow-hidden shadow-2xl mb-8 group">
      <div
        className="absolute inset-0 z-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1693857230386-ce2e29512ab0?q=80&w=687&auto=format&fit=crop')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-background-light/95 via-background-light/60 to-transparent flex flex-col justify-center px-8 sm:px-16 z-10">
        <div className="text-center">
          <h1 className="font-display text-4xl sm:text-5xl text-charcoal dark:text-white mb-2">
            Mi Tarjeta MARÉE
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-light tracking-wide uppercase text-sm">
            Exclusividad y dulzura en cada visita
          </p>
        </div>
      </div>
    </div>
  );
}
