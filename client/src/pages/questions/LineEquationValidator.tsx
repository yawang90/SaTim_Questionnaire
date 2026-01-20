import { parse, type MathNode, type ConstantNode, type SymbolNode, type OperatorNode, type ParenthesisNode } from 'mathjs';

/**
 * Preprocess MathLive LaTeX → JS expression
 * - \cdot → *
 * - \frac{a}{b} → (a/b)
 */
function preprocessMathLive(input: string): string {
    let s = input.replace(/\s+/g, '');
    s = s.replace(/\\cdot/g, '*');
    s = s.replace(/\\frac{([^{}]+)}{([^{}]+)}/g, '($1/$2)');
    s = s.replace(/\\frac(\d+)\/(\d+)/g, '($1/$2)');
    s = s.replace(/(\d+)\\frac(\d+)\/(\d+)/g, '($1+$2/$3)');
    s = s.replace(/\\frac(\d+)(\d+)/g, '($1/$2)');
    s = s.replace(/:/g, '/');
    return s;
}

/**
 * Enforce explicit multiplication: reject things like 3x
 */
function enforceExplicitMultiplication(input: string): string | null {
    const match = input.match(/\d[a-zA-Z]/);
    if (match) return `Implizite Multiplikation gefunden bei "${match[0]}". Bitte verwende * für Multiplikationen.`;
    return null;
}

/**
 * Unwrap ParenthesisNode recursively
 */
function unwrapParentheses(node: MathNode): MathNode {
    while (node.type === 'ParenthesisNode') {
        node = (node as ParenthesisNode).content;
    }
    return node;
}

/**
 * Flatten a multiplication chain: compute coefficient and whether x is present
 */
function flattenProduct(node: MathNode): { coeff: number; hasX: boolean; valid: boolean } {
    let coeff = 1;
    let hasX = false;
    let valid = true;

    function multiply(n: MathNode) {
        if (!valid) return;

        n = unwrapParentheses(n);

        if (n.type === 'OperatorNode') {
            const opNode = n as OperatorNode;
            if (opNode.op === '*') {
                opNode.args.forEach(multiply);
            } else if (opNode.op === '/') {
                const args = opNode.args.map(unwrapParentheses);
                if (args.every(a => a.type === 'ConstantNode')) {
                    coeff *= parseFloat(String((args[0] as ConstantNode).value)) /
                        parseFloat(String((args[1] as ConstantNode).value));
                } else {
                    valid = false;
                }
            } else {
                valid = false;
            }
        } else if (n.type === 'SymbolNode') {
            const name = (n as SymbolNode).name;
            if (name === 'x') {
                if (hasX) valid = false;
                hasX = true;
            } else {
                valid = false;
            }
        } else if (n.type === 'ConstantNode') {
            coeff *= parseFloat(String((n as ConstantNode).value));
        } else {
            valid = false;
        }
    }

    multiply(node);
    return { coeff, hasX, valid };
}

/**
 * Evaluate MathNode recursively to compute m and c
 */
function evalTerm(node: MathNode, sign = 1): { m: number; c: number; linear: boolean } {
    let m = 0, c = 0;
    let linear = true;

    node = unwrapParentheses(node);

    if (node.type === 'OperatorNode') {
        const opNode = node as OperatorNode;

        if (opNode.op === '+') {
            const left = evalTerm(opNode.args[0], sign);
            const right = evalTerm(opNode.args[1], sign);
            m = left.m + right.m;
            c = left.c + right.c;
            linear = left.linear && right.linear;
        } else if (opNode.op === '-') {
            const left = evalTerm(opNode.args[0], sign);
            const right = evalTerm(opNode.args[1], -sign);
            m = left.m + right.m;
            c = left.c + right.c;
            linear = left.linear && right.linear;
        } else if (opNode.op === '*') {
            const { coeff, hasX, valid } = flattenProduct(node);
            if (!valid) linear = false;
            else if (hasX) m += sign * coeff;
            else c += sign * coeff;
        } else if (opNode.op === '/') {
            const args = opNode.args.map(unwrapParentheses);
            if (args.every(a => a.type === 'ConstantNode')) {
                c += sign * parseFloat(String((args[0] as ConstantNode).value)) /
                    parseFloat(String((args[1] as ConstantNode).value));
            } else {
                linear = false;
            }
        } else if (opNode.op === '^') linear = false;
        else linear = false;
    } else if (node.type === 'SymbolNode') {
        if ((node as SymbolNode).name === 'x') m += sign;
        else linear = false;
    } else if (node.type === 'ConstantNode') {
        c += sign * parseFloat(String((node as ConstantNode).value));
    } else if (node.type === 'ParenthesisNode') {
        const result = evalTerm((node as ParenthesisNode).content, sign);
        m += result.m;
        c += result.c;
        linear = linear && result.linear;
    } else {
        linear = false;
    }

    return { m, c, linear };
}

/**
 * Validate linear equation y = m*x + c
 */
export function validateLineEquationMathJS(eq: string): { m?: string; c?: string; error?: string } {
    if (!eq.startsWith('y=')) return { error: 'Gleichung muss mit "y=" beginnen.' };

    const implicitError = enforceExplicitMultiplication(eq.slice(2));
    if (implicitError) return { error: implicitError };

    const rhsStr = preprocessMathLive(eq.slice(2));
    console.log('Preprocessed RHS:', rhsStr);

    let node: MathNode;
    try { node = parse(rhsStr); }
    catch { return { error: 'Ungültiger Ausdruck.' }; }

    const variables = new Set<string>();
    node.traverse(n => {
        if (n.type === 'SymbolNode') variables.add((n as SymbolNode).name);
    });
    if (variables.size > 1) return { error: `Zu viele Variablen: ${Array.from(variables).join(', ')}. Nur x ist erlaubt.` };
    if (variables.size === 1 && !variables.has('x')) return { error: `Ungültige Variable: ${Array.from(variables)[0]}. Nur x ist erlaubt.` };

    const { m, c, linear } = evalTerm(node);
    if (!linear) return { error: 'Gleichung ist nicht linear.' };

    return { m: m.toString(), c: c.toString() };
}
