import React from 'react';
import clsx from 'clsx';

interface TypingIndicatorProps {
  showAvatar?: boolean;
  primaryColor?: string;
  chatbotAvatar?: string | null;
}

export function TypingIndicator({
  showAvatar = true,
  primaryColor = '#007bff',
  chatbotAvatar = null,
}: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 mb-6 group animate-slideIn">
      {/* Avatar */}
      {showAvatar && (
        <div className="shrink-0 relative">
          <div
            className={clsx(
              'w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden',
              'shadow-lg border-2 border-white/20 backdrop-blur-sm',
              'transform transition-all duration-200'
            )}
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`
            }}
          >
            {chatbotAvatar ? (
               <img src={chatbotAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              "AI"
            )}
          </div>
          {/* Animated pulse for typing */}
          <div className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ backgroundColor: primaryColor }} />
          {/* Online pulse indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3">
            <div className="w-full h-full bg-orange-400 rounded-full border-2 border-white animate-pulse" />
          </div>
        </div>
      )}

      {/* Typing bubble */}
      <div className="relative bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-md border border-gray-100 max-w-[85%]">
        <div className="flex items-center space-x-2">
          {/* Typing animation dots */}
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-typing"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '1.4s'
                }}
              />
            ))}
          </div>

          {/* Typing text */}
          <span className="text-sm text-gray-500 font-medium animate-pulse">
            AI is typing...
          </span>
        </div>

        {/* Message tail */}
        <div className="absolute -left-1 bottom-4 w-3 h-3 bg-white border-l border-b border-gray-100 transform rotate-45" />

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-2xl rounded-bl-md bg-linear-to-r from-transparent via-blue-50/30 to-transparent animate-pulse" />
      </div>
    </div>
  );
}