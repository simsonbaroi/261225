import { useEffect, useRef } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  preventDefaultEvents?: boolean;
}

export const useSwipeGesture = (options: SwipeGestureOptions) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    threshold = 50,
    preventDefaultEvents = false
  } = options;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      console.log('❌ No element found for swipe gestures');
      return;
    }
    
    console.log('✅ Setting up swipe gestures on element');

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
      console.log('🔵 Touch start:', touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current || e.touches.length !== 1) return;
      
      if (preventDefaultEvents) {
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
        
        // Only prevent default if it's clearly a horizontal swipe
        if (deltaX > deltaY && deltaX > 15) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length !== 1) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      console.log('🔴 Touch end:', {
        deltaX,
        deltaY,
        deltaTime,
        absDeltaX: Math.abs(deltaX),
        absDeltaY: Math.abs(deltaY),
        threshold,
        isHorizontal: Math.abs(deltaX) > Math.abs(deltaY),
        meetsThreshold: Math.abs(deltaX) > threshold,
        isQuickSwipe: deltaTime < 800
      });

      // Check for valid swipe: horizontal movement, meets threshold, not too slow
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      const meetsThreshold = Math.abs(deltaX) > threshold;
      const isQuickEnough = deltaTime < 800; // Must complete within 800ms

      if (isHorizontalSwipe && meetsThreshold && isQuickEnough) {
        if (deltaX > 0 && onSwipeRight) {
          console.log('🟢 Triggering swipe RIGHT');
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          console.log('🟢 Triggering swipe LEFT');
          onSwipeLeft();
        }
      } else {
        console.log('❌ Swipe rejected:', { isHorizontalSwipe, meetsThreshold, isQuickEnough });
      }

      touchStartRef.current = null;
    };

    // Add touch event listeners with proper options
    element.addEventListener('touchstart', handleTouchStart, { 
      passive: true, 
      capture: false 
    });
    element.addEventListener('touchmove', handleTouchMove, { 
      passive: !preventDefaultEvents, 
      capture: false 
    });
    element.addEventListener('touchend', handleTouchEnd, { 
      passive: true, 
      capture: false 
    });

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up swipe gesture listeners');
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, preventDefaultEvents]);

  return elementRef;
};