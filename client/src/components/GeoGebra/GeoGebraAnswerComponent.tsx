import React, { useEffect, useRef } from 'react';

interface GeoGebraAnswerComponentProps {
    materialId: string;
    width?: string | number;
    height?: string | number;
    maxPoints?: number;
}

export const GeoGebraAnswerComponent: React.FC<GeoGebraAnswerComponentProps> = ({materialId, width = 800, height = 600, maxPoints = 1}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [answerPoints, setAnswerPoints] = React.useState<{ name: string; x: number; y: number }[]>([]);
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
                let pendingEnforce = false;
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
                const allowed = () => (Number(maxPoints) >= 0 ? Number(maxPoints) : 0);
                const enforceMaxUserPoints = () => {
                    if (pendingEnforce) return;
                    pendingEnforce = true;
                    setTimeout(() => {
                        try {
                            const allowedCount = allowed();
                            if (DEBUG) console.log('[ggb] enforcing, userPoints:', userPoints.slice(), 'allowed:', allowedCount);
                            while (userPoints.length > allowedCount) {
                                const toRemove = userPoints.shift();
                                if (!toRemove) break;
                                try {
                                    applet.deleteObject(toRemove);
                                    if (DEBUG) console.log('[ggb] deleted user point', toRemove);
                                } catch (err) {
                                    console.warn('[ggb] failed deleting', toRemove, err);
                                }
                            }
                        } finally {
                            pendingEnforce = false;
                        }
                    }, 0);
                };

                const processPointIfReady = (objName: string, attemptsLeft = 5, delayMs = 60) => {
                    try {
                        const type = applet.getObjectType(objName);
                        if (type !== 'point') return;
                        if (initialPoints.has(objName)) return;
                        if (objName.startsWith('_') || objName.startsWith('AUX') || objName.includes('temp')) return;
                        if (userPoints.includes(objName)) return;

                        const x = applet.getXcoord(objName);
                        const y = applet.getYcoord(objName);

                        if (Number.isFinite(x) && Number.isFinite(y)) {
                            userPoints.push(objName);
                            setAnswerPoints(prev => {
                                const next = prev.filter(p => p.name !== objName);
                                return [...next, { name: objName, x: Number(x) || 0, y: Number(y) || 0 }];
                            });                            if (DEBUG) console.log('[ggb] accepted new user point', objName, { x, y });
                            enforceMaxUserPoints();
                            return;
                        }
                        if (attemptsLeft > 0) {
                            setTimeout(() => processPointIfReady(objName, attemptsLeft - 1, delayMs), delayMs);
                            return;
                        }
                        userPoints.push(objName);
                        setAnswerPoints(prev => {
                            const next = prev.filter(p => p.name !== objName);
                            return [...next, { name: objName, x, y }];
                        });

                        if (DEBUG) console.log('[ggb] accepted new user point', objName, { x, y });
                        enforceMaxUserPoints();
                        return;
                    } catch (err) {
                        console.error('[ggb] error in processPointIfReady', err);
                    }
                };

                try {
                    applet.registerAddListener((objName: string) => {
                        try {
                            if (DEBUG) console.log('[ggb] add event for', objName);
                            processPointIfReady(objName);
                        } catch (err) {
                            console.error('[ggb] addListener handler error', err);
                        }
                    });
                } catch (err) {
                    console.warn('[ggb] failed to register add listener', err);
                }
            },
        };
        const ggbApplet = new (window as any).GGBApplet(params, true);
        ggbApplet.inject(containerRef.current);
    }, [materialId, width, height, maxPoints]);

    return (
        <div style={{ width: "100%", display: "flex", justifyContent: "center", margin: "16px 0" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

                {/* GeoGebra Applet */}
                <div
                    ref={containerRef}
                    style={{
                        width: Number(width),
                        height: Number(height),
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                />

                {/* Answer Points Display BELOW Applet */}
                {answerPoints.length > 0 && (
                    <div
                        style={{
                            marginTop: "12px",
                            padding: "8px 12px",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            width: Number(width),
                            background: "#fafafa",
                        }}
                    >
                        <strong>Erfasste Punkte:</strong>
                        <ul style={{ margin: "8px 0 0 0", padding: 0, listStyle: "none" }}>
                            {answerPoints.map((p) => (
                                <li key={p.name} style={{ padding: "4px 0" }}>
                                    {p.name}: ({p.x.toFixed(3)}, {p.y.toFixed(3)})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );

};
