import React, { useEffect, useRef } from "react";

export interface GeoGebraProps {
    width?: number;
    height?: number;
    showAlgebraInput?: boolean;
    showGraphView?: boolean;
    showToolBar?: boolean;
    showMenuBar?: boolean;
    showCAS?: boolean;
    show3D?: boolean;
    onChange?: (expression: string) => void;
    materialId?: string;
}

const GeoGebraApp: React.FC<GeoGebraProps> = ({width, height, showAlgebraInput = false, showGraphView = false, showToolBar = false, showMenuBar = false, showCAS = false, show3D = false, onChange, materialId}) => {
    const ggbDiv = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (window.GGBApplet && ggbDiv.current) {
            const appletConfig: any = {
                appName: "classic",
                showAlgebraInput,
                showToolBar,
                showMenuBar,
                showCAS,
                show3D,
                showGraphView,
            };
            if (width) {
                appletConfig.width = width;
            }
            if (height) {
                appletConfig.height = height;
            }
            if (materialId) {
                appletConfig.material_id = materialId;
            }

            const applet = new window.GGBApplet(appletConfig, true);
            applet.inject(ggbDiv.current);

            setTimeout(() => {
                const ggb = applet.getAppletObject();

                if (onChange && ggb) {
                    ggb.registerUpdateListener((objName: string) => {
                        const value = ggb.getValueString(objName);
                        onChange(value);
                    });

                    ggb.registerAddListener((objName: string) => {
                        const value = ggb.getValueString(objName);
                        onChange(value);
                    });
                }
            }, 500);
        }
    }, [width, height, showAlgebraInput, showGraphView, showToolBar, showMenuBar, showCAS, show3D, onChange, materialId]);

    return <div ref={ggbDiv}></div>;
};

export default GeoGebraApp;
