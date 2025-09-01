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

    materialId?: string;  // e.g. "abcd1234" from geogebra.org/m/abcd1234
    fileUrl?: string;     // e.g. "https://your-server.com/mygraph.ggb"
}

const GeoGebraApp: React.FC<GeoGebraProps> = ({
                                                  width = 800,
                                                  height = 600,
                                                  showAlgebraInput = true,
                                                  showGraphView = true,
                                                  showToolBar = true,
                                                  showMenuBar = true,
                                                  showCAS = false,
                                                  show3D = false,
                                                  onChange,
                                                  materialId,
                                                  fileUrl,
                                              }) => {
    const ggbDiv = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (window.GGBApplet && ggbDiv.current) {
            const appletConfig: any = {
                appName: "classic",
                width,
                height,
                showAlgebraInput,
                showToolBar,
                showMenuBar,
                showCAS,
                show3D,
                showGraphView,
            };

            // Load material if provided
            if (materialId) {
                appletConfig.materialId = materialId;
            }

            // Load .ggb file if provided
            if (fileUrl) {
                appletConfig.filename = fileUrl;
            }

            const applet = new window.GGBApplet(appletConfig, true);
            applet.inject(ggbDiv.current);

            // Delay to ensure applet is initialized
            setTimeout(() => {
                const ggb = applet.getAppletObject();

                if (onChange && ggb) {
                    // Listen to updates of any object
                    ggb.registerUpdateListener((objName: string) => {
                        const value = ggb.getValueString(objName);
                        onChange(value);
                    });

                    // Listen to new objects being created
                    ggb.registerAddListener((objName: string) => {
                        const value = ggb.getValueString(objName);
                        onChange(value);
                    });
                }
            }, 500);
        }
    }, [
        width,
        height,
        showAlgebraInput,
        showGraphView,
        showToolBar,
        showMenuBar,
        showCAS,
        show3D,
        onChange,
        materialId,
        fileUrl,
    ]);

    return <div ref={ggbDiv}></div>;
};

export default GeoGebraApp;
