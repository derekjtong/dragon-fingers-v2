import { useEffect, useState } from "react";

// Returns an object with scrolled state and scroll direction
export const useScroll = (threshold = 10) => {
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [scrollDirection, setScrollDirection] = useState("up");

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollTop && currentScrollY > threshold) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollTop) {
        setScrollDirection("up");
      }
      setLastScrollTop(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollTop, threshold]);

  return { scrollDirection };
};
