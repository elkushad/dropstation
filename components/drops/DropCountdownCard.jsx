import React, { useState, useEffect } from 'react';
import { Zap, Bell, BellOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

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

function TimeBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl w-14 h-14 flex items-center justify-center">
        <span className="text-2xl font-black text-white tabular-nums">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="text-[10px] text-white/50 uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}

// userEmail, notifications, onToggleNotification are optional — if not passed, bell button is hidden
export default function DropCountdownCard({ drop, userEmail, notifications = [], onToggleNotification }) {
  const time = useCountdown(drop.drop_date);
  const [toggling, setToggling] = useState(false);
  const hasNotification = notifications.some(n => n.drop_id === drop.id);
  const showBell = !time.over && onToggleNotification !== undefined;

  const handleBell = async () => {
    if (!userEmail) { toast.error('Inicia sesión para activar notificaciones'); return; }
    setToggling(true);
    await onToggleNotification(drop, hasNotification);
    setToggling(false);
  };

  return (
    <div className="relative w-full h-56 md:h-64 rounded-2xl overflow-hidden">
      {drop.teaser_image ? (
        <img src={drop.teaser_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-fuchsia-900 to-zinc-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      <div className="relative h-full flex flex-col justify-between p-5 md:p-7">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Próximo Drop</span>
          </div>
          {/* Bell button */}
          {showBell && (
            <button
              onClick={handleBell}
              disabled={toggling}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
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
          )}
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-white leading-tight">{drop.title}</h3>
            {drop.description && (
              <p className="text-sm text-white/60 mt-1 max-w-xs">{drop.description}</p>
            )}
          </div>

          {time.over ? (
            <div className="flex items-center gap-2 bg-violet-600 rounded-full px-5 py-2.5">
              <Zap className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white">¡En vivo!</span>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2">
                <TimeBlock value={time.days} label="días" />
                <span className="text-white/40 font-bold pb-5">:</span>
                <TimeBlock value={time.hours} label="hrs" />
                <span className="text-white/40 font-bold pb-5">:</span>
                <TimeBlock value={time.minutes} label="min" />
                <span className="text-white/40 font-bold pb-5">:</span>
                <TimeBlock value={time.seconds} label="seg" />
              </div>
              {/* Notify CTA button */}
              {showBell && (
                <button
                  onClick={handleBell}
                  disabled={toggling}
                  className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                    hasNotification
                      ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40 hover:bg-violet-600/40'
                      : 'bg-black/50 text-white border border-white/20 hover:bg-black/70'
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
          )}
        </div>
      </div>
    </div>
  );
}