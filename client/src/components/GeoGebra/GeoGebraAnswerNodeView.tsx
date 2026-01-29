import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { GeoGebraAnswerComponent } from './GeoGebraAnswerComponent';

export const GeoGebraAnswerNodeView = ({ node }: any) => {
    const { materialId, width, height, maxPoints, maxLines, variant } = node.attrs;

    return (
        <NodeViewWrapper className="geogebra-node">
            <GeoGebraAnswerComponent
                materialId={materialId}
                width={width}
                height={height}
                maxPoints={maxPoints}
                maxLines={maxLines}
                variant={variant}
            />
        </NodeViewWrapper>
    );
};

