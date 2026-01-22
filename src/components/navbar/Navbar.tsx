import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaStopwatch, FaGlobeAmericas, FaPlus } from 'react-icons/fa';
import { BiFullscreen, BiExitFullscreen } from "react-icons/bi";

type Props = {}

const Navbar = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const menuItems = [
    { to: "/", icon: <FaClock />, label: "Clock", angle: 0 },
    { to: "/StopWatch", icon: <FaStopwatch />, label: "StopWatch", angle: 30 },
    { to: "/Worldclock", icon: <FaGlobeAmericas />, label: "WorldClock", angle: 60 },
    { icon: isFullscreen ? <BiExitFullscreen /> : <BiFullscreen />, label: "FullScreen", angle: 90, action: toggleFullScreen },
  ];

  return (
    <div className="fixed bottom-8 left-8 flex items-center justify-center z-50">
      <div className="relative w-16 h-16">

        {/* Toggle Button */}
        <button
          onClick={toggleMenu}
          className={`absolute inset-0 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg z-20 flex items-center justify-center text-2xl transition-transform duration-300 ${isOpen ? 'rotate-45 bg-red-500' : 'bg-blue-600'}`}
        >
          <FaPlus />
        </button>

        {/* Menu Items */}
        {menuItems.map((item, index) => {
          const commonClasses = `absolute top-0 left-0 w-16 h-16 bg-gray-700 text-white rounded-full shadow-md flex items-center justify-center transition-all duration-500 ease-out z-10 border border-transparent liquid-hover hover:text-blue-300`;
          const style = {
            transform: isOpen
              ? `rotate(${item.angle}deg) translate(0, -120px) rotate(${-item.angle}deg)`
              : 'rotate(0deg) translate(0, 0) rotate(0deg)',
            opacity: isOpen ? 1 : 0,
            transitionDelay: isOpen ? `${index * 100}ms` : '0ms'
          };

          if (item.to) {
            return (
              <Link
                key={index}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={commonClasses}
                style={style}
              >
                <div className="text-xl">
                  {item.icon}
                </div>
              </Link>
            );
          } else {
            return (
              <button
                key={index}
                onClick={() => {
                  if (item.action) item.action();
                  setIsOpen(false);
                }}
                className={commonClasses}
                style={style}
              >
                <div className="text-xl">
                  {item.icon}
                </div>
              </button>
            )
          }
        })}

      </div>
    </div>
  )
}

export default Navbar