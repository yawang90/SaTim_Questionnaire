import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FreeText, FreeTextInline, GeoGebra, MCChoice, NumericInput } from './NodeAnswerPlugins.tsx';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import { FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style';
import type { JSONContent } from '@tiptap/core';
import katex from 'katex';

interface PreviewProps {
    content: JSONContent | null;
}

export const Preview: React.FC<PreviewProps> = ({ content }) => {
    const previewEditor = useEditor({
        editable: false,
        extensions: [
            StarterKit,
            TextStyle,
            FontSize,
            FontFamily,
            TextAlign.configure({ types: ['heading', 'paragraph', 'bulletList', 'orderedList'] }),
            Link,
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
            Image,
            GeoGebra,
            FreeText,
            FreeTextInline,
            NumericInput,
            MCChoice,
        ],
        content: content || { type: 'doc', content: [] },
    });

    useEffect(() => {
        if (!previewEditor) return;
        const walkTextNodes = (node: Node) => {
            node.childNodes.forEach((child) => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const text = child.textContent || '';
                    const newNodes: Node[] = [];

                    let lastIndex = 0;
                    const blockRegex = /\$\$(.+?)\$\$/g;
                    let match;
                    while ((match = blockRegex.exec(text)) !== null) {
                        if (match.index > lastIndex) newNodes.push(document.createTextNode(text.slice(lastIndex, match.index)));
                        const span = document.createElement('span');
                        span.innerHTML = katex.renderToString(match[1], { throwOnError: false, displayMode: true });
                        newNodes.push(span);
                        lastIndex = match.index + match[0].length;
                    }
                    if (lastIndex < text.length) newNodes.push(document.createTextNode(text.slice(lastIndex)));

                    const finalNodes: Node[] = [];
                    newNodes.forEach((n) => {
                        if (n.nodeType === Node.TEXT_NODE) {
                            const inlineText = n.textContent || '';
                            let lastIdx = 0;
                            const inlineRegex = /\$(.+?)\$/g;
                            let m;
                            while ((m = inlineRegex.exec(inlineText)) !== null) {
                                if (m.index > lastIdx) finalNodes.push(document.createTextNode(inlineText.slice(lastIdx, m.index)));
                                const span = document.createElement('span');
                                span.innerHTML = katex.renderToString(m[1], { throwOnError: false, displayMode: false });
                                finalNodes.push(span);
                                lastIdx = m.index + m[0].length;
                            }
                            if (lastIdx < inlineText.length) finalNodes.push(document.createTextNode(inlineText.slice(lastIdx)));
                        } else {
                            finalNodes.push(n);
                        }
                    });

                    if (finalNodes.length) child.replaceWith(...finalNodes);
                } else if (child.childNodes.length > 0) {
                    walkTextNodes(child);
                }
            });
        };

        walkTextNodes(previewEditor.view.dom);
    }, [previewEditor, content]);

    return <EditorContent editor={previewEditor} />;
};
