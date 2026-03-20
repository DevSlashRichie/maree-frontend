export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-12 relative z-10 py-10">
          <div className="flex flex-col items-center justify-center text-center">
            <img
              src="/logo.png"
              alt="MARÉE Logo"
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
