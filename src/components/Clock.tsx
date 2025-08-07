import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="glass-card p-6 max-w-xs">
      <div className="text-center">
        <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
          {formatTime(time)}
        </div>
        <div className="text-sm md:text-base opacity-80 font-medium">
          {formatDate(time)}
        </div>
      </div>
    </div>
  );
};

export default Clock;