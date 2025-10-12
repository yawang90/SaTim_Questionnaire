import React, { useEffect, useRef } from 'react';

interface GeoGebraAnswerComponentProps {
    materialId: string;
    width?: string | number;
    height?: string | number;
}

export const GeoGebraAnswerComponent: React.FC<GeoGebraAnswerComponentProps> = ({materialId, width = 800, height = 600,}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!materialId || !containerRef.current) return;

        containerRef.current.innerHTML = '';

        const params = {
            material_id: materialId,
            width: Number(width),
            height: Number(height),
            appletOnLoad: (applet: any) => {
                console.log('GeoGebra applet loaded');
                const allObjects = applet.getAllObjectNames();
                allObjects.forEach((name: string) => {
                    if (applet.getObjectType(name) === 'point') {
                        console.log(`Existing point ${name}: (${applet.getXcoord(name)}, ${applet.getYcoord(name)})`);
                    }
                });

                applet.registerAddListener((objName: string) => {
                    try {
                        if (applet.getObjectType(objName) === 'point') {
                            console.log(`New point ${objName}: (${applet.getXcoord(objName)}, ${applet.getYcoord(objName)})`);
                        }
                    } catch {}
                });
            },
        };

        const ggbApplet = new (window as any).GGBApplet(params, true);
        ggbApplet.inject(containerRef.current);
    }, [materialId, width, height]);

    return (
        <div
            ref={containerRef}
            style={{ width, height, display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '16px 0' }}
        />
    );
};
