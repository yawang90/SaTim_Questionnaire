import React, { useState } from 'react'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'

export const MCChoiceAnswerComponent: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
  const { label, groupId, checked } = node.attrs as { label?: string; groupId?: string; checked?: boolean }
  const [isChecked, setIsChecked] = useState(checked || false)

  const handleToggle = () => {
    const newValue = !isChecked
    setIsChecked(newValue)
    updateAttributes({ checked: newValue })
  }

  return (
      <NodeViewWrapper className="mc-choice-preview inline-flex items-center gap-2 p-1">
        <input
            type="radio"
            name={`group-${groupId || 'default'}`}
            checked={isChecked}
            onChange={handleToggle}
            className="cursor-pointer"
        />
        <span>{label}</span>
      </NodeViewWrapper>
  )
}
