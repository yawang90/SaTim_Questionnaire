import React, { useEffect, useRef } from 'react';

interface GeoGebraProps {
    width?: number;
    height?: number;
}

const GeoGebraApp: React.FC<GeoGebraProps> = ({ width = 800, height = 600 }) => {
    const ggbDiv = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (window.GGBApplet && ggbDiv.current) {
            const applet = new window.GGBApplet({
                appName: 'classic',
                width,
                height,
                showToolbar: true,
                showAlgebraInput: true,
                showMenuBar: true,
            }, true);

            applet.inject(ggbDiv.current);
        }
    }, [width, height]);

    return <div ref={ggbDiv}></div>;
};

export default GeoGebraApp;
