import React, { useEffect } from 'react';

export default function ShippingWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      (function() {
        var widget = document.getElementById('cotiza-envios-widget');
        if (!widget) return;
        var s = document.createElement('script');
        s.src = 'https://www.cotizaenvios.com/widget/widget.js';
        s.async = true;
        document.body.appendChild(s);
      })();
    `;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="cotiza-envios-widget" />;
}