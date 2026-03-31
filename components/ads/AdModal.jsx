import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const AD_DURATION = 30;

export default function AdModal({ open, onOpenChange, onAdComplete }) {
  const [timeLeft, setTimeLeft] = useState(AD_DURATION);

  useEffect(() => {
    if (!open) {
      setTimeLeft(AD_DURATION);
      return;
    }

    // Load Adsterra script
    const script = document.createElement('script');
    script.src = 'https://pl28951920.profitablecpmratenetwork.com/61/5f/17/615f17453a5e88243736a875ab124bc3.js';
    script.async = true;
    const container = document.getElementById('adsterra-container');
    if (container) {
      container.appendChild(script);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  const progress = ((AD_DURATION - timeLeft) / AD_DURATION) * 100;
  const adComplete = timeLeft === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-700 text-white p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle className="text-xl font-bold">Plan Gratuito</DialogTitle>
          <DialogDescription className="text-zinc-400 mt-1">
            Estás usando el plan gratuito. Para subir productos sin anuncios, <a href="/Pricing" className="text-violet-400 hover:underline font-semibold">Mejora tu plan aquí</a>.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-2">
          <p className="text-sm text-zinc-300 font-semibold mb-3">Tu formulario se habilitará en: <span className="text-violet-400">{timeLeft}</span> segundos</p>
          <Progress value={progress} className="h-2 bg-zinc-700" />
        </div>

        <div id="adsterra-container" className="relative w-full bg-black aspect-video flex items-center justify-center">
          {/* Adsterra ad will be injected here */}
        </div>

        <div className="p-6">
          <Button
            onClick={onAdComplete}
            disabled={!adComplete}
            className={cn(
              "w-full h-12 rounded-full font-semibold",
              adComplete 
                ? "bg-violet-600 hover:bg-violet-700 text-white" 
                : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
            )}
          >
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}