import React, { useEffect, useState } from "react";
import "../../assets/styles/ComingSoon.css";

export default function ComingSoon() {
  const launchDate = new Date("2026-04-22T00:00:00").getTime();

  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const diff = launchDate - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  const [time, setTime] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="wrapper">
      <h1 className="title">SamSoftwares</h1>
      <p className="subtitle">We are launching soon!</p>

      <div className="countdown">
        <div className="card no-shade">
          <h2>{time.days}</h2>
          <span>DAYS</span>
        </div>
        <div className="card no-shade">
          <h2>{time.hours}</h2>
          <span>HOURS</span>
        </div>
        <div className="card no-shade">
          <h2>{time.minutes}</h2>
          <span>MINUTES</span>
        </div>
        <div className="card no-shade">
          <h2>{time.seconds}</h2>
          <span>SECONDS</span>
        </div>
      </div>

      <p className="footer">
        Something amazing is on the way. Stay tuned!
      </p>

      {/* ✅ NEW WRAPPER */}
      <div className="btn-wrapper">
        <button className="btn notify-btn">Notify Me</button>
      </div>
    </div>
  );
}
