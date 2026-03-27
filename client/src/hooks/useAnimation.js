import { useState, useEffect, useCallback } from 'react';

export const useAnimation = (duration = 300) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const show = useCallback(() => {
    setIsVisible(true);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), duration);
  }, [duration]);
  
  const hide = useCallback(() => {
    setIsVisible(false);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), duration);
  }, [duration]);
  
  const toggle = useCallback(() => {
    if (isVisible) {
      hide();
    } else {
      show();
    }
  }, [isVisible, show, hide]);
  
  return {
    isVisible,
    isAnimating,
    show,
    hide,
    toggle,
  };
};
