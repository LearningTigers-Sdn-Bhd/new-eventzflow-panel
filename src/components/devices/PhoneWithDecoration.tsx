import React from 'react';
import { motion } from 'framer-motion';

interface PhoneWithDecorationProps {
  phoneKey: string;
  delay?: number;
  time?: string;
  layout: React.ReactNode; // Layout component to render inside the phone
  floatingElements?: {
    topRight: {
      colors: string;
      delay: number;
    };
    bottomLeft: {
      colors: string;
      delay: number;
    };
  };
}

const PhoneWithDecoration: React.FC<PhoneWithDecorationProps> = ({ 
  layout,
  phoneKey, 
  delay = 0,
  time = "9:41",
  floatingElements = {
    topRight: { colors: 'from-blue-400 to-purple-500', delay: 0 },
    bottomLeft: { colors: 'from-green-400 to-blue-500', delay: 1 }
  }
}) => {
  return (
    <div className="relative w-full mx-auto">
      <motion.div 
        className="relative mx-auto h-[640px] w-[320px] rounded-[3rem] bg-black p-3 shadow-2xl"
        key={phoneKey}
        initial={{ opacity: 0, scale: 0.9, rotateY: -30 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          rotateY: 0,
          y: [0, -10, 0]
        }}
        transition={{ 
          duration: 0.8,
          delay,
          y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay + 0.5 }
        }}
      >
        {/* Screen */}
        <div className="h-full w-full overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-slate-900 to-black flex flex-col relative">
          {/* Status Bar with Dynamic Island */}
          <div className="flex h-12 items-center justify-between px-6 pt-2 text-white relative flex-shrink-0">
            <span className="text-sm font-medium">{time}</span>
            
            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-2 transform -translate-x-1/2 h-6 w-32 bg-black rounded-full flex items-center justify-center">
            </div>
            
            {/* Signal Indicators */}
            <div className="flex items-center gap-1">
              {/* Cellular Signal Bars */}
              <div className="flex items-end space-x-0.5">
                <div className="w-1 h-1 bg-white rounded-sm"></div>
                <div className="w-1 h-1.5 bg-white rounded-sm"></div>
                <div className="w-1 h-2 bg-white rounded-sm"></div>
                <div className="w-1 h-2.5 bg-white rounded-sm"></div>
              </div>
              
              {/* WiFi Icon */}
              <div className="relative w-4 h-3 ml-1">
                <svg viewBox="0 0 16 12" className="w-4 h-3 fill-white">
                  <path d="M8 0C3.58 0 0 3.58 0 8h2c0-3.31 2.69-6 6-6s6 2.69 6 6h2c0-4.42-3.58-8-8-8z" transform="scale(1, 0.6)"/>
                  <path d="M8 3C5.24 3 3 5.24 3 8h2c0-1.66 1.34-3 3-3s3 1.34 3 3h2c0-2.76-2.24-5-5-5z" transform="scale(1, 0.7) translate(0, 2)"/>
                  <circle cx="8" cy="10" r="1.5"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Layout Content - fills remaining space */}
          <div className="flex-1 pb-8">
            {layout}
          </div>
          
          {/* Home Indicator */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full"></div>
        </div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div 
        className={`absolute -top-4 -right-4 h-12 w-12 rounded-full bg-gradient-to-br ${floatingElements.topRight.colors} opacity-20`}
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 180, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: floatingElements.topRight.delay
        }}
      />
      <motion.div 
        className={`absolute -bottom-6 -left-6 h-8 w-8 rounded-full bg-gradient-to-br ${floatingElements.bottomLeft.colors} opacity-30`}
        animate={{ 
          y: [0, 20, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: floatingElements.bottomLeft.delay
        }}
      />
    </div>
  );
};

export default PhoneWithDecoration;
