import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import React, { useState } from "react";

export const MCChoiceAnswerComponent: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
    const { groupId, checked } = node.attrs as { groupId?: string; checked?: boolean };
    const [isChecked, setIsChecked] = useState(checked || false);

    const renderChildren = (fragment: any): React.ReactNode[] => {
        const nodes: React.ReactNode[] = [];
        fragment?.forEach((child: any) => {
            if (child.type.name === "paragraph") {
                nodes.push(
                    <div key={nodes.length} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {renderChildren(child.content)}
                    </div>
                );
            } else if (child.type.name === "text") {
                nodes.push(<span key={nodes.length}>{child.text}</span>);
            } else if (child.type.name === "image") {
                nodes.push(
                    <img key={nodes.length} src={child.attrs.src} style={{ width: child.attrs.width || "auto", height: child.attrs.height || "auto" }}/>
                );
            } else if (child.content && child.content.size > 0) {
                nodes.push(<React.Fragment key={nodes.length}>{renderChildren(child.content)}</React.Fragment>);
            }
        });
        return nodes;
    };

    return (
        <NodeViewWrapper className="mc-choice-wrapper" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="checkbox" name={`group-${groupId || "default"}`} checked={isChecked} onChange={() => setIsChecked(!isChecked)} style={{ flexShrink: 0 }}/>

            <div className="mc-choice-content-wrapper" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div className="mc-choice-content">{renderChildren(node.content)}</div>
            </div>
        </NodeViewWrapper>
    );
};
