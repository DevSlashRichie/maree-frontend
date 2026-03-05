import { IconButton } from '../ui/icon-button'

export function Header() {

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-md border-b border-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 watermark-bg">
        <div className="flex justify-between items-center h-32 relative z-10">
          
          {/* Lado Izquierdo: Botón Dark Mode (Solo Desktop) */}

          {/* Centro: Logo y Slogan */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center w-full lg:w-1/3 text-center">
            <h1 className="font-display text-[4rem] tracking-[0.1em] text-[#423f3e] dark:text-white uppercase font-normal leading-none">
              MARÉE
            </h1>
            <div className="flex items-center justify-center space-x-3 mt-1 w-full max-w-[280px]">
              <span className="h-[1px] w-8 bg-[#423f3e] dark:bg-gray-400 relative before:content-[''] before:absolute before:w-[1px] before:h-2 before:bg-[#423f3e] before:dark:bg-gray-400 before:-top-1 before:left-0"></span>
              <p className="text-[11px] uppercase tracking-[0.25em] font-light text-[#423f3e] dark:text-gray-300 flex items-center space-x-1">
                <span>LOVE AT FIRST</span> 
                <span className="text-pink-logo font-medium tracking-[0.25em]">CRÊPE</span>
              </p>
              <span className="h-[1px] w-8 bg-[#423f3e] dark:bg-gray-400 relative before:content-[''] before:absolute before:w-[1px] before:h-2 before:bg-[#423f3e] before:dark:bg-gray-400 before:-top-1 before:right-0"></span>
            </div>
          </div>

          {/* Lado Derecho: Carrito */}
          <div className="flex items-center justify-end space-x-4 w-1/3">
            <IconButton icon="shopping_bag" badge />
          </div>

        </div>
      </div>
    </header>
  )
}