"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  Sparkles, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useConfig } from '@/hooks/use-config';
import { isAdmin } from '@/lib/admin-config';

interface FixmotechAssistantProps {
  context: 'post' | 'verification' | 'payment' | 'general' | 'admin';
  className?: string;
  title?: string;
  placeholder?: string;
  showSuggestions?: boolean;
  maxHeight?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
  contextAwareInfo?: {
    isMaintenanceMode?: boolean;
    verificationStatus?: string;
    paymentStatus?: string;
    aiModelInfo?: string;
  };
  confidence?: number;
  requiresAction?: boolean;
  actionType?: string;
}

export function FixmotechAssistant({
  context,
  className = '',
  title = 'Fixmotech Assistant',
  placeholder = 'Ask me anything about the platform...',
  showSuggestions = true,
  maxHeight = '400px'
}: FixmotechAssistantProps) {
  const { user } = useAuth();
  const { config } = useConfig();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine user role
  const userRole = user ? (isAdmin(user.uid, user.email || null) ? 'admin' : 'user') : 'user';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/fixmotech-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: input.trim(),
          context,
          userRole,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        suggestions: data.suggestions,
        contextAwareInfo: data.contextAwareInfo,
        confidence: data.confidence,
        requiresAction: data.requiresAction,
        actionType: data.actionType,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const getContextIcon = () => {
    switch (context) {
      case 'post': return <MessageCircle className="h-4 w-4" />;
      case 'verification': return <CheckCircle className="h-4 w-4" />;
      case 'payment': return <Zap className="h-4 w-4" />;
      case 'admin': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getContextColor = () => {
    switch (context) {
      case 'post': return 'bg-blue-500';
      case 'verification': return 'bg-green-500';
      case 'payment': return 'bg-yellow-500';
      case 'admin': return 'bg-red-500';
      default: return 'bg-purple-500';
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-50 rounded-full p-3 shadow-lg ${getContextColor()} hover:opacity-90`}
        size="lg"
      >
        <Bot className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-4 right-4 z-50 w-96 shadow-xl ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getContextIcon()}
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {context}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ScrollArea className="h-64 w-full rounded-md border p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-muted-foreground">
              <div className="space-y-2">
                <Bot className="mx-auto h-8 w-8" />
                <p className="text-sm">How can I help you today?</p>
                <p className="text-xs">I'm context-aware and can assist with {context} related questions.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    
                    {message.contextAwareInfo && (
                      <div className="mt-2 space-y-1">
                        {message.contextAwareInfo.isMaintenanceMode && (
                          <Badge variant="destructive" className="text-xs">
                            🛠️ Maintenance Mode
                          </Badge>
                        )}
                        {message.contextAwareInfo.verificationStatus && (
                          <Badge variant="outline" className="text-xs">
                            ✅ {message.contextAwareInfo.verificationStatus}
                          </Badge>
                        )}
                        {message.contextAwareInfo.paymentStatus && (
                          <Badge variant="outline" className="text-xs">
                            💳 {message.contextAwareInfo.paymentStatus}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {message.suggestions && showSuggestions && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Suggestions:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.suggestions.map((suggestion, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {message.confidence && (
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {Math.round(message.confidence * 100)}%
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg bg-muted p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 