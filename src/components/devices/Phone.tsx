import React, { useRef } from 'react';

interface PhoneProps {
  children: React.ReactNode;
}

const Phone: React.FC<PhoneProps> = ({ children }) => {
  return (
    <div className="relative z-10 mx-auto h-[500px] w-[260px] rounded-[2.5rem] bg-black p-2.5 shadow-2xl ring-1 ring-white/10 dark:ring-white/20">
      {/* Screen */}
      <div className="h-full w-full overflow-hidden rounded-[2rem] bg-[#0a1014] flex flex-col relative ring-1 ring-white/5">
        {/* Status Bar */}
        <div className="flex h-9 items-center justify-between px-4 pt-1.5 text-white relative flex-shrink-0 z-10">
          <span className="text-[10px] font-medium">9:41</span>
          
          {/* Dynamic Island */}
          <div className="absolute left-1/2 top-1.5 transform -translate-x-1/2 h-5 w-24 bg-black rounded-full">
          </div>
          
          {/* Signal Indicators */}
          <div className="flex items-center gap-1">
            <div className="flex items-end space-x-0.5">
              <div className="w-1 h-1 bg-white rounded-sm"></div>
              <div className="w-1 h-1.5 bg-white rounded-sm"></div>
              <div className="w-1 h-2 bg-white rounded-sm"></div>
              <div className="w-1 h-2.5 bg-white rounded-sm"></div>
            </div>
            <div className="relative w-3.5 h-3 ml-1">
              <svg viewBox="0 0 16 12" className="w-3.5 h-3 fill-white">
                <path d="M8 0C3.58 0 0 3.58 0 8h2c0-3.31 2.69-6 6-6s6 2.69 6 6h2c0-4.42-3.58-8-8-8z" transform="scale(1, 0.6)"/>
                <path d="M8 3C5.24 3 3 5.24 3 8h2c0-1.66 1.34-3 3-3s3 1.34 3 3h2c0-2.76-2.24-5-5-5z" transform="scale(1, 0.7) translate(0, 2)"/>
                <circle cx="8" cy="10" r="1.5"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Screen Content - Must not overflow */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {children}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-white/30 rounded-full"></div>
      </div>
    </div>
  );
};

export default Phone;
