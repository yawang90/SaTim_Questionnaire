import React, {useEffect, useState} from 'react'
import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'

export const MCChoiceAnswerComponent: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
    const { groupId, checked } = node.attrs as { groupId?: string; checked?: boolean }
    const [isChecked, setIsChecked] = useState(checked || false)
    const [label, setLabel] = useState('')

    const handleToggle = () => {
        const newValue = !isChecked
        setIsChecked(newValue)
        updateAttributes({ checked: newValue })
    }

    useEffect(() => {
        const text = node.textContent || ''
        setLabel(text)
    }, [node])

    return (
        <NodeViewWrapper className="mc-choice-preview inline-flex items-center gap-2 p-1">
            <input type="checkbox" name={`group-${groupId || 'default'}`} checked={isChecked} onChange={handleToggle} className="cursor-pointer"/>
            <span>{label}</span>
        </NodeViewWrapper>
    )
}
