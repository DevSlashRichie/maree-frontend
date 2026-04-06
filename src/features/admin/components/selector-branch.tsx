import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, MapPin, Settings } from "lucide-react";
import { Fragment, useState } from "react";
import { useGetV1Branches } from "@/lib/api";

export interface Branch {
  id: string;
  name: string;
  state: string;
}

export function BranchSelector() {
  const navigate = useNavigate();

  const { data, isLoading } = useGetV1Branches();

  const [selected, setSelected] = useState<Branch | null>(null);

  if (isLoading) {
    return <div>Cargando</div>;
  }

  if (!data || data.status !== 200) {
    return <div>{data?.data.message}</div>;
  }

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <PopoverButton
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm
              font-medium transition-all duration-200 outline-none cursor-pointer
              ${
                open
                  ? "bg-text-main text-white border-text-main"
                  : "bg-transparent text-text-main border-text-main/30 hover:border-text-main"
              }
            `}
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="max-w-[130px] truncate">
              {selected ? selected.name : "Selecciona Sucursal"}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </PopoverButton>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-1 scale-95"
          >
            <PopoverPanel className="absolute right-0 mt-2 w-56 z-50 origin-top-right">
              <div className="rounded-2xl shadow-xl border border-secondary/20 bg-white overflow-hidden">

                <div className="border-b border-secondary/10">
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(null);
                      navigate({ to: "/admin/branches" });
                      close();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer
                      hover:bg-secondary/5 transition-colors duration-150 group"
                  >
                    <div className="w-7 h-7 rounded-full bg-secondary/10 group-hover:bg-secondary/20 flex items-center justify-center shrink-0">
                      <Settings className="w-3.5 h-3.5 text-text-main/50" />
                    </div>
                    <p className="text-sm font-semibold text-text-main/80">
                      Configuración
                    </p>
                  </button>
                </div>

                <div className="px-4 py-3 border-b border-secondary/10">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-text-main/40 font-semibold">
                    Selecciona Sucursal
                  </p>
                </div>

                <div className="py-1">
                  {data.data.length === 0 ? (
                    <div className="px-4 py-3 border-b border-secondary/10">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-text-main/40 font-semibold">
                        No hay sucursales
                      </p>
                    </div>
                  ) : null}

                  {data.data.map((branch: Branch) => {
                    const isSelected = selected?.id === branch.id;

                    return (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => {
                          setSelected(branch);
                          navigate({
                            to: "/admin/branches/$branchId",
                            params: { branchId: branch.id },
                          });
                          close();
                        }}
                        className={`
                          w-full flex items-center justify-between px-4 py-2.5 cursor-pointer
                          transition-colors duration-150
                          ${isSelected ? "bg-secondary/5" : "hover:bg-secondary/5"}
                        `}
                      >
                        <span
                          className={`text-sm font-semibold ${
                            isSelected ? "text-text-main" : "text-text-main/80"
                          }`}
                        >
                          {branch.name}
                        </span>

                        {isSelected && (
                          <Check className="w-4 h-4 text-text-main shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
}