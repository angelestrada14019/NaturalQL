import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { FaMicrophone, FaStop } from 'react-icons/fa';

const Speech = ({ onTranscriptChange, isListening, setIsListening }) => {
    const { transcript } = useSpeechRecognition();
    const [lastTranscript, setLastTranscript] = useState("");

    useEffect(() => {
        if (isListening) {
            SpeechRecognition.startListening({
                continuous: true,
                language: 'es-ES',
            });
        } else {
            SpeechRecognition.stopListening();
        }
    }, [isListening]);

    useEffect(() => {
        if (transcript !== lastTranscript && isListening) {
            onTranscriptChange(transcript);
            setLastTranscript(transcript);
        }
    }, [transcript, lastTranscript, onTranscriptChange, isListening]);

    const toggleListening = () => {
        setIsListening(!isListening);
        if (!isListening) {
            SpeechRecognition.resetTranscript();
        }
    };

    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        return <div>El navegador no soporta el reconocimiento de voz.</div>;
    }

    return (
        <div onClick={toggleListening}>
            {isListening ? <FaStop className="microphone-icon" /> : <FaMicrophone className="microphone-icon" />}
        </div>
    );
};

export default Speech;
