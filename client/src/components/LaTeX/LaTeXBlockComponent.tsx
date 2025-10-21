import React, { useState, useEffect } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import katex from 'katex';

export const LaTeXBlockComponent: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
    const attrs = node.attrs as { latex?: string };
    const [latex, setLatex] = useState(attrs.latex || '');

    useEffect(() => {
        updateAttributes({ latex });
    }, [latex, updateAttributes]);

    return (
        <NodeViewWrapper className="latex-block" style={{display: 'block', padding: '8px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: 4, margin: '8px 0',}}>
            <textarea
                value={latex}
                onChange={(e) => setLatex(e.target.value)}
                placeholder="LaTeX hier eingeben..."
                style={{ width: '100%', border: 'none', background: 'transparent', fontFamily: 'monospace' }}
                rows={3}/>
            <div
                dangerouslySetInnerHTML={{
                    __html: latex ? katex.renderToString(latex, { displayMode: true, throwOnError: false }) : '',
                }}
                style={{ marginTop: 8 }}
            />
        </NodeViewWrapper>
    );
};
