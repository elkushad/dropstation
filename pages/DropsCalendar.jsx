import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Zap, Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

// ── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(targetDate) {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, over: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      over: false,
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
}

// ── Time Block ───────────────────────────────────────────────────────────────
function TimeBlock({ value, label, large }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center ${large ? 'w-16 h-16 md:w-20 md:h-20' : 'w-12 h-12'}`}>
        <span className={`font-black text-white tabular-nums ${large ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}

// ── Drop Card ────────────────────────────────────────────────────────────────
function DropCard({ drop, userEmail, notifications, onToggleNotification }) {
  const time = useCountdown(drop.drop_date);
  const hasNotification = notifications.some(n => n.drop_id === drop.id);
  const [toggling, setToggling] = useState(false);

  const dropDate = new Date(drop.drop_date);
  const dateStr = dropDate.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
  const timeStr = dropDate.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  const handleBell = async () => {
    if (!userEmail) { toast.error('Inicia sesión para activar notificaciones'); return; }
    setToggling(true);
    await onToggleNotification(drop, hasNotification);
    setToggling(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group"
    >
      {/* Teaser image */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        {drop.teaser_image ? (
          <img src={drop.teaser_image} alt={drop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-900 via-fuchsia-900 to-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-black/30 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {time.over ? (
            <div className="flex items-center gap-1.5 bg-violet-600 rounded-full px-3 py-1">
              <Zap className="w-3 h-3 text-white fill-white" />
              <span className="text-xs font-bold text-white">¡En vivo!</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1">
              <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Próximo Drop</span>
            </div>
          )}
        </div>

        {/* Bell button */}
        <button
          onClick={handleBell}
          disabled={toggling}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            hasNotification
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
              : 'bg-black/60 backdrop-blur-sm border border-white/10 text-zinc-300 hover:bg-black/80 hover:text-white'
          }`}
        >
          {toggling
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : hasNotification
              ? <Bell className="w-4 h-4 fill-white" />
              : <Bell className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Info */}
      <div className="p-5">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-3">
          {drop.brand_logo && (
            <img src={drop.brand_logo} alt="" className="w-7 h-7 rounded-full object-cover bg-zinc-800 border border-zinc-700" />
          )}
          <Link to={`/BrandProfile?id=${drop.brand_id}`} className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors">
            {drop.brand_name}
          </Link>
        </div>

        <h3 className="text-lg font-black text-white leading-tight mb-1">{drop.title}</h3>
        {drop.description && <p className="text-sm text-zinc-500 mb-4 line-clamp-2">{drop.description}</p>}

        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
          <Calendar className="w-3.5 h-3.5" />
          <span className="capitalize">{dateStr} · {timeStr}</span>
        </div>

        {/* Countdown */}
        {!time.over ? (
          <div className="flex items-center gap-2">
            <TimeBlock value={time.days} label="días" large />
            <span className="text-zinc-600 font-bold text-xl pb-5">:</span>
            <TimeBlock value={time.hours} label="hrs" large />
            <span className="text-zinc-600 font-bold text-xl pb-5">:</span>
            <TimeBlock value={time.minutes} label="min" large />
            <span className="text-zinc-600 font-bold text-xl pb-5">:</span>
            <TimeBlock value={time.seconds} label="seg" large />
          </div>
        ) : (
          <div className="h-12 flex items-center">
            <span className="text-violet-400 font-bold text-sm">Este drop ya está disponible</span>
          </div>
        )}

        {/* Notify CTA */}
        {!time.over && (
          <button
            onClick={handleBell}
            disabled={toggling}
            className={`mt-4 w-full flex items-center justify-center gap-2 rounded-full h-10 text-sm font-semibold transition-all ${
              hasNotification
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 hover:bg-violet-600/30'
                : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            {toggling
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : hasNotification
                ? <><BellOff className="w-4 h-4" /> Cancelar notificación</>
                : <><Bell className="w-4 h-4" /> Notificarme</>
            }
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DropsCalendar() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: drops = [], isLoading } = useQuery({
    queryKey: ['drops-calendar'],
    queryFn: () => base44.entities.Drop.filter({ active: true }, 'drop_date', 20),
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['drop-notifications', user?.email],
    queryFn: () => base44.entities.DropNotification.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const handleToggleNotification = async (drop, hasNotif) => {
    if (hasNotif) {
      const existing = notifications.find(n => n.drop_id === drop.id);
      if (existing) {
        await base44.entities.DropNotification.delete(existing.id);
        toast.success('Notificación cancelada');
      }
    } else {
      await base44.entities.DropNotification.create({
        drop_id: drop.id,
        drop_title: drop.title,
        brand_name: drop.brand_name,
        brand_id: drop.brand_id,
        drop_date: drop.drop_date,
        user_email: user.email,
      });
      toast.success('¡Te avisaremos por email cuando salga este drop! 🔔');
    }
    queryClient.invalidateQueries({ queryKey: ['drop-notifications'] });
  };

  // Separate upcoming vs live
  const upcoming = drops.filter(d => new Date(d.drop_date) > new Date());
  const live = drops.filter(d => new Date(d.drop_date) <= new Date());

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-violet-400 fill-violet-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">Calendario de Drops</h1>
        </div>
        <p className="text-zinc-500 ml-13">Activa la campana en los drops que no quieres perderte y te avisamos por email.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl h-96 animate-pulse" />
          ))}
        </div>
      ) : drops.length === 0 ? (
        <div className="text-center py-24">
          <Zap className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-lg">No hay drops programados por ahora.</p>
          <p className="text-zinc-600 text-sm mt-1">Vuelve pronto, las marcas están cocinando algo.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Live drops */}
          {live.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-violet-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                En vivo ahora
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {live.map(drop => (
                  <DropCard
                    key={drop.id}
                    drop={drop}
                    userEmail={user?.email}
                    notifications={notifications}
                    onToggleNotification={handleToggleNotification}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming drops */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">
                Próximos drops
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map(drop => (
                  <DropCard
                    key={drop.id}
                    drop={drop}
                    userEmail={user?.email}
                    notifications={notifications}
                    onToggleNotification={handleToggleNotification}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}