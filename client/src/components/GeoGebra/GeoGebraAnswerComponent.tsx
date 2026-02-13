import React, {useEffect, useRef, useState} from 'react';
import type {GeoGebraLine, GeoGebraPoint} from "../../pages/questions/AnswerUtils.tsx";
import {Alert, Snackbar} from "@mui/material";

interface GeoGebraAnswerComponentProps {
    materialId: string;
    width?: string | number;
    height?: string | number;
    maxPoints?: number;
    maxLines?: number | "";
    variant: 'points' | 'lines';
    onAnswerChange?: (answer: {
        kind: 'points' | 'lines';
        value: GeoGebraPoint[] | GeoGebraLine[];
    }) => void;
}

export const GeoGebraAnswerComponent: React.FC<GeoGebraAnswerComponentProps> = ({
                                                                                    materialId,
                                                                                    width = 800,
                                                                                    height = 600,
                                                                                    maxPoints = 1,
                                                                                    maxLines = 0,
                                                                                    variant, onAnswerChange
                                                                                }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [answerPoints, setAnswerPoints] = React.useState<{ name: string; x: number; y: number }[]>([]);
    const [answerLines, setAnswerLines] = React.useState<{
        name: string;
        m: number;
        c: number;
    }[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    useEffect(() => {
        if (variant === 'points') {
            onAnswerChange?.({ kind: 'points', value: answerPoints });
        } else if (variant === 'lines') {
            onAnswerChange?.({ kind: 'lines', value: answerLines });
        }
    }, [answerPoints, answerLines, onAnswerChange, variant]);

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
                        while (userPoints.length > allowedCount) {
                            const toRemove = userPoints.shift();
                            if (!toRemove) break;
                            try {
                                applet.deleteObject(toRemove);
                                setAnswerPoints(prev =>
                                    prev.filter(p => p.name !== toRemove)
                                );
                            } catch (err) {
                                console.warn('[ggb] failed deleting', toRemove, err);
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

                        enforceMaxUserPoints();
                        return;
                    } catch (err) {
                        console.error('[ggb] error in processPointIfReady', err);
                    }
                };
                const isPointUsedInOtherLines = (pointName: string, excludeLine?: string) => {
                    return userLines.some(lineName => {
                        if (lineName === excludeLine) return false;
                        const cmd = applet.getCommandString(lineName);
                        const points = cmd.match(/[A-Za-z0-9_]+/g);
                        if (!points) return false;
                        return points.includes(pointName);
                    });
                };
                const processLine = (objName: string) => {
                    const type = applet.getObjectType(objName);
                    if (variant !== 'lines') return;
                    if (!["line", "segment", "ray"].includes(type) || userLines.includes(objName)) return;
                    if (userLines.length >= allowedLines()) {
                        const def = applet.getCommandString(objName);
                        const points = def.match(/[A-Za-z0-9_]+/g);
                        if (points) {
                            const p1 = points[1];
                            const p2 = points[2];
                            setTimeout(() => {
                                try {
                                    applet.deleteObject(objName);
                                    if (!isPointUsedInOtherLines(p1, objName)) applet.deleteObject(p1);
                                    if (!isPointUsedInOtherLines(p2, objName)) applet.deleteObject(p2);
                                } catch (err){ console.log(err) }
                            }, 0);
                            applet.setMode(0);
                            setSnackbarMessage("Bitte verwende das Verschiebetool, du hast bereits die maximale Anzahl Linien eingezeichnet.");
                            setSnackbarOpen(true);
                        }
                    } else {
                        let m = 0;
                        let c = 0;
                        try {
                            const def = applet.getCommandString(objName);
                            const points = def.match(/[A-Za-z0-9_]+/g);
                            if (points && points.length >= 3) {
                                const p1 = points[1];
                                const p2 = points[2];
                                const x1 = applet.getXcoord(p1);
                                const y1 = applet.getYcoord(p1);
                                const x2 = applet.getXcoord(p2);
                                const y2 = applet.getYcoord(p2);
                                m = Math.abs(x2 - x1) > 1e-8 ? (y2 - y1) / (x2 - x1) : Infinity;
                                c = m === Infinity ? x1 : y1 - m * x1;
                            }
                        } catch(e) { console.log(e)}
                        userLines.push(objName);
                        setAnswerLines(prev => [...prev.filter(l => l.name !== objName), {
                            name: objName,
                            m,
                            c,
                        }]);
                    }
                };
                try {
                    applet.registerClearListener(() => {
                        userLines.length = 0;
                        userPoints.length = 0;
                        setAnswerLines([]);
                        setAnswerPoints([]);
                    });
                    applet.registerAddListener((objName: string) => {
                        processPoint(objName);
                        processLine(objName);
                    });
                    applet.registerUpdateListener(() => {
                        if (variant === 'points') {
                            setAnswerPoints(prev => {
                                return prev.map(p => {
                                    try {
                                        const x = applet.getXcoord(p.name);
                                        const y = applet.getYcoord(p.name);
                                        return { ...p, x: Number(x), y: Number(y) };
                                    } catch {
                                        return p; 
                                    }
                                });
                            });
                        }

                        if (variant === 'lines') {
                            setAnswerLines(prev => {
                                return prev.map(l => {
                                    try {
                                        const def = applet.getDefinitionString(l.name);
                                        const points = def.match(/[A-Za-z0-9_]+/g);
                                        if (points && points.length >= 3) {
                                            const p1 = points[1];
                                            const p2 = points[2];
                                            const x1 = applet.getXcoord(p1);
                                            const y1 = applet.getYcoord(p1);
                                            const x2 = applet.getXcoord(p2);
                                            const y2 = applet.getYcoord(p2);
                                            const m = Math.abs(x2 - x1) > 1e-8 ? (y2 - y1) / (x2 - x1) : Infinity;
                                            const c = m === Infinity ? x1 : y1 - m * x1;
                                            return { ...l, m, c };
                                        }
                                    } catch { /* empty */ }
                                    return l;
                                });
                            });
                        }
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
                        <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                            {answerLines.map((l) => (
                                <div key={l.name}>
                                    Linie {l.name} mit Werten M: {l.m === Infinity ? "∞" : l.m.toFixed(3)} und C: {l.c.toFixed(3)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}
                      anchorOrigin={{vertical: "bottom", horizontal: "center"}}>
                <Alert onClose={() => setSnackbarOpen(false)} severity="warning" variant="filled"
                       sx={{whiteSpace: "pre-line"}}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );

};
