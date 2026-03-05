import { useState, cloneElement, Children } from "react";
import type { ReactElement } from "react";
import type { RadioButtonProps } from "./radio-button";

type RadioGroupProps = {
    children:
        ReactElement<RadioButtonProps>[];
};

export function RadioGroup({ children }: RadioGroupProps) {
    const [selected, setSelected] = useState<{
        selected: boolean
    }[]>(children.map(() => ({
        selected: false
    })));

    return (
        <div className="flex gap-3">
            {Children.map(children, (child, k) =>
                cloneElement(child, {
                selected: selected[k].selected,
                onChange: () => {
                    setSelected((prev) => {
                        const cl = [...prev];
                        for (let i = 0; i < cl.length; i++) {
                            cl[i].selected = false;
                        }
                        cl[k].selected = true;
                        return cl;
                    })
                }            
            })
            )}
        </div>
    );
}