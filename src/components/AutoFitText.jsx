import React, { useEffect, useRef, useState } from 'react';

// AutoFitText: dynamically decreases font size so the text fits on a single line.
// Props:
// - text: string to render
// - max: maximum font size in px (default 16)
// - min: minimum font size in px (default 12)
// - step: decrement step in px (default 0.5)
// - className: additional classes
export default function AutoFitText({
  text,
  max = 16,
  min = 12,
  step = 0.5,
  className = '',
}) {
  const containerRef = useRef(null);
  const [fontSize, setFontSize] = useState(max);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const fit = () => {
      if (!el) return;
      // Reset to max before measuring
      let current = max;
      el.style.fontSize = `${current}px`;
      el.style.whiteSpace = 'nowrap';
      el.style.width = '100%';

      // If overflow, reduce until it fits or reach min
      // Guard for infinite loops with a counter
      let safety = 0;
      while (el.scrollWidth > el.clientWidth && current > min && safety < 200) {
        current = Math.max(min, current - step);
        el.style.fontSize = `${current}px`;
        safety += 1;
      }
      setFontSize(current);
    };

    // Initial fit
    fit();

    // Observe resize to re-fit responsively
    const ro = new ResizeObserver(() => fit());
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);

    const handleWindowResize = () => fit();
    window.addEventListener('resize', handleWindowResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
    // Re-run when text changes
  }, [text, max, min, step]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden text-gray-900 ${className}`}
      style={{ fontSize, lineHeight: 1.25, whiteSpace: 'nowrap' }}
      title={text}
    >
      {text}
    </div>
  );
}
