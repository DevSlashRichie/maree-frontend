import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { X } from "lucide-react";
import { Fragment, type ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  afterClose?: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Modal({
  isOpen,
  onClose,
  afterClose,
  title,
  description,
  children,
  maxWidth = "sm",
}: ModalProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  const handleOnClose = () => {
    onClose?.();
    if (afterClose) {
      setTimeout(() => {
        afterClose();
      }, 350);
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleOnClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className={`w-full ${maxWidthClasses[maxWidth]} transform overflow-hidden rounded-2xl bg-white dark:bg-charcoal p-8 text-left align-middle shadow-2xl transition-all`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    {title && (
                      <DialogTitle
                        as="h3"
                        className="font-display text-xl text-charcoal dark:text-white"
                      >
                        {title}
                      </DialogTitle>
                    )}
                    {description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors p-1"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
