import {parse, simplify, derivative, type MathNode,} from 'mathjs';
import type { SymbolNode } from 'mathjs';

/**
 * Preprocess MathLive LaTeX → JS expression
 */
function preprocessMathLive(input: string): string {
    let s = input.replace(/\s+/g, '');
    s = s.replace(/\\cdot/g, '*');
    s = s.replace(/\\frac(\d)(\d)/g, '\\frac{$1}{$2}');
    s = s.replace(/\\frac{([^{}]+)}{([^{}]+)}/g, '($1/$2)');
    s = s.replace(/:/g, '/');

    return s;
}

/**
 * Enforce explicit multiplication (reject 3x)
 */
function enforceExplicitMultiplication(input: string): string | null {
    const match = input.match(/\d[a-zA-Z]/);
    if (match) {
        return `Implizite Multiplikation gefunden bei "${match[0]}". Bitte verwende * für Multiplikationen.`;
    }
    return null;
}
/**
 * Normalize a single math input string → simplified string value
 */
export function normalizeMathInput(input: string): { value?: string; error?: string } {
    if (!input || !input.trim()) return { error: "Leerer Ausdruck." };
    const implicitError = enforceExplicitMultiplication(input);
    if (implicitError) return { error: implicitError };

    const s = preprocessMathLive(input);
    try {
        const node: MathNode = parse(s);
        const simplified = simplify(node);
        const symbols = new Set<string>();
        simplified.traverse(n => {
            if (n.type === "SymbolNode") symbols.add((n as any).name);
        });
        if (symbols.size > 0) return { error: "Nur Zahlen erlaubt (keine Variablen)." };

        return { value: simplified.toString() };
    } catch {
        return { error: "Ungültiger mathematischer Ausdruck." };
    }
}

/**
 * Transform existing m/c objects → validated & simplified version
 * Input:
 * { m: [{operator: "=", value: "3*3"}], c: [{operator: "=", value: "4/2"}] }
 */
export function transformLineEquationConditions(val: {
    m?: { operator: string; value: string }[];
    c?: { operator: string; value: string }[];
}) {
    const mRaw = val?.m?.[0]?.value ?? "";
    const cRaw = val?.c?.[0]?.value ?? "";

    const mResult = normalizeMathInput(mRaw);
    if (mResult.error) return { error: `Steigung m: ${mResult.error}` };

    const cResult = normalizeMathInput(cRaw);
    if (cResult.error) return { error: `Achsenabschnitt c: ${cResult.error}` };

    return {
        m: [{ operator: "=", value: mResult.value }],
        c: [{ operator: "=", value: cResult.value }],
    };
}
/**
 * Validate linear equation y = m*x + c
 * using symbolic simplification
 */
export function validateLineEquationMathJS(eq: string): { m?: string; c?: string; error?: string } {
    if (!eq.startsWith('y=')) {
        return { error: 'Gleichung muss mit "y=" beginnen.' };
    }

    const rhs = eq.slice(2);
    const implicitError = enforceExplicitMultiplication(rhs);
    if (implicitError) return { error: implicitError };

    const rhsStr = preprocessMathLive(rhs);
    let node: MathNode;
    try {
        node = parse(rhsStr);
    } catch {
        return { error: 'Ungültiger Ausdruck.' };
    }
    const variables = new Set<string>();
    node.traverse(n => {if (n.type === 'SymbolNode') {variables.add((n as SymbolNode).name);}});


    if (variables.size > 1 || (variables.size === 1 && !variables.has('x'))) {
        return { error: 'Nur die Variable x ist erlaubt.' };
    }
    const simplified = simplify(node);
    const deriv = simplify(derivative(simplified, 'x'));
    let hasX = false;
    deriv.traverse(n => {if (n.type === 'SymbolNode' && (n as SymbolNode).name === 'x') {hasX = true;}});

    if (hasX) {
        return { error: 'Gleichung ist nicht linear.' };
    }
    const m = deriv.toString();
    let c: string | undefined;
    const cValue = simplified.evaluate({ x: 0 });
    if (cValue !== null && cValue !== undefined) {
        c = cValue.toString();
    } else {
        c = undefined;
    }

    return { m, c };
}
