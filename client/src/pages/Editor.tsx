import { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function Editor() {
    const [editorData, setEditorData] = useState<string>('<p>Hello from CKEditor 5!</p>');

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem'
            }}
        >
            <h2>Aufgabenstellung editieren</h2>
            <div style={{ width: '100%', maxWidth: '800px' }}>
                <CKEditor
                    editor={ClassicEditor}
                    data={editorData}
                    onChange={(_, editor) => {
                        const newData = editor.getData();
                        setEditorData(newData);
                    }}
                />
            </div>
            <h3>Vorschau:</h3>
            <div
                style={{
                    border: '1px solid #ccc',
                    padding: '1rem',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa',
                    width: '100%',
                    maxWidth: '800px'
                }}
                dangerouslySetInnerHTML={{ __html: editorData }}
            />
        </div>
    );
}
