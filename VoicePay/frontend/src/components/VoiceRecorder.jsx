import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader } from 'lucide-react';
import './VoiceRecorder.css';

const VoiceRecorder = ({ onRecordingComplete, actionText = "Record Voice" }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                onRecordingComplete(audioBlob);

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            setAudioUrl(null);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= 9) { // Auto stop after 10 seconds
                        stopRecording();
                        return 10;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Microphone access is required for voice authentication.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    return (
        <div className="voice-recorder">
            <div className={`recorder-circle ${isRecording ? 'recording' : ''}`}>
                {isRecording ? (
                    <button type="button" onClick={stopRecording} className="btn-stop" aria-label="Stop Recording">
                        <Square size={32} />
                    </button>
                ) : (
                    <button type="button" onClick={startRecording} className="btn-record" aria-label="Start Recording">
                        <Mic size={32} />
                    </button>
                )}
            </div>

            <div className="recorder-status">
                {isRecording ? (
                    <span className="recording-text">Recording... 00:{recordingTime.toString().padStart(2, '0')}</span>
                ) : audioUrl ? (
                    <div className="audio-preview">
                        <span className="success-text">Voice captured successfully!</span>
                        <audio controls src={audioUrl} className="custom-audio" />
                        <button type="button" onClick={startRecording} className="btn-retry">Retake</button>
                    </div>
                ) : (
                    <span className="idle-text">{actionText} (5-10 seconds)</span>
                )}
            </div>
        </div>
    );
};

export default VoiceRecorder;
