import React, { useState, useRef, useEffect } from 'react';

interface VoiceAssistantProps {
  onCommand: (command: string) => string;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onCommand, isListening, setIsListening }) => {
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript;
      setTranscript(command);

      if (event.results[last].isFinal) {
        processCommand(command);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      setTranscript('');
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setTranscript('');
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const processCommand = (command: string) => {
    const response = onCommand(command);
    speakResponse(response);
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Try to use a pleasant voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Samantha') || 
        voice.name.includes('Karen') || 
        voice.name.includes('Female') ||
        (voice.lang.includes('en') && voice.name.includes('Google'))
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center text-sm opacity-60">
        <i className="fas fa-microphone-slash text-2xl mb-2"></i>
        <div>Voice features not supported in this browser</div>
      </div>
    );
  }

  return (
    <div className="text-center">
      {/* Transcript Display */}
      {transcript && (
        <div className="glass-card p-4 mb-4 max-w-md mx-auto">
          <div className="text-sm opacity-80 mb-2">Listening...</div>
          <div className="font-medium">"{transcript}"</div>
        </div>
      )}

      {/* Voice Assistant Button */}
      <button
        onClick={toggleListening}
        className={`floating-button w-16 h-16 text-2xl ${isListening ? 'pulse' : ''} ${isSpeaking ? 'animate-bounce' : ''}`}
        disabled={isSpeaking}
      >
        <i className={`fas ${
          isSpeaking ? 'fa-volume-up text-purple-600' :
          isListening ? 'fa-microphone text-red-500' : 
          'fa-microphone text-gray-600'
        }`}></i>
      </button>

      {/* Status Text */}
      <div className="mt-3 text-sm opacity-70">
        {isSpeaking ? (
          <div className="flex items-center justify-center">
            <i className="fas fa-volume-up mr-2 animate-pulse"></i>
            Speaking...
          </div>
        ) : isListening ? (
          <div className="flex items-center justify-center">
            <i className="fas fa-circle text-red-500 mr-2 animate-pulse"></i>
            Listening... Tap to stop
          </div>
        ) : (
          <div>
            <div className="font-medium">Tap to speak</div>
            <div className="text-xs opacity-50 mt-1">
              Try: "How do I look?" or "Give me a quote"
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;