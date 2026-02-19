import React, {useEffect, useRef, useState} from 'react';
import {Box} from '@mui/material';
import 'mathlive';
import {getInterpretedValue} from "../../MathHelper/LineEquationValidator.tsx";

interface MathInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    width?: number;
    variables?: string[];
}

export const MathInput: React.FC<MathInputProps> = ({ value, onChange, placeholder, width = 380, variables = []}) => {
    const mathfieldRef = useRef<any>(null);
    const [interpretation, setInterpretation] = useState<{ value: string, error: boolean }>({value: "", error: false});

    useEffect(() => {
        if (!mathfieldRef.current) return;
        const mf = mathfieldRef.current;
        mf.menuBar = false;
        mf.smartMode = false;
        mf.virtualKeyboardMode = 'auto';
        const variableRow = variables.length ? variables : [];
        window.mathVirtualKeyboard.layouts = {
            label: 'Custom',
            tooltip: 'Variables and numbers',
            rows: [
                ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', {label: '⌫', command: 'deleteBackward'}],
                variableRow,
                ['+', '-', '[*]', { label: ':', command: ['insert', "\\frac{#@}{#?}", '(', ')'] }, '=', "\\frac{#@}{#?}", '(', ')'],
                [], [], []
            ]
        }
        document.body.style.setProperty('--keycap-height', '32px');
        document.body.style.setProperty('--keycap-font-size', '15px');
        mf.value = value || '';
        const handleInput = () => {
            const latex = mf.getValue('latex-expanded');
            onChange(latex);
        };
        mf.addEventListener('input', handleInput);
        mf.addEventListener('focusin', () => window.mathVirtualKeyboard.show());
        mf.addEventListener('focusout', () => window.mathVirtualKeyboard.hide());
        return () => {
            mf.removeEventListener('input', handleInput);
        };
    }, [onChange, value, variables]);
    useEffect(() => {
        const id = setTimeout(() => {
            if (!value) {
                setInterpretation({value: "", error: false});
                return;
            }
            const result = getInterpretedValue(value);
            setInterpretation(result);
        }, 120);
        return () => clearTimeout(id);
    }, [value]);

    return (
        <Box>
            {/* @ts-ignore */}
            <math-field
                ref={mathfieldRef}
                placeholder={placeholder}
                style={{width, border: '1px solid #ccc', borderRadius: 4, padding: '4px 8px', fontSize: '1rem',}}
                virtual-keyboard-mode="manual"
                virtual-keyboards="custom"
            />
            <Box sx={{mt: 0.5, fontSize: "0.75rem", color: interpretation?.error ? "warning.main" : "text.secondary", transition: "opacity 0.15s ease",}}>
                {interpretation?.value && !interpretation.error && (
                    <>
                        <span>Interpretiert als: </span>
                        {/*// @ts-ignore*/}
                        <math-field read-only
                            value={interpretation.value}
                            style={{ fontSize: "0.85rem", minWidth: 100 }}
                        />
                    </>
                )}
                {interpretation?.error && (
                    <>
                        <span>Bitte einen korrekten Ausdruck eingeben.</span>
                    </>
                )}
            </Box>
        </Box>
    );
};
