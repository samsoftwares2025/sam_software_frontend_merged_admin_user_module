import React, { useEffect, useState } from "react";

const ScrollArrow = ({ targetId }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY < 80);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScroll = () => {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!show) return null;

  return (
    <div className="scroll-arrow" onClick={handleScroll}>
      ↓
    </div>
  );
};

export default ScrollArrow;
