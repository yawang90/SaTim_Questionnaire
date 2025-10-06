import React, { useRef, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { Node as ProseMirrorNode } from 'prosemirror-model'

interface FreeTextProps {
    node: ProseMirrorNode
}

export const FreeTextAnswerComponent: React.FC<FreeTextProps> = ({ node }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const autoResize = () => {
        if (!textareaRef.current) return
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }

    useEffect(() => {
        autoResize()
    }, [])

    return (
        <NodeViewWrapper className="free-text" style={{ width: '100%' }}>
            <textarea
                ref={textareaRef}
                data-id={node.attrs.id}
                placeholder="Antwort hier eingeben..."
                rows={3}
                style={{
                    width: '100%',
                    padding: '4px 8px',
                    resize: 'none',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                }}
                onInput={autoResize}
            />
        </NodeViewWrapper>
    )
}
