import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import 'mathlive';

interface MathInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    width?: number;
}

export const MathInput: React.FC<MathInputProps> = ({ value, onChange, placeholder, width = 380 }) => {
    const mathfieldRef = useRef<any>(null);

    useEffect(() => {
        if (!mathfieldRef.current) return;

        const mf = mathfieldRef.current;

        mf.menuBar = false;
        mf.smartMode = false;
        mf.virtualKeyboardMode = 'manual';

        window.mathVirtualKeyboard.layouts = {
            label: 'Custom',
            tooltip: 'Variables and numbers',
            rows: [
                ['a', 'b', 'c', 'x', 'y', 'z', '\\alpha', '\\beta', '\\gamma'],
                ['+', '-', '[*]', '[/]', '=', '\\sqrt{#0}', '#@^{#?}', '(', ')']
            ]
        };

        document.body.style.setProperty('--keycap-height', '32px');
        document.body.style.setProperty('--keycap-font-size', '15px');

        mf.value = value || '';

        const handleInput = () => {
            const latex = mf.getValue('latex');
            onChange(latex);
        };

        mf.addEventListener('input', handleInput);
        mf.addEventListener('focusin', () => window.mathVirtualKeyboard.show());
        mf.addEventListener('focusout', () => window.mathVirtualKeyboard.hide());

        return () => {
            mf.removeEventListener('input', handleInput);
        };
    }, [mathfieldRef.current]);

    return (
        <Box>
            {/* @ts-ignore */}
            <math-field
                ref={mathfieldRef}
                placeholder={placeholder}
                style={{
                    width,
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    padding: '4px 8px',
                    fontSize: '1rem',
                }}
                virtual-keyboard-mode="manual"
                virtual-keyboards="custom"
            />
        </Box>
    );
};
