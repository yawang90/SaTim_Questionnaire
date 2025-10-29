import React, { useEffect, useRef } from 'react';

interface GeoGebraAnswerComponentProps {
    materialId: string;
    width?: string | number;
    height?: string | number;
    maxPoints?: number;
}

export const GeoGebraAnswerComponent: React.FC<GeoGebraAnswerComponentProps> = ({materialId, width = 800, height = 600, maxPoints = 1}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!materialId || !containerRef.current) return;

        containerRef.current.innerHTML = '';

        const params = {
            material_id: materialId,
            width: Number(width),
            height: Number(height),
            maxPoints: maxPoints,
            appletOnLoad: (applet: any) => {
                console.log('GeoGebra applet loaded');
                const allObjects = applet.getAllObjectNames();
                const initialPoints = new Set(
                    allObjects.filter((name: string) => applet.getObjectType(name) === 'point')
                );

                console.log('Initial (protected) points:', Array.from(initialPoints));

                const userPoints: string[] = [];

                const enforceMaxUserPoints = () => {
                    const allowed = Number(maxPoints) >= 0 ? Number(maxPoints) : 0;
                    while (userPoints.length > allowed) {
                        const pointToDelete = userPoints.shift(); // remove oldest extra point
                        if (pointToDelete) {
                            try {
                                applet.deleteObject(pointToDelete);
                                console.log(`Deleted extra user-created point: ${pointToDelete}`);
                            } catch (err) {
                                console.warn(`Failed to delete point ${pointToDelete}:`, err);
                            }
                        }
                    }
                };

                applet.registerAddListener((objName: string) => {
                    try {
                        const type = applet.getObjectType(objName);
                        if (type === 'point' && !initialPoints.has(objName)) {
                            console.log(`User created new point ${objName}: (${applet.getXcoord(objName)}, ${applet.getYcoord(objName)})`);
                            userPoints.push(objName);
                            enforceMaxUserPoints();
                        }
                    } catch (err) {
                        console.error('Error processing new object:', err);
                    }
                });
            },
        };

        const ggbApplet = new (window as any).GGBApplet(params, true);
        ggbApplet.inject(containerRef.current);
    }, [materialId, width, height, maxPoints]);

    return (
        <div
            style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '16px 0',}}>
            <div
                ref={containerRef}
                style={{width: Number(width), height: Number(height), display: 'flex', justifyContent: 'center', alignItems: 'center',}}
            />
        </div>
    );
};
