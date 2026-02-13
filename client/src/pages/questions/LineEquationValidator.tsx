import type {BoxedExpression} from "@cortex-js/compute-engine";
import {ce} from "../../main.tsx";

export function normalizeMathInput(expr: BoxedExpression, mc: string): { value?: string; error?: string } {
    if (!expr) {
        return { error: "Leerer Ausdruck." };
    }
    try {
        const simplified = expr.simplify();
        const val = simplified.N();
        const symbols = [...simplified.symbols];
        const filtered = symbols.filter(s =>
            !["Pi", "ExponentialE", "ImaginaryUnit"].includes(s)
        );
        if (!val.isReal) {
            if (filtered.some(s => s !== mc)) {
                return {
                    error: `Nur die Variable "${mc}" ist erlaubt.`
                };
            } else {
                if (!evaluatesToReal(simplified, mc)) {
                    return { error: "Ungültiger mathematischer Ausdruck." };
                } else {
                    return {value: "HAS_MC"}
                }
            }
        }
        return {};
    } catch (err) {
        console.log(err);
        return { error: "Ungültiger mathematischer Ausdruck." };
    }
}

function evaluatesToReal(expr: BoxedExpression, variable?: string): boolean {
    try {
        let testExpr = expr;
        if (variable) {
            testExpr = expr.subs({ [variable]: 2 });
        }
        const val = testExpr.N();
        return val.isNumber && Number.isFinite(val.valueOf()) || false;
    } catch {
        return false;
    }
}

function sanitizeMathInput(input: string): string {
    if (!input) return "";
    return input.replace(/:/g, '\\cdot');
}

/**
 * Transform existing m/c objects
 */
export function checkLineEquationHasErrors(val: { m?: { operator: string; value: string }[]; c?: { operator: string; value: string }[]; }) {
    const mExpr = sanitizeMathInput(val?.m?.[0]?.value ? val?.m?.[0]?.value : "");
    const cExpr = sanitizeMathInput(val?.c?.[0]?.value ? val?.c?.[0]?.value : "");
    let mResult;
    let cResult;
    if (mExpr) {
        const boxedMexpr = ce.parse(mExpr);
        mResult = normalizeMathInput(boxedMexpr, "c");
        if (mResult.error) {
            return { error: `Steigung m: ${mResult.error}` };
        }
    }
    if (cExpr) {
        const boxedCexpr = ce.parse(cExpr);
        cResult = normalizeMathInput(boxedCexpr, "m");
        if (cResult.error) {
            return { error: `Achsenabschnitt c: ${cResult.error}` };
        }
    }
    if (mResult?.value === "HAS_MC" && cResult?.value === "HAS_MC") {
        return { error: `Nur jeweils eine Variable "m" oder "c" erlaubt. Bitte entfernen Sie ein "m" oder "c".` };
    }
    return {};
}
/**
 * Validate linear equation y = m*x + c
 * using symbolic simplification
 */
export function validateLineEquation(expr: BoxedExpression) {
    if (!expr.isEqual) {
        return { error: 'Gleichung muss ein "=" enthalten.' };
    }
    let [lhs, rhs] = expr.ops ?? [];

    if (rhs?.symbol === "y") {
        [lhs, rhs] = [rhs, lhs];
    }
    if (lhs?.symbol !== "y") {
        return { error: 'Gleichung muss mit "y =" beginnen.' };
    }
    const poly = ceEval("Expand", rhs);
    const vars = ceEval("Variables", poly)
        .ops?.map(v => v.symbol)
        .filter(Boolean) ?? [];
    if (vars.some(v => v !== "x")) {
        return { error: "Nur die Variable x ist erlaubt." };
    }
    const degree =
        ceEval("PolynomialDegree", poly, "x").numericValue ?? 0;

    if (degree as number > 1) {
        return { error: "Gleichung ist nicht linear." };
    }
    const coeffs = ceEval("CoefficientList", poly, "x").ops ?? [];
    const c = coeffs[0] ?? ce.number(0);
    const m = coeffs[1] ?? ce.number(0);
    return {
        m: m.toLatex(),
        c: c.toLatex(),
    };
}

function ceEval(fn: string, ...args: any[]): BoxedExpression {
    return ce.function(fn, args).evaluate().simplify();
}
