import cn from "classnames";

export type RadioButtonProps = {
    value: string;
    children: React.ReactNode;
    selected?: boolean;
    onChange?: (value: string) => void;
};

export function RadioButton({
    value,
    selected,
    onChange,
    children,
}: RadioButtonProps) {
    
    return (
        <label
            className={cn(
                "inline-flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-colors",
                {
                    "bg-gray-200": !selected,
                    "bg-blue-100": selected,
                }
            )}
        >

        <input
            type="radio"
            value={value}
            checked={selected}
            onChange={() => onChange?.(value)}
            className="hidden"
        />

        <div
            className={cn(
            "w-5 h-5 rounded-full border-2 transition-colors",
            {
                "bg-blue-500 border-blue-500": selected,
                "bg-gray-300 border-gray-400": !selected,
            }
            )}
        />

        <span className="text-sm font-medium">
            {children}
        </span>
    </label>
    );
}