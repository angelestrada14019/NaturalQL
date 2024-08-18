import React from 'react';
import { useDropzone } from 'react-dropzone';
import { TextField, Button } from '@mui/material';
import { useChat } from '../../context/ChatProvider';


const DragDropDocument = ({ accept, title, textAreas, onSubmit }) => {
    const { onDrop } = useChat();
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept });

    return (
        <div>
            {accept && (
                <div {...getRootProps()} style={{ border: '2px dashed gray', padding: '20px', textAlign: 'center' }}>
                    <input {...getInputProps()} />
                    {isDragActive ? <p>Suelta los archivos aquí ...</p> : <p>{title || 'Arrastra algunos archivos aquí, o haz clic para seleccionar archivos'}</p>}
                </div>
            )}
            {textAreas && textAreas.map((textArea, index) => (
                <TextField
                    key={index}
                    multiline
                    variant="outlined"
                    placeholder={textArea.placeholder}
                    value={textArea.value}
                    onChange={event => textArea.handleMessageChange(event.target.value)}
                    margin="normal"
                    fullWidth
                />
            ))}
            {onSubmit && <Button variant="contained" color="primary" onClick={onSubmit}>Enviar</Button>}
        </div>
    );
}

export default DragDropDocument;

