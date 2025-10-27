import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Camera, User } from 'lucide-react';
import Phone from '../Phone';

const CheckInDemo: React.FC = () => {
  const [scanState, setScanState] = useState<'scanning' | 'valid' | 'invalid'>('scanning');
  const [guestInfo, setGuestInfo] = useState({
    name: 'Sarah Johnson',
    ticketType: 'VIP',
    orderId: '#CG2025-1247',
    checkInTime: '18:45'
  });

  useEffect(() => {
    const sequence = async () => {
      setScanState('scanning');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setScanState('valid');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Show another scan
      setScanState('scanning');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGuestInfo({
        name: 'Michael Chen',
        ticketType: 'Regular',
        orderId: '#CG2025-8923',
        checkInTime: '18:47'
      });
      setScanState('valid');
      await new Promise(resolve => setTimeout(resolve, 3000));
    };

    sequence();
    const interval = setInterval(sequence, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Phone>
      <div className="h-full bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-xs">Gate 3 - Check-in</h3>
            <p className="text-slate-400 text-[10px]">Corporate Gala 2025</p>
          </div>
          <div className="text-right">
            <p className="text-green-400 font-bold text-xs">542 Checked In</p>
            <p className="text-slate-400 text-[10px]">308 Remaining</p>
          </div>
        </div>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex items-center justify-center p-3">
        <AnimatePresence mode="wait">
          {scanState === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <div className="relative mb-3">
                <div className="w-40 h-40 border-4 border-blue-500 rounded-2xl mx-auto relative overflow-hidden">
                  {/* Scanning Line Animation */}
                  <motion.div
                    className="absolute inset-x-0 h-1 bg-blue-400 shadow-lg shadow-blue-500/50"
                    animate={{ y: [0, 150, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-0 bg-blue-500/10" />
                  
                  {/* Corner Brackets */}
                  <div className="absolute top-2 left-2 w-5 h-5 border-l-4 border-t-4 border-blue-400" />
                  <div className="absolute top-2 right-2 w-5 h-5 border-r-4 border-t-4 border-blue-400" />
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-l-4 border-b-4 border-blue-400" />
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-r-4 border-b-4 border-blue-400" />
                </div>
                <Camera className="w-6 h-6 text-blue-400 mx-auto mt-2" />
              </div>
              <p className="text-blue-400 font-medium text-xs">Scanning QR Code...</p>
              <p className="text-slate-500 text-[10px] mt-1">Position code in frame</p>
            </motion.div>
          )}

          {scanState === 'valid' && (
            <motion.div
              key="valid"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-full px-2"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800 rounded-2xl p-3 border border-green-500/30"
              >
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-xs">{guestInfo.name}</h4>
                    <p className="text-green-400 text-[10px] font-medium">✓ VALID TICKET</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ticket Type:</span>
                    <span className="text-white font-semibold">{guestInfo.ticketType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order ID:</span>
                    <span className="text-white font-mono">{guestInfo.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Check-in Time:</span>
                    <span className="text-white">{guestInfo.checkInTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-green-400 font-medium">First Entry ✓</span>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-3 pt-2 border-t border-slate-700"
                >
                  <button className="w-full py-1.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg text-xs transition-colors">
                    Allow Entry
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {scanState === 'invalid' && (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500 flex items-center justify-center"
              >
                <XCircle className="w-12 h-12 text-white" />
              </motion.div>
              <h4 className="text-red-400 font-bold text-lg mb-2">Invalid Ticket</h4>
              <p className="text-slate-400 text-sm">Already used or not found</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </Phone>
  );
};

export default CheckInDemo;
