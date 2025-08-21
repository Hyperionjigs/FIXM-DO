'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { VoiceUI } from '@/lib/animation-library';
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, Send } from 'lucide-react';

export interface VoiceInterfaceProps {
  onCommand?: (command: string) => void;
  onMessage?: (message: string) => void;
  enabled?: boolean;
  autoStart?: boolean;
  showChat?: boolean;
  className?: string;
  placeholder?: string;
  commands?: Array<{
    phrase: string;
    action: () => void;
    description: string;
  }>;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type: 'text' | 'voice';
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onCommand,
  onMessage,
  enabled = true,
  autoStart = false,
  showChat = true,
  className,
  placeholder = 'Say something or type a message...',
  commands = [],
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [voiceUI] = useState(() => new VoiceUI());
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize voice commands
  useEffect(() => {
    if (!enabled) return;

    // Add default commands
    voiceUI.addVoiceCommand('hello', () => {
      speak('Hello! How can I help you today?');
    });

    voiceUI.addVoiceCommand('help', () => {
      speak('I can help you with various tasks. Try saying "hello" or ask me a question.');
    });

    voiceUI.addVoiceCommand('stop listening', () => {
      stopListening();
    });

    // Add custom commands
    commands.forEach(({ phrase, action }) => {
      voiceUI.addVoiceCommand(phrase, action);
    });

    // Auto-start if enabled
    if (autoStart) {
      startListening();
    }

    return () => {
      voiceUI.stopListening();
    };
  }, [enabled, autoStart, commands, voiceUI]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const startListening = () => {
    if (!enabled) return;

    setIsListening(true);
    setTranscript('');
    voiceUI.startListening();
    
    // Add visual feedback
    addMessage({
      id: Date.now().toString(),
      text: 'Listening...',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'voice',
    });
  };

  const stopListening = () => {
    setIsListening(false);
    voiceUI.stopListening();
    
    if (transcript.trim()) {
      addMessage({
        id: Date.now().toString(),
        text: transcript,
        sender: 'user',
        timestamp: new Date(),
        type: 'voice',
      });
      
      onCommand?.(transcript);
      setTranscript('');
    }
  };

  const speak = (text: string) => {
    if (!enabled) return;

    setIsSpeaking(true);
    voiceUI.speak(text, {
      onend: () => setIsSpeaking(false),
      onerror: () => setIsSpeaking(false),
    });
    
    addMessage({
      id: Date.now().toString(),
      text,
      sender: 'assistant',
      timestamp: new Date(),
      type: 'text',
    });
  };

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    addMessage(message);
    onMessage?.(inputText);
    setInputText('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className={cn('fixed bottom-4 right-4 z-50', className)}>
      {/* Voice Control Button */}
      <div className="flex flex-col items-end gap-2">
        {/* Chat Toggle Button */}
        {showChat && (
          <button
            onClick={toggleChat}
            className={cn(
              'p-3 rounded-full shadow-lg transition-all duration-300',
              'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
              'hover:shadow-xl hover:scale-105',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              isChatOpen && 'bg-blue-500 text-white'
            )}
            aria-label="Toggle chat"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}

        {/* Voice Button */}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={!enabled}
          className={cn(
            'p-4 rounded-full shadow-lg transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            {
              'bg-red-500 text-white hover:bg-red-600': isListening,
              'bg-blue-500 text-white hover:bg-blue-600': !isListening && enabled,
              'bg-gray-400 text-gray-600 cursor-not-allowed': !enabled,
              'animate-pulse': isListening,
              'hover:scale-105': enabled && !isListening,
            }
          )}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="flex items-center gap-2 p-2 bg-green-500 text-white rounded-full shadow-lg">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Speaking...</span>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      {showChat && isChatOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Voice Assistant</h3>
            <button
              onClick={toggleChat}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <Mic className="w-8 h-8 mx-auto mb-2" />
                <p>Start a conversation by speaking or typing</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-xs px-3 py-2 rounded-lg',
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {message.type === 'voice' && (
                        <Mic className="w-3 h-3" />
                      )}
                      <span className="text-sm">{message.text}</span>
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Display */}
      {isListening && transcript && (
        <div className="absolute bottom-20 right-0 max-w-xs p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">You said:</div>
          <div className="text-gray-900 dark:text-white">{transcript}</div>
        </div>
      )}
    </div>
  );
};

export { VoiceInterface }; 