import React, { useRef, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { Node as ProseMirrorNode } from 'prosemirror-model'
import { TextField } from '@mui/material'

interface FreeTextProps {
    node: ProseMirrorNode
}

export const FreeTextAnswerComponent: React.FC<FreeTextProps> = ({node}) => {
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
        <NodeViewWrapper className="free-text" style={{ width: '100%', margin: '8px 0' }}>
            <TextField inputRef={textareaRef} id={node.attrs.id} placeholder="Antwort hier eingeben..." multiline minRows={3} fullWidth variant="outlined" onInput={autoResize}/>
        </NodeViewWrapper>
    )
}
