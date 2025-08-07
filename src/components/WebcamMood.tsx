import React, { useRef, useEffect, useState } from 'react';

interface WebcamMoodProps {
  onMoodChange: (mood: string) => void;
}

interface EmotionPrediction {
  emotion: string;
  confidence: number;
}

const WebcamMood: React.FC<WebcamMoodProps> = ({ onMoodChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [detectedMood, setDetectedMood] = useState<string>('neutral');
  const [lastValidMood, setLastValidMood] = useState<string>('neutral');
  const [confidence, setConfidence] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const CONFIDENCE_THRESHOLD = 0.8;
  const MOOD_CHANGE_COOLDOWN = 3000; // 3 seconds between mood changes
  const [lastMoodChange, setLastMoodChange] = useState<number>(0);

  useEffect(() => {
    startWebcam();
    return () => stopWebcam();
  }, []);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        if (!isProcessing) {
          analyzeMood();
        }
      }, 2000); // Analyze every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isActive, isProcessing]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        setError('');
      }
    } catch (err) {
      setError('Camera access denied or unavailable');
      console.error('Webcam error:', err);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
  };

  const simulateEmotionDetection = (): EmotionPrediction => {
    // Simulate more realistic emotion detection with confidence scores
    const emotions = [
      { emotion: 'happy', weight: 0.3 },
      { emotion: 'sad', weight: 0.2 },
      { emotion: 'neutral', weight: 0.4 },
      { emotion: 'surprised', weight: 0.05 },
      { emotion: 'angry', weight: 0.05 }
    ];

    // Generate a random emotion with weighted probability
    const random = Math.random();
    let cumulativeWeight = 0;
    let selectedEmotion = 'neutral';

    for (const emotion of emotions) {
      cumulativeWeight += emotion.weight;
      if (random <= cumulativeWeight) {
        selectedEmotion = emotion.emotion;
        break;
      }
    }

    // Generate confidence score (higher for neutral, more variable for others)
    let confidenceScore: number;
    if (selectedEmotion === 'neutral') {
      // Neutral emotions tend to have higher confidence
      confidenceScore = 0.7 + Math.random() * 0.3; // 0.7-1.0
    } else {
      // Other emotions have more variable confidence
      confidenceScore = 0.3 + Math.random() * 0.6; // 0.3-0.9
    }

    return {
      emotion: selectedEmotion,
      confidence: confidenceScore
    };
  };

  const analyzeMood = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const prediction = simulateEmotionDetection();
      const currentTime = Date.now();
      
      setConfidence(prediction.confidence);
      
      // Check if enough time has passed since last mood change
      const timeSinceLastChange = currentTime - lastMoodChange;
      const canChangeMood = timeSinceLastChange >= MOOD_CHANGE_COOLDOWN;
      
      if (prediction.confidence >= CONFIDENCE_THRESHOLD) {
        // High confidence prediction
        if (prediction.emotion !== detectedMood && canChangeMood) {
          setDetectedMood(prediction.emotion);
          setLastValidMood(prediction.emotion);
          onMoodChange(prediction.emotion);
          setLastMoodChange(currentTime);
        }
      } else {
        // Low confidence - show neutral but keep last valid mood
        if (detectedMood !== 'neutral') {
          setDetectedMood('neutral');
          onMoodChange('neutral');
        }
      }
    } catch (error) {
      console.error('Error analyzing mood:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const retryCamera = () => {
    setError('');
    startWebcam();
  };

  if (error) {
    return (
      <div className="glass-card p-8 max-w-md text-center">
        <i className="fas fa-video-slash text-4xl opacity-60 mb-4"></i>
        <div className="text-lg font-medium mb-2">Camera Unavailable</div>
        <div className="text-sm opacity-70 mb-4">{error}</div>
        <button 
          onClick={retryCamera}
          className="px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-full hover:from-blue-500 hover:to-blue-700 transition-all duration-300"
        >
          <i className="fas fa-redo mr-2"></i>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="glass-card p-4 rounded-3xl">
        <div className="relative overflow-hidden rounded-2xl">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full max-w-md h-64 object-cover rounded-2xl mirror-effect"
            style={{ transform: 'scaleX(-1)' }} // Mirror effect
          />
          
          {/* Mood Detection Overlay */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                confidence >= CONFIDENCE_THRESHOLD ? 'bg-green-400' : 'bg-yellow-400'
              }`}></div>
              <span className="text-white text-sm font-medium bg-black/30 px-3 py-1 rounded-full">
                {confidence >= CONFIDENCE_THRESHOLD ? 'High Confidence' : 'Low Confidence'}
              </span>
            </div>
            
            {detectedMood && (
              <div className={`mood-indicator mood-${detectedMood} bg-black/30`}>
                <i className={`fas ${
                  detectedMood === 'happy' ? 'fa-smile' :
                  detectedMood === 'sad' ? 'fa-frown' :
                  detectedMood === 'angry' ? 'fa-angry' :
                  detectedMood === 'surprised' ? 'fa-surprise' :
                  'fa-meh'
                } text-white`}></i>
                {confidence < CONFIDENCE_THRESHOLD && detectedMood === 'neutral' && (
                  <span className="ml-1 text-xs opacity-70">(Low confidence)</span>
                )}
              </div>
            )}
          </div>
          
          {/* Face Detection Frame */}
          <div className="absolute inset-4 border-2 border-white/30 rounded-lg pointer-events-none">
            <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-white/60"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-white/60"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-white/60"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-white/60"></div>
          </div>
        </div>
        
        <canvas 
          ref={canvasRef} 
          className="hidden"
        />
      </div>
      
      <div className="mt-4 text-center text-sm opacity-70">
        <i className="fas fa-brain mr-2"></i>
        AI Mood Detection Active
        {confidence > 0 && (
          <span className="ml-2 text-xs">
            (Confidence: {(confidence * 100).toFixed(0)}%)
          </span>
        )}
      </div>
    </div>
  );
};

export default WebcamMood;