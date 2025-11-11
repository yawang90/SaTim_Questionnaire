import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import React, { useState } from "react";

export const SingleChoiceAnswerComponent: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
    const { groupId, checked } = node.attrs as { groupId?: string; checked?: boolean };
    const [isChecked, setIsChecked] = useState(checked || false);

    const renderChildren = (fragment: any): React.ReactNode[] => {
        const nodes: React.ReactNode[] = [];
        fragment?.forEach((child: any) => {
            if (child.type.name === "paragraph") {
                if (!child.content || child.content.size === 0) {
                    nodes.push(<p key={nodes.length}>&nbsp;</p>);
                } else {
                    nodes.push(
                        <div key={nodes.length} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {renderChildren(child.content)}
                        </div>
                    );
                }
            } else if (child.type.name === "text") {
                nodes.push(<span key={nodes.length}>{child.text}</span>);
            } else if (child.type.name === "image") {
                nodes.push(
                    <img key={nodes.length} src={child.attrs.src} style={{width: child.attrs.width || "auto", height: child.attrs.height || "auto",}}/>
                );
            } else if (child.content && child.content.size > 0) {
                nodes.push(<React.Fragment key={nodes.length}>{renderChildren(child.content)}</React.Fragment>);
            }
        });
        return nodes;
    };

    return (
        <NodeViewWrapper
            className="mc-choice-wrapper"
            style={{display: "inline-flex", flexDirection: "row", alignItems: "center", padding: "0.5rem 1rem", marginRight: "0.5rem", verticalAlign: "top", gap: "0.5rem",}}>

            <input type="radio" name={`group-${groupId || "default"}`} checked={isChecked} onChange={() => setIsChecked(!isChecked)} style={{ marginBottom: "0.25rem", flexShrink: 0 }}/>

            <div className="mc-choice-content" style={{ display: "flex", flexDirection: "column", gap: "4px", whiteSpace: "pre-wrap" }}>
                {renderChildren(node.content)}
            </div>
        </NodeViewWrapper>
    );
};
