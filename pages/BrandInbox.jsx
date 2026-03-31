import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function BrandInbox() {
  const [user, setUser] = useState(null);
  const [brand, setBrand] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.Brand.filter({ created_by: u.email }).then(brands => {
        if (brands?.[0]) setBrand(brands[0]);
      });
    });
  }, []);

  useEffect(() => {
    if (!brand) return;
    base44.entities.Message.filter({ brand_id: brand.id })
      .then(msgs => {
        const grouped = {};
        (msgs || []).forEach(m => {
          if (!grouped[m.conversation_id]) {
            grouped[m.conversation_id] = {
              conversation_id: m.conversation_id,
              buyer_email: m.buyer_email,
              last_message: m.content,
              last_date: m.created_date,
            };
          } else if (new Date(m.created_date) > new Date(grouped[m.conversation_id].last_date)) {
            grouped[m.conversation_id].last_message = m.content;
            grouped[m.conversation_id].last_date = m.created_date;
          }
        });
        setConversations(Object.values(grouped).sort((a, b) => new Date(b.last_date) - new Date(a.last_date)));
      });
  }, [brand]);

  useEffect(() => {
    if (!selected || !brand) return;
    base44.entities.Message.filter({ conversation_id: selected.conversation_id })
      .then(msgs => {
        setMessages((msgs || []).sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
      });
  }, [selected]);

  // Real-time
  useEffect(() => {
    if (!brand) return;
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.brand_id !== brand.id) return;
      if (event.type === 'create') {
        // Update conversations list
        setConversations(prev => {
          const existing = prev.find(c => c.conversation_id === event.data.conversation_id);
          if (existing) {
            return prev.map(c => c.conversation_id === event.data.conversation_id
              ? { ...c, last_message: event.data.content, last_date: event.data.created_date }
              : c
            ).sort((a, b) => new Date(b.last_date) - new Date(a.last_date));
          }
          return [{
            conversation_id: event.data.conversation_id,
            buyer_email: event.data.buyer_email,
            last_message: event.data.content,
            last_date: event.data.created_date,
          }, ...prev];
        });
        // Update messages if viewing this conversation
        if (selected?.conversation_id === event.data.conversation_id) {
          setMessages(prev => prev.find(m => m.id === event.id) ? prev : [...prev, event.data]);
        }
      }
    });
    return unsub;
  }, [brand, selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendReply = async () => {
    if (!input.trim() || !user || !brand || !selected || sending) return;
    setSending(true);
    await base44.entities.Message.create({
      conversation_id: selected.conversation_id,
      brand_id: brand.id,
      brand_name: brand.name,
      buyer_email: selected.buyer_email,
      sender_email: user.email,
      sender_role: 'brand',
      content: input.trim(),
    });
    setInput('');
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }
  };

  if (!user || !brand) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500 mx-auto mb-4" />
        <p className="text-zinc-500">Cargando bandeja de entrada...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/BrandDashboard" className="text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-black text-white">Mensajes</h1>
        <span className="text-zinc-500 text-sm">({conversations.length} conversaciones)</span>
      </div>

      <div className="grid md:grid-cols-5 gap-4 h-[600px]">
        {/* Conversations list */}
        <div className="md:col-span-2 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 flex flex-col">
          {conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <MessageCircle className="w-10 h-10 text-zinc-700 mb-3" />
              <p className="text-zinc-500 text-sm">No hay mensajes aún</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-800">
              {conversations.map(conv => (
                <button
                  key={conv.conversation_id}
                  onClick={() => setSelected(conv)}
                  className={`w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors ${
                    selected?.conversation_id === conv.conversation_id ? 'bg-zinc-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-600/30 text-violet-400 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {conv.buyer_email[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{conv.buyer_email}</p>
                      <p className="text-xs text-zinc-500 truncate">{conv.last_message}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Messages panel */}
        <div className="md:col-span-3 bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-center px-4">
              <div>
                <MessageCircle className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">Selecciona una conversación</p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-zinc-800">
                <p className="text-sm font-semibold text-white">{selected.buyer_email}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_role === 'brand' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.sender_role === 'brand'
                        ? 'bg-violet-600 text-white rounded-br-sm'
                        : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="px-3 py-3 border-t border-zinc-700 flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Responder..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
                />
                <button
                  onClick={sendReply}
                  disabled={!input.trim() || sending}
                  className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 flex items-center justify-center text-white transition-colors flex-shrink-0"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}