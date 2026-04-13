'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { VoiceButton } from './VoiceButton';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onVoiceMessage?: (blob: Blob) => Promise<void>;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  primaryColor?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function MessageInput({
  onSendMessage,
  onVoiceMessage,
  placeholder = 'Type your message here...',
  maxLength = 2000,
  disabled = false,
  primaryColor = '#007bff',
  value,
  onChange
}: MessageInputProps) {
  const [internalMessage, setInternalMessage] = useState('');
  const message = value !== undefined ? value : internalMessage;
  const setMessage = onChange !== undefined ? onChange : setInternalMessage;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSendMessage(trimmed);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
    }

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const characterCount = message.length;
  const isNearLimit = characterCount > maxLength * 0.8;

  return (
    <div className="p-4 border-t border-gray-100/50 bg-linear-to-t from-gray-50/30 to-white backdrop-blur-sm">
      <div className="flex gap-2 items-end">
        {/* Text input container */}
        <div className="flex-1 relative">
          {/* Floating placeholder */}
          {!message && !disabled && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none transition-all duration-200">
              {placeholder}
            </div>
          )}

          <div className="flex">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder=""
              disabled={disabled}
              rows={1}
              className={clsx(
                'w-full px-4 py-3 border-2 rounded-2xl resize-none transition-all duration-200',
                'focus:outline-none focus:ring-0 focus:border-opacity-100',
                'placeholder-transparent text-sm leading-5 font-medium',
                'shadow-sm hover:shadow-md focus:shadow-lg',
                disabled
                  ? 'bg-gray-50 text-gray-400 border-gray-200'
                  : 'bg-white text-gray-900 border-gray-200 hover:border-gray-300 focus:border-blue-400'
              )}
              style={{
                minHeight: '44px',
                maxHeight: '120px',
                ...(message && !disabled ? {
                  borderColor: primaryColor + '60',
                  boxShadow: `0 0 0 1px ${primaryColor}20`
                } : {})
              }}
            />

            {/* Input border gradient overlay */}
            {message && !disabled && (
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-200"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}10, transparent, ${primaryColor}10)`,
                  border: `1px solid ${primaryColor}30`
                }}
              />
            )}
          </div>

          {/* Character counter */}
          {isNearLimit && (
            <div className={clsx(
              'absolute -top-7 right-2 px-2 py-1 rounded-md text-xs font-medium',
              'bg-white shadow-sm border',
              characterCount >= maxLength
                ? 'text-red-600 border-red-200 bg-red-50'
                : 'text-amber-600 border-amber-200 bg-amber-50'
            )}>
              {characterCount}/{maxLength}
            </div>
          )}
        </div>

        {/* Voice button */}
        {onVoiceMessage && (
          <VoiceButton
            onAudioReady={onVoiceMessage}
            disabled={disabled}
            primaryColor={primaryColor}
          />
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim() || characterCount > maxLength}
          className={clsx(
            'relative p-3 rounded-xl transition-all duration-200 overflow-hidden group',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400',
            'shadow-lg hover:shadow-xl',
            disabled || !message.trim() || characterCount > maxLength
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'text-white hover:scale-105 active:scale-95'
          )}
          style={!(disabled || !message.trim() || characterCount > maxLength) ? {
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
            boxShadow: `0 4px 14px ${primaryColor}40`
          } : {}}
        >
          {/* Shimmer hover effect */}
          {!(disabled || !message.trim() || characterCount > maxLength) && (
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}

          <PaperAirplaneIcon className="w-5 h-5 relative z-10 transform group-hover:rotate-12 transition-transform duration-200" />

          {/* Send ripple */}
          {message.trim() && !disabled && (
            <div className="absolute inset-0 rounded-xl opacity-0 group-active:opacity-100 group-active:animate-ping transition-opacity duration-150"
                 style={{ backgroundColor: primaryColor + '40' }} />
          )}
        </button>
      </div>

      {/* Quick suggestions */}
      {!message && !disabled && (
        <div className="flex gap-2 mt-3 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          {['Hello!', 'How can I help?', 'Tell me more'].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setMessage(suggestion)}
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}