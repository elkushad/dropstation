import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatWidget({ brand, product = null }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const conversationId = user ? `${brand.id}_${user.email}` : null;

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!open || !conversationId) return;
    setLoading(true);
    base44.entities.Message.filter({ conversation_id: conversationId })
      .then(msgs => {
        const sorted = (msgs || []).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        setMessages(sorted);
        setLoading(false);
      });
  }, [open, conversationId]);

  // Real-time subscription
  useEffect(() => {
    if (!open || !conversationId) return;
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id !== conversationId) return;
      if (event.type === 'create') {
        setMessages(prev => {
          if (prev.find(m => m.id === event.id)) return prev;
          return [...prev, event.data];
        });
      }
    });
    return unsub;
  }, [open, conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user || sending) return;
    setSending(true);
    const msg = {
      conversation_id: conversationId,
      brand_id: brand.id,
      brand_name: brand.name,
      buyer_email: user.email,
      sender_email: user.email,
      sender_role: 'buyer',
      content: input.trim(),
      ...(product ? { product_id: product.id, product_name: product.name } : {}),
    };
    setInput('');
    await base44.entities.Message.create(msg);
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="lg"
        className="border-zinc-700 text-zinc-300 hover:bg-white/5 rounded-full h-14 px-5 gap-2"
      >
        <MessageCircle className="w-5 h-5" />
        Contactar marca
      </Button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: '480px' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-zinc-800 border-b border-zinc-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold">
                    {brand.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{brand.name}</p>
                    {product && <p className="text-[11px] text-zinc-400 truncate max-w-[160px]">Re: {product.name}</p>}
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
                {!user ? (
                  <div className="text-center py-8">
                    <p className="text-zinc-400 text-sm">Debes iniciar sesión para chatear</p>
                    <Button
                      className="mt-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full text-xs px-4 h-8"
                      onClick={() => base44.auth.redirectToLogin()}
                    >
                      Iniciar sesión
                    </Button>
                  </div>
                ) : loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-6">
                    <MessageCircle className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-zinc-500 text-sm">Inicia la conversación con {brand.name}</p>
                    {product && (
                      <p className="text-zinc-600 text-xs mt-1">Preguntando sobre: {product.name}</p>
                    )}
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_email === user?.email ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        msg.sender_email === user?.email
                          ? 'bg-violet-600 text-white rounded-br-sm'
                          : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              {user && (
                <div className="px-3 py-3 border-t border-zinc-700 flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 flex items-center justify-center text-white transition-colors flex-shrink-0"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}