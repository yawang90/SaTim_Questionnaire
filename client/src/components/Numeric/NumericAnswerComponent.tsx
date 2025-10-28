import React, { useRef, useEffect, useState } from 'react'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { TextField, Box, Popover, Button, InputAdornment, IconButton } from '@mui/material'
import FunctionsIcon from '@mui/icons-material/Functions'

export const NumericAnswerComponent: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
    const mode: 'numeric' | 'algebra' = node.attrs.mode || 'numeric'
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [value, setValue] = useState(node.attrs.value || '')
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [value])

    const handleOpenKeyboard = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
    const handleCloseKeyboard = () => setAnchorEl(null)
    const open = Boolean(anchorEl)

    return (
        <NodeViewWrapper as="span" className="numeric-input" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 0', margin: '0 2px' }}>
            {mode === 'numeric' ? (
                <TextField
                    value={value}
                    id={node.attrs.id}
                    onChange={e => {
                        const cleaned = e.target.value.replace(/[^0-9.,-]/g, '')
                        setValue(cleaned)
                        updateAttributes({ value: cleaned })
                    }}
                    placeholder="123.."
                    size="small"
                    variant="outlined"
                    inputRef={textareaRef}
                    sx={{ width: 150 }}
                />
            ) : (
                <TextField
                    value={value}
                    onChange={e => {
                       const newVal = e.target.value
                        setValue(newVal)
                        updateAttributes({ value: newVal })
                    }}
                    id={node.attrs.id}
                    placeholder="x+y"
                    size="small"
                    variant="outlined"
                    inputRef={textareaRef}
                    sx={{ width: 150 }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={handleOpenKeyboard}>
                                    <FunctionsIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            )}

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleCloseKeyboard}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box sx={{ p: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                    {['x', 'y', '+', '-', '*', '/', '^', '=', '√'].map(symbol => (
                        <Button
                            key={symbol}
                            size="small"
                            variant="outlined"
                            onClick={() => {
                                const newVal = value + symbol
                                setValue(newVal)
                                updateAttributes({ value: newVal })
                            }}
                        >
                            {symbol}
                        </Button>
                    ))}
                </Box>
            </Popover>
        </NodeViewWrapper>
    )
}
