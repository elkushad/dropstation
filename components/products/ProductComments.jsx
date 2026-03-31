import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Upload, X, Loader2, Reply, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function CommentItem({ comment, replies, user, brand, productBrandId, onReply }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const isBrandOwner = user && brand && user.email === brand.created_by;

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    await base44.entities.Comment.create({
      product_id: comment.product_id,
      brand_id: comment.brand_id,
      author_email: user.email,
      author_name: isBrandOwner ? brand.name : (user.full_name || user.email.split('@')[0]),
      content: replyText.trim(),
      parent_id: comment.id,
      is_brand_reply: isBrandOwner,
    });
    setReplyText('');
    setShowReplyForm(false);
    setSubmitting(false);
    queryClient.invalidateQueries({ queryKey: ['comments', comment.product_id] });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${comment.is_brand_reply ? 'bg-violet-600 text-white' : 'bg-zinc-700 text-zinc-300'}`}>
          {comment.is_brand_reply ? '★' : (comment.author_name?.[0]?.toUpperCase() || '?')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{comment.author_name || 'Usuario'}</span>
            {comment.is_brand_reply && (
              <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full px-2 py-0.5 font-semibold">Marca</span>
            )}
            <span className="text-xs text-zinc-600">{new Date(comment.created_date).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</span>
          </div>
          <p className="text-sm text-zinc-300 mt-1 leading-relaxed">{comment.content}</p>
          {/* Images */}
          {comment.images?.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {comment.images.map((img, i) => (
                <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                  <img src={img} alt="" className="w-20 h-20 rounded-lg object-cover border border-zinc-700 hover:opacity-80 transition-opacity" />
                </a>
              ))}
            </div>
          )}
          {/* Reply button */}
          {user && (
            <button
              onClick={() => setShowReplyForm(v => !v)}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-violet-400 mt-2 transition-colors"
            >
              <Reply className="w-3 h-3" /> Responder
            </button>
          )}
          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3 flex gap-2">
              <Textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={isBrandOwner ? 'Responder como marca...' : 'Escribe una respuesta...'}
                className="bg-zinc-800 border-zinc-700 text-white text-sm h-16 resize-none placeholder:text-zinc-500"
              />
              <div className="flex flex-col gap-1">
                <Button size="sm" onClick={handleReply} disabled={submitting || !replyText.trim()} className="bg-violet-600 hover:bg-violet-700 text-white h-8 text-xs">
                  {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Enviar'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowReplyForm(false)} className="text-zinc-500 h-8 text-xs">
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {replies?.length > 0 && (
        <div className="ml-11 space-y-3 border-l-2 border-zinc-800 pl-4">
          {replies.map(reply => (
            <div key={reply.id} className="flex gap-3">
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${reply.is_brand_reply ? 'bg-violet-600 text-white' : 'bg-zinc-700 text-zinc-300'}`}>
                {reply.is_brand_reply ? '★' : (reply.author_name?.[0]?.toUpperCase() || '?')}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white">{reply.author_name || 'Usuario'}</span>
                  {reply.is_brand_reply && (
                    <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full px-2 py-0.5 font-semibold">Marca</span>
                  )}
                  <span className="text-xs text-zinc-600">{new Date(reply.created_date).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</span>
                </div>
                <p className="text-sm text-zinc-300 mt-1 leading-relaxed">{reply.content}</p>
                {reply.images?.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {reply.images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                        <img src={img} alt="" className="w-16 h-16 rounded-lg object-cover border border-zinc-700 hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductComments({ product, user, brand }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const isBrandOwner = user && brand && user.email === brand.created_by;

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', product.id],
    queryFn: () => base44.entities.Comment.filter({ product_id: product.id }, '-created_date', 50),
  });

  const topLevel = comments.filter(c => !c.parent_id);
  const replies = comments.filter(c => !!c.parent_id);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImages(prev => [...prev, file_url]);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    await base44.entities.Comment.create({
      product_id: product.id,
      product_name: product.name,
      brand_id: product.brand_id,
      author_email: user.email,
      author_name: isBrandOwner ? brand.name : (user.full_name || user.email.split('@')[0]),
      content: text.trim(),
      images,
      is_brand_reply: isBrandOwner,
    });
    setText('');
    setImages([]);
    setSubmitting(false);
    queryClient.invalidateQueries({ queryKey: ['comments', product.id] });
  };

  return (
    <section className="mt-16 max-w-2xl">
      <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-violet-400" />
        Comentarios
        {comments.length > 0 && <span className="text-zinc-500 font-normal text-base">({topLevel.length})</span>}
      </h2>

      {/* New comment form */}
      {user ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-8">
          <div className="flex gap-3">
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isBrandOwner ? 'bg-violet-600 text-white' : 'bg-zinc-700 text-zinc-300'}`}>
              {isBrandOwner ? '★' : (user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase())}
            </div>
            <div className="flex-1 space-y-3">
              <Textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={isBrandOwner ? 'Responder como marca...' : 'Comparte tu experiencia, haz una pregunta o sube una foto con tu compra...'}
                className="bg-zinc-800 border-zinc-700 text-white text-sm resize-none h-20 placeholder:text-zinc-500"
              />
              {/* Image previews */}
              {images.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16">
                      <img src={img} alt="" className="w-full h-full rounded-lg object-cover border border-zinc-700" />
                      <button
                        onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <X className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-violet-400 cursor-pointer transition-colors">
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Image className="w-3.5 h-3.5" />}
                  {uploading ? 'Subiendo...' : 'Adjuntar foto'}
                  <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleImageUpload} disabled={uploading || images.length >= 3} />
                </label>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !text.trim()}
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Publicar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8 text-center">
          <p className="text-zinc-400 text-sm">Inicia sesión para comentar o hacer preguntas</p>
        </div>
      )}

      {/* Comments list */}
      {topLevel.length === 0 ? (
        <p className="text-zinc-600 text-sm">Sé el primero en comentar este producto.</p>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {topLevel.map(comment => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-zinc-800 pb-6"
              >
                <CommentItem
                  comment={comment}
                  replies={replies.filter(r => r.parent_id === comment.id)}
                  user={user}
                  brand={brand}
                  productBrandId={product.brand_id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}