import React, { useEffect, useRef, useState } from 'react';
import Clock from './Clock';
import Weather from './Weather';
import WebcamMood from './WebcamMood';
import VoiceAssistant from './VoiceAssistant';
import QuoteDisplay from './QuoteDisplay';

const MoodMirror: React.FC = () => {
  const [currentMood, setCurrentMood] = useState<string>('neutral');
  const [isListening, setIsListening] = useState(false);
  const [quote, setQuote] = useState('');

  const motivationalQuotes = {
    happy: [
      "Your smile is your superpower! Keep shining bright! ✨",
      "Happiness looks beautiful on you! Spread that joy! 😊",
      "You're radiating positive energy - the world needs more of that! 🌟"
    ],
    sad: [
      "Every storm runs out of rain. This feeling will pass. 🌈",
      "You're stronger than you know. Take it one moment at a time. 💪",
      "It's okay to not be okay. Be gentle with yourself today. 🤗"
    ],
    angry: [
      "Take a deep breath. You have the power to choose peace. 🧘‍♀️",
      "Your feelings are valid. Channel that energy into something positive. ⚡",
      "Sometimes we need to feel the fire to appreciate the calm. 🔥"
    ],
    neutral: [
      "You look great today! Ready to make it amazing? ✨",
      "Every new moment is a chance for something wonderful. 🌅",
      "You have everything within you to create a beautiful day. 🎨"
    ],
    surprised: [
      "Life is full of wonderful surprises - embrace them! 🎉",
      "Your curiosity and wonder make you special. Stay amazed! 👀",
      "Surprise moments often lead to the best memories. 📸"
    ]
  };

  useEffect(() => {
    if (currentMood && motivationalQuotes[currentMood as keyof typeof motivationalQuotes]) {
      const quotes = motivationalQuotes[currentMood as keyof typeof motivationalQuotes];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);
    }
  }, [currentMood]);

  const handleMoodChange = (mood: string) => {
    setCurrentMood(mood);
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('how do i look') || lowerCommand.includes('how am i looking')) {
      const responses = [
        `You look ${currentMood === 'happy' ? 'absolutely radiant' : currentMood === 'sad' ? 'thoughtful and beautiful' : 'wonderful'} today!`,
        `Looking ${currentMood}! And that's perfectly fine - you're beautiful just as you are.`,
        `I can see you're feeling ${currentMood} right now, and you still look amazing!`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (lowerCommand.includes('give me a quote') || lowerCommand.includes('motivate me')) {
      return quote || "You are capable of amazing things!";
    }
    
    if (lowerCommand.includes('weather') || lowerCommand.includes('temperature')) {
      return "Check the weather widget in the top right corner for current conditions!";
    }
    
    if (lowerCommand.includes('time') || lowerCommand.includes('clock')) {
      const now = new Date();
      return `The time is ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
    
    return "I'm here to help! You can ask me how you look, request a motivational quote, or ask about the time.";
  };

  return (
    <div className="min-h-screen relative p-4 md:p-8">
      {/* Background blur overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
      
      {/* Main Layout - Changed from grid to flex for better scrollability */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Top Section - Clock and Weather */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          {/* Top Left - Clock */}
          <div className="w-full md:w-auto mb-4 md:mb-0">
            <Clock />
          </div>

          {/* Top Right - Weather */}
          <div className="w-full md:w-auto">
            <Weather />
          </div>
        </div>

        {/* Center Section - Webcam and Mood Detection */}
        <div className="flex flex-col items-center justify-center space-y-6 mb-8">
          <WebcamMood onMoodChange={handleMoodChange} />
          
          {/* Current Mood Indicator */}
          {currentMood && (
            <div className={`mood-indicator mood-${currentMood} fade-in`}>
              <i className={`fas ${
                currentMood === 'happy' ? 'fa-smile' :
                currentMood === 'sad' ? 'fa-frown' :
                currentMood === 'angry' ? 'fa-angry' :
                currentMood === 'surprised' ? 'fa-surprise' :
                'fa-meh'
              }`}></i>
              <span className="ml-2">Feeling {currentMood}</span>
            </div>
          )}
        </div>

        {/* Quote Display Section */}
        <div className="flex justify-center mb-8">
          <QuoteDisplay quote={quote} mood={currentMood} />
        </div>

        {/* Bottom Section - Voice Assistant */}
        <div className="flex justify-center mt-auto">
          <VoiceAssistant 
            onCommand={handleVoiceCommand}
            isListening={isListening}
            setIsListening={setIsListening}
          />
        </div>
      </div>
    </div>
  );
};

export default MoodMirror;