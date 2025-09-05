import React, { useRef, useEffect } from "react";
import "mathlive";

interface MathFieldProps {
    value: string;
    onChange: (value: string) => void;
    style?: React.CSSProperties;
}

const MathField: React.FC<MathFieldProps> = ({ value, onChange, style }) => {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        const el = ref.current as any; // math-field element
        el.value = value;

        const handleInput = (evt: any) => onChange(evt.target.value);
        el.addEventListener("input", handleInput);

        return () => el.removeEventListener("input", handleInput);
    }, [value, onChange]);
    {/* @ts-ignore */}
    return <math-field ref={ref} style={style} />;
};

export default MathField;
