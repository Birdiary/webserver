import { useRef } from 'react';

// Lightweight touch-swipe wrapper that replaces react-onsenui's GestureDetector
// (which is capped at React 18). Detects horizontal swipes via touch events and
// fires the corresponding callback. Vertical scrolling is left untouched.
const SWIPE_THRESHOLD = 50; // px

export default function SwipeDetector({ onSwipeLeft, onSwipeRight, children, style, className }) {
  const startX = useRef(null);
  const startY = useRef(null);

  const handleTouchStart = (e) => {
    const touch = e.changedTouches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
  };

  const handleTouchEnd = (e) => {
    if (startX.current == null) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;
    // Only treat as a swipe if the horizontal movement dominates.
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        onSwipeLeft && onSwipeLeft();
      } else {
        onSwipeRight && onSwipeRight();
      }
    }
    startX.current = null;
    startY.current = null;
  };

  return (
    <div
      className={className}
      style={style}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}
