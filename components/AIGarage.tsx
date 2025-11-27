
import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage, ContactInfo } from '../types';
import { GenerateContentResponse } from '@google/genai';

interface AIGarageProps {
  contactInfo: ContactInfo;
}

const AIGarage: React.FC<AIGarageProps> = ({ contactInfo }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: `Welcome to Helix Motorcycles. I'm ${contactInfo.owner}'s virtual assistant. Need info on our Cerakote services, engine rebuilds, or want to book a free consultation?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create a placeholder for the model response
      const modelMessageId = (Date.now() + 1).toString();
      setMessages(prev => [
        ...prev,
        {
          id: modelMessageId,
          role: 'model',
          text: '',
          timestamp: new Date()
        }
      ]);

      const stream = await sendMessageToGemini(userMessage.text);

      let fullText = '';

      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        const textChunk = c.text || '';
        fullText += textChunk;

        setMessages(prev => prev.map(msg =>
          msg.id === modelMessageId
            ? { ...msg, text: fullText }
            : msg
        ));
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          text: "I'm having trouble connecting to the workshop server. Please give us a call at " + contactInfo.phone,
          timestamp: new Date(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section id="mechanic" className="py-20 bg-garage-950 flex justify-center px-4">
      <div className="w-full max-w-4xl bg-garage-900 border border-garage-700 shadow-2xl overflow-hidden rounded-sm flex flex-col md:flex-row h-[600px]">

        {/* Sidebar / Info Panel */}
        <div className="w-full md:w-1/3 bg-garage-800 p-6 border-b md:border-b-0 md:border-r border-garage-700 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center mb-6">
              <div className="bg-bronze-600 p-2 rounded-full mr-3">
                <svg className="text-white h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="16" height="16" x="4" y="4" rx="2" /><rect width="6" height="6" x="9" y="9" rx="1" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg uppercase">Assistant</h3>
                <span className="text-green-500 text-xs font-mono flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  ONLINE
                </span>
              </div>
            </div>
            <p className="text-garage-400 text-sm mb-4 font-mono leading-relaxed">
              Have a question about Cerakote colors or need a quote for an engine rebuild? Ask me anything.
            </p>
            <div className="bg-garage-900 p-4 border border-garage-700 rounded-sm">
              <p className="text-xs text-garage-500 uppercase mb-2">Workshop Status</p>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs text-garage-300">
                  <span>Owner:</span>
                  <span className="text-bronze-500">{contactInfo.owner}</span>
                </div>
              </div>
              <p className="text-xs text-garage-500 uppercase mb-2 border-t border-garage-800 pt-2">Opening Hours</p>
              <div className="space-y-1">
                {contactInfo.openingHoursSpec ? (
                  <>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => (
                      <div key={day} className="flex justify-between text-xs text-garage-300 font-mono">
                        <span className="capitalize">{day}</span>
                        <span className="text-white">{contactInfo.openingHoursSpec![day as keyof typeof contactInfo.openingHoursSpec]}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs text-bronze-500 font-mono pt-1">
                      <span>Weekends</span>
                      <span>{contactInfo.openingHoursSpec.weekends}</span>
                    </div>
                  </>
                ) : (
                  <>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                      <div key={day} className="flex justify-between text-xs text-garage-300 font-mono">
                        <span>{day}</span>
                        <span className="text-white">09:00 - 22:00</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs text-bronze-500 font-mono pt-1">
                      <span>Weekends</span>
                      <span>By Appt.</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 md:mt-0">
            <p className="text-[10px] text-garage-500 text-center">Powered by Google Gemini</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-black/20">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-lg p-4 ${msg.role === 'user'
                  ? 'bg-garage-700 text-white rounded-br-none'
                  : 'bg-bronze-900/20 border border-bronze-500/30 text-garage-200 rounded-bl-none'
                  }`}>
                  <div className="flex items-center mb-1 space-x-2">
                    {msg.role === 'user' ? (
                      <svg className="text-garage-400 h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    ) : (
                      <svg className="text-bronze-500 h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="16" height="16" x="4" y="4" rx="2" /><rect width="6" height="6" x="9" y="9" rx="1" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" />
                      </svg>
                    )}
                    <span className="text-[10px] font-mono uppercase text-garage-500">
                      {msg.role === 'user' ? 'YOU' : 'HELIX AI'}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1].role === 'user' && (
              <div className="flex justify-start">
                <div className="bg-garage-800 rounded-lg p-4 rounded-bl-none flex items-center">
                  <svg className="animate-spin text-bronze-500 mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span className="text-xs text-garage-400 font-mono">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-garage-900 border-t border-garage-700">
            <div className="flex items-center bg-garage-950 border border-garage-700 rounded-md px-4 py-2 focus-within:border-bronze-500 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about prices, cerakote, or location..."
                className="flex-1 bg-transparent text-white placeholder-garage-600 focus:outline-none text-sm font-mono"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="ml-2 text-bronze-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AIGarage;
