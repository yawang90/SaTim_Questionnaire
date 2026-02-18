import React from 'react';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    FreeText,
    FreeTextInline,
    GeoGebra,
    LineEquation,
    MCChoice,
    NumericInput,
    SingleChoice
} from './NodeAnswerPlugins.tsx';
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
import Underline from '@tiptap/extension-underline';
import type {GeoGebraLine, GeoGebraPoint} from "../../pages/utils/AnswerUtils.tsx";
import ImageResize from 'tiptap-extension-resize-image';

interface PreviewProps {
    content: JSONContent | null;
    editorRef?: React.RefObject<ReturnType<typeof useEditor> | null>;
    onGeoGebraChange?: (answer: GeoGebraAnswer) => void;
}

export interface GeoGebraAnswer {
    id: string;
    kind: 'points' | 'lines';
    value: GeoGebraPoint[] | GeoGebraLine[];
}

export const Preview: React.FC<PreviewProps> = ({ content, editorRef: previewEditorRef, onGeoGebraChange }) => {
    const previewEditor = useEditor({
        editable: false,
        extensions: [
            StarterKit,
            TextStyle,
            FontSize,
            Underline,
            FontFamily,
            TextAlign.configure({ types: ['heading', 'paragraph', 'bulletList', 'orderedList'] }),
            Link,
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
            Image, ImageResize,
            GeoGebra.configure({
                onAnswerChange: (answer: GeoGebraAnswer) => {
                    if (onGeoGebraChange) onGeoGebraChange(answer);
                },
            }),
            FreeText,
            FreeTextInline,
            NumericInput,
            LineEquation,
            MCChoice, LatexDisplay, SingleChoice
        ],
        content: content || { type: 'doc', content: [] },
    });
    React.useEffect(() => {
        if (previewEditorRef) previewEditorRef.current = previewEditor;
        return () => {
            if (previewEditorRef) previewEditorRef.current = null;
        };
    }, [previewEditor, previewEditorRef]);

    return <MathJaxContext><EditorContent editor={previewEditor} /></MathJaxContext>;
};
