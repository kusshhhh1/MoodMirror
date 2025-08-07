import React, { useEffect, useState } from 'react';

interface QuoteDisplayProps {
  quote: string;
  mood: string;
}

const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ quote, mood }) => {
  const [displayQuote, setDisplayQuote] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (quote && quote !== displayQuote) {
      typeWriter(quote);
    }
  }, [quote]);

  const typeWriter = (text: string) => {
    setIsTyping(true);
    setDisplayQuote('');
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayQuote(prev => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 30); // Typing speed
  };

  const getMoodGradient = (mood: string) => {
    const gradients = {
      happy: 'from-green-400 via-blue-500 to-purple-600',
      sad: 'from-blue-400 via-blue-600 to-indigo-800',
      angry: 'from-red-400 via-pink-500 to-red-600',
      neutral: 'from-gray-400 via-gray-600 to-gray-800',
      surprised: 'from-yellow-400 via-orange-500 to-red-500'
    };
    return gradients[mood as keyof typeof gradients] || gradients.neutral;
  };

  if (!quote) {
    return null;
  }

  return (
    <div className="glass-card p-8 max-w-2xl mx-auto text-center relative">
      {/* Quote Icon */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-gradient-to-r from-pink-400 to-purple-600 rounded-full p-3">
          <i className="fas fa-quote-left text-white text-lg"></i>
        </div>
      </div>
      
      {/* Quote Text */}
      <div className="pt-6">
        <p className={`text-lg md:text-xl font-medium leading-relaxed bg-gradient-to-r ${getMoodGradient(mood)} bg-clip-text text-transparent`}>
          {displayQuote}
          {isTyping && <span className="animate-pulse">|</span>}
        </p>
        
        {/* Mood-based decoration */}
        <div className="flex justify-center mt-6 space-x-2">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className={`w-2 h-2 rounded-full bg-gradient-to-r ${getMoodGradient(mood)} opacity-60`}
              style={{
                animationDelay: `${i * 0.1}s`,
                animation: 'pulse 2s infinite'
              }}
            />
          ))}
        </div>
        
        {/* AI Attribution */}
        <div className="mt-4 text-xs opacity-50 flex items-center justify-center">
          <i className="fas fa-robot mr-2"></i>
          <span>Generated with ❤️ by kushagra</span>
        </div>
      </div>
    </div>
  );
};

export default QuoteDisplay;