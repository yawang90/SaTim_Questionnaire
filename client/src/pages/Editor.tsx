import {useState} from 'react';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import MainLayout from "../layouts/MainLayout.tsx";
import {Box, Button, Card, CardContent, CardHeader, Chip, FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Typography} from '@mui/material';
import {Add as AddIcon, CheckBox as CheckBoxIcon, Close as CloseIcon, FormatListBulleted as ListIcon, Save as SaveIcon, TextFormat as TypeIcon, Visibility as VisibilityIcon,} from '@mui/icons-material';

type QuestionType = 'multiple-choice' | 'text' | 'yes-no';

interface Answer {
    id: string;
    text: string;
}

interface Question {
    id: string;
    title: string;
    description?: string;
    type: QuestionType;
    answers: Answer[];
    required: boolean;
}

export default function EditorPage() {
    const [editorData, setEditorData] = useState<string>('<p>Editiere hier deine Aufgabe...</p>');
    const [question, setQuestion] = useState<Question>({
        id: '1',
        title: '',
        description: '',
        type: 'multiple-choice',
        answers: [
            {id: '1', text: ''},
            {id: '2', text: ''}
        ],
        required: false
    });
    const [showPreview, setShowPreview] = useState(false);

    const addAnswer = () => {
        setQuestion(prev => ({
            ...prev,
            answers: [...prev.answers, {id: Date.now().toString(), text: ''}]
        }));
    };

    const removeAnswer = (answerId: string) => {
        if (question.answers.length > 2) {
            setQuestion(prev => ({
                ...prev,
                answers: prev.answers.filter(answer => answer.id !== answerId)
            }));
        }
    };

    const updateAnswer = (answerId: string, text: string) => {
        setQuestion(prev => ({
            ...prev,
            answers: prev.answers.map(answer =>
                answer.id === answerId ? {...answer, text} : answer
            )
        }));
    };

    const updateQuestionType = (type: QuestionType) => {
        setQuestion(prev => {
            if (type === 'yes-no') {
                return {
                    ...prev,
                    type,
                    answers: [
                        {id: 'ja', text: 'Ja'},
                        {id: 'nein', text: 'Nein'}
                    ]
                };
            } else if (type === 'text') {
                return {...prev, type, answers: []};
            } else {
                return {
                    ...prev,
                    type,
                    answers: prev.answers.length === 0
                        ? [
                            {id: '1', text: ''},
                            {id: '2', text: ''}
                        ]
                        : prev.answers
                };
            }
        });
    };

    return (
        <MainLayout>
            <Box sx={{minHeight: '100vh', backgroundColor: 'background.default', py: 3, px: 2, display: 'flex', flexDirection: 'column', mt: 6}}>
                <Box sx={{width: '100%', pl: 3}}>
                    <Card>
                    <CardHeader title={
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <Typography variant="h4">Aufgabenstellung editieren</Typography>
                                </Box>
                            }
                            sx={{borderBottom: '1px solid', borderColor: 'divider'}}
                        />
                        <CardContent sx={{p: 3, display: 'flex', flexDirection: 'column', gap: 3, width: '1450px'}}>
                            {/* CKEditor */}
                            <CKEditor
                                editor={ClassicEditor}
                                data={editorData}
                                onChange={(_, editor) => setEditorData(editor.getData())}
                            />

                            {/* Question Type */}
                            <FormControl fullWidth>
                                <InputLabel>Frage Typ</InputLabel>
                                <Select
                                    value={question.type}
                                    label="Frage Typ"
                                    onChange={(e) => updateQuestionType(e.target.value as QuestionType)}
                                >
                                    <MenuItem value="multiple-choice">
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <ListIcon sx={{fontSize: 16}}/>
                                            Multiple Choice
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="text">
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <TypeIcon sx={{fontSize: 16}}/>
                                            Text Antwort
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="yes-no">
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <CheckBoxIcon sx={{fontSize: 16}}/>
                                            Ja/Nein
                                        </Box>
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            {/* Answers */}
                            {(question.type === 'multiple-choice' || question.type === 'yes-no') && (
                                <Box>
                                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                                        <Typography variant="h6">Antwort Optionen</Typography>
                                        {question.type === 'multiple-choice' && (
                                            <Button
                                                onClick={addAnswer}
                                                variant="outlined"
                                                size="small"
                                                startIcon={<AddIcon/>}
                                            >
                                                Option hinzufügen
                                            </Button>
                                        )}
                                    </Box>

                                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                        {question.answers.map((answer, index) => (
                                            <Box
                                                key={answer.id}
                                                sx={{display: 'flex', alignItems: 'center', gap: 1}}
                                            >
                                                <Chip label={index + 1} variant="outlined" size="small"/>
                                                <TextField
                                                    placeholder={`Option ${index + 1}`}
                                                    value={answer.text}
                                                    onChange={(e) => updateAnswer(answer.id, e.target.value)}
                                                    size="small"
                                                    fullWidth
                                                    disabled={question.type === 'yes-no'}
                                                />
                                                {question.type === 'multiple-choice' &&
                                                    question.answers.length > 2 && (
                                                        <IconButton
                                                            onClick={() => removeAnswer(answer.id)}
                                                            size="small"
                                                            sx={{
                                                                color: 'text.secondary',
                                                                '&:hover': {color: 'error.main'},
                                                            }}
                                                        >
                                                            <CloseIcon/>
                                                        </IconButton>
                                                    )}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Buttons */}
                            <Box sx={{display: 'flex', gap: 2}}>
                                <Button
                                    onClick={() => setShowPreview(!showPreview)}
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<VisibilityIcon/>}
                                >
                                    {showPreview ? 'Vorschau verstecken' : 'Vorschau'}
                                </Button>
                                <Button variant="contained" fullWidth startIcon={<SaveIcon/>}>
                                    Frage speichern
                                </Button>
                            </Box>

                            {/* Preview */}
                            {showPreview && (
                                <Box>
                                    <Typography variant="h6" sx={{mb: 1}}>
                                        Vorschau:
                                    </Typography>
                                    <Box
                                        sx={{
                                            border: '1px solid #ccc',
                                            p: 2,
                                            borderRadius: 1,
                                            backgroundColor: '#fafafa',
                                        }}
                                        dangerouslySetInnerHTML={{__html: editorData}}
                                    />
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </MainLayout>
    );
}
