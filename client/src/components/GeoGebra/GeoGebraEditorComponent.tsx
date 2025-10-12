import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';

export const GeoGebraEditorComponent = ({ node, updateAttributes }: any) => {
    const { materialId, width, height } = node.attrs;

    return (
        <NodeViewWrapper
            className="geogebra-node"
            style={{border: '1px solid #ddd', padding: '8px', borderRadius: '8px', textAlign: 'center', background: '#fafafa',}}>
            <p style={{ fontWeight: 'bold' }}>GeoGebra Applet</p>

            <input
                type="text"
                placeholder="GeoGebra Material ID (z. B. mnb8hv7g)"
                value={materialId}
                onChange={(e) => updateAttributes({ materialId: e.target.value })}
                style={{ width: '80%', padding: '4px', marginBottom: '8px' }}
            />

            {materialId && (
                <iframe
                    src={`https://www.geogebra.org/material/iframe/id/${materialId}`}
                    width={width}
                    height={height}
                    style={{ border: 'none' }}
                    title="GeoGebra Applet"
                />
            )}
        </NodeViewWrapper>
    );
};
