import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, QrCode, Camera, Check, Monitor } from 'lucide-react';

interface EventPainPointScreenProps {
  demoType: string;
  step: number;
  title: string;
}

const EventPainPointScreen: React.FC<EventPainPointScreenProps> = ({ 
  demoType, 
  step, 
  title 
}) => {
  const chatRef = useRef<HTMLDivElement>(null);
  const miniAppRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [step]);

  // Auto-scroll for whatsapp-miniapp demo
  useEffect(() => {
    if (demoType === 'whatsapp-miniapp' && miniAppRef.current) {
      miniAppRef.current.scrollTop = miniAppRef.current.scrollHeight;
    }
  }, [step, demoType]);
  const renderDemo = () => {
    switch (demoType) {
      case 'whatsapp':
        return (
          <div className="h-full bg-[#0b141a] flex flex-col">
            {/* WhatsApp Chat Header */}
            <div className="flex items-center px-4 py-3 bg-[#202c33] border-b border-[#313d45]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-green-500 flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">🎫</span>
              </div>
              <div className="flex-1">
                <h6 className="text-white font-medium text-sm">Event Tickets</h6>
                <p className="text-[#8696a0] text-xs">
                  {step === 0 || step === 2 ? 'typing...' : 'Online'}
                </p>
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={chatRef} className="flex-1 px-4 py-2 space-y-2 overflow-y-auto scrollbar-hide">
              <AnimatePresence>
                {step >= 0 && (
                  <motion.div 
                    key="msg1"
                    className="flex justify-start mb-2"
                    initial={{ opacity: 0, x: -20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.8 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="bg-[#202c33] max-w-[85%] px-3 py-2 shadow-lg relative" style={{borderRadius: '7.5px 7.5px 7.5px 0px'}}>
                      <p className="text-white text-sm">Hi! I need 2 tickets for the tech conference 💻</p>
                      <div className="flex justify-end items-center mt-1">
                        <span className="text-[#8696a0] text-xs">2:30 PM</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                
                {step >= 1 && (
                  <motion.div 
                    key="msg2"
                    className="flex justify-end mb-2"
                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.8 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="bg-[#005c4b] max-w-[85%] px-3 py-2 shadow-lg relative" style={{borderRadius: '7.5px 7.5px 0px 7.5px'}}>
                      <p className="text-white text-sm">Perfect! Conference tickets available:</p>
                      <div className="mt-2 p-2 bg-[#004a3d] rounded-md">
                        <p className="text-white text-sm font-semibold">🎫 Conference Pass - $199 each</p>
                        <p className="text-white/80 text-xs">✨ Full access + networking</p>
                      </div>
                      <div className="flex justify-end items-center mt-1">
                        <span className="text-[#8696a0] text-xs mr-1">2:31 PM</span>
                        <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step >= 2 && (
                  <motion.div 
                    key="msg3"
                    className="flex justify-start mb-2"
                    initial={{ opacity: 0, x: -20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.8 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="bg-[#202c33] max-w-[80%] px-3 py-2 shadow-lg relative" style={{borderRadius: '7.5px 7.5px 7.5px 0px'}}>
                      <p className="text-white text-sm">Great! I'll take 2 conference passes 🎉</p>
                      <div className="flex justify-end items-center mt-1">
                        <span className="text-[#8696a0] text-xs">2:32 PM</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step >= 3 && (
                  <motion.div 
                    key="msg4"
                    className="flex justify-end mb-2"
                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.8 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="bg-[#005c4b] max-w-[90%] px-3 py-2 shadow-lg relative" style={{borderRadius: '7.5px 7.5px 0px 7.5px'}}>
                      <div className="space-y-2">
                        <p className="text-white text-sm font-semibold">🎊 Order Confirmed!</p>
                        <div className="bg-[#004a3d] p-2 rounded-md text-sm">
                          <p className="text-white">2x Conference Pass</p>
                          <p className="text-white font-bold">Total: $398</p>
                        </div>
                        <p className="text-white/90 text-xs">Payment: Card ending •••• 4242 ✅</p>
                        <p className="text-white/90 text-xs">Tickets sent to your email!</p>
                      </div>
                      <div className="flex justify-end items-center mt-1">
                        <span className="text-[#8696a0] text-xs mr-1">2:33 PM</span>
                        <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Chat Input Area */}
            <div className="px-4 py-2 bg-[#202c33] border-t border-[#313d45]">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2">
                  <p className="text-[#8696a0] text-sm">Type a message</p>
                </div>
                <div className="w-8 h-8 bg-[#00a884] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2s2-.9 2-2V3c0-1.1-.9-2-2-2zm6.6 5.8c-.3-.3-.8-.3-1.1 0s-.3.8 0 1.1C18.4 8.7 19 9.8 19 11c0 3.9-3.1 7-7 7s-7-3.1-7-7c0-1.2.6-2.3 1.5-3.1.3-.3.3-.8 0-1.1s-.8-.3-1.1 0C4.2 7.1 3.5 8.9 3.5 11c0 4.4 3.4 8.1 7.8 8.5V21H9c-.4 0-.8.3-.8.8s.3.8.8.8h6c.4 0 .8-.3.8-.8s-.3-.8-.8-.8h-2.3v-1.5c4.4-.4 7.8-4.1 7.8-8.5 0-2.1-.7-3.9-1.9-5.3z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="p-4 space-y-4 h-full bg-gradient-to-b from-slate-900 to-black">
            <div className="text-center mb-4">
              <h6 className="text-white font-semibold mb-1">💰 Revenue Calculator</h6>
              <p className="text-xs text-slate-400">See how much you save</p>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence>
                {step >= 0 && (
                  <motion.div
                    key="sales-input"
                    className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-sm text-slate-300 mb-2">Monthly Ticket Sales</p>
                    <div className="text-2xl font-bold text-white">$10,000</div>
                  </motion.div>
                )}

                {step >= 1 && (
                  <motion.div
                    key="competitor-fees"
                    className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 p-4 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-red-300">Other Platforms</p>
                      <span className="text-xs bg-red-500/30 text-red-200 px-2 py-1 rounded">8% fee</span>
                    </div>
                    <div className="text-lg font-bold text-red-400">
                      $10,000 - $800 = $9,200
                    </div>
                    <p className="text-xs text-red-300 mt-1">Commission taken from every sale</p>
                  </motion.div>
                )}

                {step >= 2 && (
                  <motion.div
                    key="our-platform"
                    className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 p-4 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-green-300">Our Platform</p>
                      <span className="text-xs bg-green-500/30 text-green-200 px-2 py-1 rounded">0% fee</span>
                    </div>
                    <div className="text-lg font-bold text-green-400">
                      $10,000 - $0 = $10,000
                    </div>
                    <p className="text-xs text-green-300 mt-1">Keep 100% of your revenue!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );


      case 'qr-validation':
        return (
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 h-full bg-gradient-to-b from-slate-900 to-black">
            <div className="text-center mb-3 sm:mb-4">
              <h6 className="text-white font-semibold mb-1 text-sm sm:text-base">📱 QR Check-In Scanner</h6>
              <p className="text-xs text-slate-400">Organizer Dashboard View</p>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <AnimatePresence>
                {step >= 0 && (
                  <motion.div
                    key="scanner-ready"
                    className="p-3 sm:p-4 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-lg sm:rounded-xl text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-lg sm:rounded-xl mx-auto mb-2 flex items-center justify-center">
                      <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-pulse" />
                    </div>
                    <p className="text-white text-xs sm:text-sm font-medium">QR Scanner Ready</p>
                    <p className="text-xs text-slate-300">Point camera at attendee QR code</p>
                  </motion.div>
                )}

                {step >= 1 && (
                  <motion.div
                    key="scanning"
                    className="p-3 sm:p-4 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-lg sm:rounded-xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                        <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white text-xs sm:text-sm font-medium">Scanning QR Code...</p>
                        <p className="text-xs text-yellow-300">Processing attendee data</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step >= 2 && (
                  <motion.div
                    key="validated"
                    className="p-3 sm:p-4 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-lg sm:rounded-xl"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-xs sm:text-sm font-medium">Sarah Martinez</p>
                        <p className="text-xs text-green-300">Conference Pass - Valid ✓</p>
                        <p className="text-xs text-slate-300">Check-in: 9:15 AM</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step >= 3 && (
                  <motion.div
                    key="stats-update"
                    className="p-2 sm:p-3 bg-slate-700/40 backdrop-blur-sm border border-slate-600/30 rounded-lg sm:rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-center">
                      <div>
                        <p className="text-base sm:text-lg font-bold text-white">247</p>
                        <p className="text-xs text-slate-400">Checked In</p>
                      </div>
                      <div>
                        <p className="text-base sm:text-lg font-bold text-white">53</p>
                        <p className="text-xs text-slate-400">Remaining</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );

      case 'whatsapp-miniapp':
        return (
          <div className="h-full bg-[#0b141a] flex flex-col">
            {/* WhatsApp Mini App Header */}
            <div className="flex items-center px-3 sm:px-4 py-2 sm:py-3 bg-[#202c33] border-b border-[#313d45]">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center mr-2 sm:mr-3">
                <span className="text-white text-xs sm:text-sm font-bold">🎫</span>
              </div>
              <div className="flex-1">
                <h6 className="text-white font-medium text-xs sm:text-sm">Eventzflow App</h6>
                <p className="text-[#8696a0] text-xs">Event Registration</p>
              </div>
            </div>

            {/* Mini App Content */}
            <div ref={miniAppRef} className="flex-1 px-3 sm:px-4 py-2 sm:py-3 space-y-2 sm:space-y-3 overflow-y-auto scrollbar-hide">
              <AnimatePresence>
                {step >= 0 && (
                  <motion.div 
                    key="event-card"
                    className="bg-[#202c33] p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#313d45]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md sm:rounded-lg flex items-center justify-center">
                        <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h6 className="text-white font-semibold text-xs sm:text-sm">Tech Summit 2024</h6>
                        <p className="text-[#8696a0] text-xs">Dec 15, 2024 • Convention Center</p>
                      </div>
                    </div>
                    <div className="text-[#8696a0] text-xs">
                      Join industry leaders for cutting-edge tech insights!
                    </div>
                  </motion.div>
                )}

                {step >= 1 && (
                  <motion.div 
                    key="ticket-options"
                    className="bg-[#202c33] p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#313d45]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h6 className="text-white font-medium text-xs sm:text-sm mb-2 sm:mb-3">Select Tickets</h6>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-[#005c4b] rounded-md sm:rounded-lg">
                        <div>
                          <p className="text-white text-xs sm:text-sm">Conference Pass</p>
                          <p className="text-[#8696a0] text-xs">Full access + networking</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold text-xs sm:text-sm">$199</p>
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <button className="w-5 h-5 sm:w-6 sm:h-6 bg-[#004a3d] rounded text-white text-xs">-</button>
                            <span className="text-white text-xs sm:text-sm">2</span>
                            <button className="w-5 h-5 sm:w-6 sm:h-6 bg-[#00a884] rounded text-white text-xs">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step >= 2 && (
                  <motion.div 
                    key="user-info"
                    className="bg-[#202c33] p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#313d45]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h6 className="text-white font-medium text-xs sm:text-sm mb-2 sm:mb-3">Your Details</h6>
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        placeholder="Full Name" 
                        className="w-full p-2 bg-[#2a3942] text-white placeholder-[#8696a0] rounded text-xs sm:text-sm border-none outline-none"
                        value="John Doe"
                        readOnly
                      />
                      <input 
                        type="email" 
                        placeholder="Email" 
                        className="w-full p-2 bg-[#2a3942] text-white placeholder-[#8696a0] rounded text-xs sm:text-sm border-none outline-none"
                        value="john@example.com"
                        readOnly
                      />
                    </div>
                  </motion.div>
                )}

                {step >= 3 && (
                  <motion.div 
                    key="payment-confirmation"
                    className="bg-[#005c4b] p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#00a884]"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#00a884] rounded-full flex items-center justify-center mx-auto mb-2">
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h6 className="text-white font-semibold text-xs sm:text-sm mb-1">Payment Successful!</h6>
                      <p className="text-[#8696a0] text-xs mb-2">2x Conference Pass - $398</p>
                      <p className="text-[#8696a0] text-xs">Tickets sent to your WhatsApp</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );

      default:
        return <div className="p-4 text-slate-600">Demo loading...</div>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* App Header */}
      <div className="px-6 py-3 border-b border-white/10 flex-shrink-0">
        <h5 className="text-white font-medium text-sm text-center">{title}</h5>
      </div>
      
      {/* Scrollable Content - fills remaining space */}
      <div className="flex-1 overflow-hidden relative">
        <motion.div className="absolute inset-0">
          {renderDemo()}
        </motion.div>
      </div>
    </div>
  );
};

export default EventPainPointScreen;
