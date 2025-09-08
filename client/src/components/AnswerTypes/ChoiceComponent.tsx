import React, { useState } from 'react';
import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

interface ChoiceComponentProps {
    title: string;
}

export default function ChoiceComponent({ title }: ChoiceComponentProps) {
    const [answers, setAnswers] = useState<string[]>(['']);

    const addAnswer = () => {
        setAnswers(prev => [...prev, '']);
    };

    const removeAnswer = (index: number) => {
        setAnswers(prev => prev.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, value: string) => {
        setAnswers(prev => prev.map((ans, i) => (i === index ? value : ans)));
    };

    return (
        <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                {title}
            </Typography>
            {answers.map((answer, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TextField
                        fullWidth
                        value={answer}
                        onChange={(e) => handleChange(index, e.target.value)}
                        placeholder={`Antwort ${index + 1}`}
                        size="small"
                    />
                    <IconButton
                        aria-label="Löschen"
                        onClick={() => removeAnswer(index)}
                        disabled={answers.length === 1}
                    >
                        <Delete />
                    </IconButton>
                </Box>
            ))}

            <Button variant="outlined" startIcon={<Add />} onClick={addAnswer}>
                Antwort hinzufügen
            </Button>
        </Box>
    );
}
