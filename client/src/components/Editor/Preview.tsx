import React from 'react';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {FreeText, FreeTextInline, GeoGebra, MCChoice, NumericInput} from './NodeAnswerPlugins.tsx';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {Table} from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import {FontFamily, FontSize, TextStyle} from '@tiptap/extension-text-style';
import type {JSONContent} from '@tiptap/core';
import {LatexDisplay} from "./NodeEditorPlugins.tsx";
import {MathJaxContext} from "better-react-mathjax";

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
            MCChoice, LatexDisplay
        ],
        content: content || { type: 'doc', content: [] },
    });

    return <MathJaxContext><EditorContent editor={previewEditor} /></MathJaxContext>;
};
