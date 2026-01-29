import React, {useEffect, useRef} from 'react';

interface GeoGebraAnswerComponentProps {
    materialId: string;
    width?: string | number;
    height?: string | number;
    maxPoints?: number;
    maxLines?: number | "";
    variant: 'points' | 'lines';
}

export const GeoGebraAnswerComponent: React.FC<GeoGebraAnswerComponentProps> = ({
                                                                                    materialId,
                                                                                    width = 800,
                                                                                    height = 600,
                                                                                    maxPoints = 1,
                                                                                    maxLines = 0,
                                                                                    variant
                                                                                }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [answerPoints, setAnswerPoints] = React.useState<{ name: string; x: number; y: number }[]>([]);
    const [answerLines, setAnswerLines] = React.useState<{
        name: string;
        type: string;
        equation?: string,
        coefficients?: { a: number; b: number; c: number }
    }[]>([]);

    useEffect(() => {
        if (!materialId || !containerRef.current) return;

        containerRef.current.innerHTML = '';

        const params = {
            material_id: materialId,
            width: Number(width),
            height: Number(height),
            maxPoints: maxPoints,
            appletOnLoad: (applet: any) => {
                const initialPoints = new Set<string>();
                const userPoints: string[] = [];
                const userLines: string[] = [];
                const DEBUG = false;
                try {
                    const allObjects = applet.getAllObjectNames();
                    allObjects.forEach((name: string) => {
                        try {
                            if (applet.getObjectType(name) === 'point') initialPoints.add(name);
                        } catch (err) {
                            console.log(err)
                        }
                    });
                } catch (err) {
                    console.warn('[ggb] failed to list objects on load', err);
                }
                if (DEBUG) console.log('[ggb] initial protected points:', Array.from(initialPoints));
                const allowedPoints = () =>
                    variant === 'points' ? Number(maxPoints) || 0 : 0;

                const allowedLines = () =>
                    variant === 'lines'
                        ? maxLines === "" || maxLines === undefined
                            ? 0
                            : Number(maxLines)
                        : 0;
                const enforceMaxUserPoints = () => {
                    if (variant !== 'points') return;
                    setTimeout(() => {
                        const allowedCount = allowedPoints();
                        if (DEBUG) console.log('[ggb] enforcing, userPoints:', userPoints.slice(), 'allowed:', allowedCount);
                        while (userPoints.length > allowedCount) {
                            const toRemove = userPoints.shift();
                            if (!toRemove) break;
                            try {
                                applet.deleteObject(toRemove);
                                setAnswerPoints(prev =>
                                    prev.filter(p => p.name !== toRemove)
                                );
                                if (DEBUG) console.log('[ggb] deleted user point', toRemove);
                            } catch (err) {
                                console.warn('[ggb] failed deleting', toRemove, err);
                            }
                        }
                    }, 0);
                };
                const enforceMaxUserLines = () => {
                    if (variant !== 'lines') return;
                    setTimeout(() => {
                        const allowedCount = allowedLines();
                        while (userLines.length > allowedCount) {
                            const toRemove = userLines.shift();
                            if (!toRemove) break;

                            try {
                                applet.deleteObject(toRemove);
                                setAnswerLines(prev =>
                                    prev.filter(l => l.name !== toRemove)
                                );
                            } catch (err) {
                                console.warn('[ggb] failed deleting line', toRemove, err);
                            }
                        }
                    }, 0);
                };

                const processPoint = (objName: string, attemptsLeft = 5, delayMs = 60) => {
                    try {
                        if (variant !== 'points') return;
                        if (initialPoints.has(objName)) return;
                        if (objName.startsWith('_') || objName.startsWith('AUX') || objName.includes('temp')) return;
                        if (userPoints.includes(objName)) return;

                        const x = applet.getXcoord(objName);
                        const y = applet.getYcoord(objName);

                        if (Number.isFinite(x) && Number.isFinite(y)) {
                            userPoints.push(objName);
                            setAnswerPoints(prev => {
                                const next = prev.filter(p => p.name !== objName);
                                return [...next, {name: objName, x: Number(x) || 0, y: Number(y) || 0}];
                            });
                            if (DEBUG) console.log('[ggb] accepted new user point', objName, {x, y});
                            enforceMaxUserPoints();
                            return;
                        }
                        if (attemptsLeft > 0) {
                            setTimeout(() => processPoint(objName, attemptsLeft - 1, delayMs), delayMs);
                            return;
                        }
                        userPoints.push(objName);
                        setAnswerPoints(prev => {
                            const next = prev.filter(p => p.name !== objName);
                            return [...next, {name: objName, x, y}];
                        });

                        if (DEBUG) console.log('[ggb] accepted new user point', objName, {x, y});
                        enforceMaxUserPoints();
                        return;
                    } catch (err) {
                        console.error('[ggb] error in processPointIfReady', err);
                    }
                };
                const processLine = (objName: string) => {
                    if (variant !== 'lines') return;
                    const type = applet.getObjectType(objName);
                    if (!["line", "segment", "ray"].includes(type) || userLines.includes(objName)) return;
                    let equation: string | undefined;
                    let coefficients: { a: number; b: number; c: number } | undefined;

                    try {
                        const def = applet.getDefinitionString(objName);
                        const match = def.match(/\[([^\]]+),([^\]]+)\]/);
                        if (match) {
                            const [_, p1, p2] = match;
                            const x1 = applet.getXcoord(p1);
                            const y1 = applet.getYcoord(p1);
                            const x2 = applet.getXcoord(p2);
                            const y2 = applet.getYcoord(p2);

                            const A = y1 - y2;
                            const B = x2 - x1;
                            const C = x1 * y2 - x2 * y1;

                            coefficients = {a: A, b: B, c: C};
                            equation = `${A.toFixed(3)}x + ${B.toFixed(3)}y + ${C.toFixed(3)} = 0`;
                        }
                    } catch { /* empty */
                    }

                    userLines.push(objName);
                    setAnswerLines(prev => [...prev.filter(l => l.name !== objName), {
                        name: objName,
                        type,
                        equation,
                        coefficients
                    }]);
                    enforceMaxUserLines();
                };

                try {
                    applet.registerAddListener((objName: string) => {
                        processPoint(objName);
                        processLine(objName);
                    });
                } catch (err) {
                    console.warn('[ggb] failed to register add listener', err);
                }
            },
        };
        const ggbApplet = new (window as any).GGBApplet(params, true);
        ggbApplet.inject(containerRef.current);
    }, [materialId, width, height, maxPoints, maxLines, variant]);

    return (
        <div style={{width: "100%", display: "flex", justifyContent: "center", margin: "16px 0"}}>
            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <div ref={containerRef} style={{
                    width: Number(width),
                    height: Number(height),
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}/>
                {variant === 'points' && (
                    <div style={{marginTop: "12px", padding: "8px 12px", border: "1px solid #ccc", borderRadius: "8px", width: Number(width), background: "#fafafa",}}>
                        <strong>Erfasste Punkte:</strong>

                        {answerPoints.length === 0 ? (
                            <div style={{ fontStyle: "italic", marginTop: "6px", color: "#666" }}>
                                Noch keine Punkte gesetzt.
                            </div>
                        ) : (
                            <ul style={{ margin: "8px 0 0 0", padding: 0, listStyle: "none" }}>
                                {answerPoints.map(p => (
                                    <li key={p.name} style={{ padding: "4px 0" }}>
                                        {p.name}: ({p.x.toFixed(3)}, {p.y.toFixed(3)})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {variant === 'lines' && (
                    <div style={{marginTop: "12px", padding: "8px 12px", border: "1px solid #ccc", borderRadius: "8px", width: Number(width), background: "#f3f6ff",}}>
                        <strong>Erfasste Linien:</strong>
                        <ul style={{margin: "8px 0 0 0", padding: 0, listStyle: "none"}}>
                            {answerLines.map(l => (
                                <li key={l.name} style={{padding: "4px 0"}}>
                                    <div><b>{l.name}</b> — Typ: {l.type}</div>
                                    {l.equation && (
                                        <div style={{fontSize: "0.9em"}}>
                                            Gleichung: <code>{l.equation}</code>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>)}
            </div>
        </div>
    );

};
