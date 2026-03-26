import {
  autoUpdate,
  flip,
  offset,
  type Placement,
  shift,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
} from "@floating-ui/react";
import React, { type ReactNode, useState } from "react";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: Placement;
}

function TooltipContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={line}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

function parseContent(content: ReactNode): ReactNode {
  if (typeof content === "string" && content.includes("\n")) {
    return <TooltipContent content={content} />;
  }
  return content;
}

export function Tooltip({
  content,
  children,
  placement = "top",
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    move: false,
  });

  const focus = useFocus(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
  ]);

  const child = children as React.ReactElement<{
    ref?: React.Ref<HTMLElement>;
    className?: string;
  }>;

  if (child && child.props) {
    return (
      <>
        {React.cloneElement(child, {
          ...child.props,
          ref: refs.setReference,
          className: [child.props.className].filter(Boolean).join(" "),
          ...getReferenceProps(),
        })}
        {isOpen && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-50 max-w-xs px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg"
          >
            {parseContent(content)}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </div>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="z-50 max-w-xs px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg"
        >
          {parseContent(content)}
        </div>
      )}
    </>
  );
}
