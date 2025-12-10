import type React from 'react';
import { useState, useEffect } from 'react';
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
      <div className="flex h-full flex-col bg-gradient-to-b from-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-slate-700 border-b bg-slate-800/50 p-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-xs">Gate 3 - Check-in</h3>
            <p className="text-[10px] text-slate-400">Corporate Gala 2025</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-green-400 text-xs">542 Checked In</p>
            <p className="text-[10px] text-slate-400">308 Remaining</p>
          </div>
        </div>
      </div>

      {/* Scanner Area */}
      <div className="flex flex-1 items-center justify-center p-3">
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
                <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-2xl border-4 border-blue-500">
                  {/* Scanning Line Animation */}
                  <motion.div
                    className="absolute inset-x-0 h-1 bg-blue-400 shadow-blue-500/50 shadow-lg"
                    animate={{ y: [0, 150, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                  <div className="absolute inset-0 bg-blue-500/10" />
                  
                  {/* Corner Brackets */}
                  <div className="absolute top-2 left-2 h-5 w-5 border-blue-400 border-t-4 border-l-4" />
                  <div className="absolute top-2 right-2 h-5 w-5 border-blue-400 border-t-4 border-r-4" />
                  <div className="absolute bottom-2 left-2 h-5 w-5 border-blue-400 border-b-4 border-l-4" />
                  <div className="absolute right-2 bottom-2 h-5 w-5 border-blue-400 border-r-4 border-b-4" />
                </div>
                <Camera className="mx-auto mt-2 h-6 w-6 text-blue-400" />
              </div>
              <p className="font-medium text-blue-400 text-xs">Scanning QR Code...</p>
              <p className="mt-1 text-[10px] text-slate-500">Position code in frame</p>
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
                className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-500"
              >
                <CheckCircle className="h-10 w-10 text-white" />
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-green-500/30 bg-slate-800 p-3"
              >
                <div className="mb-2 flex items-center gap-2 border-slate-700 border-b pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-xs">{guestInfo.name}</h4>
                    <p className="font-medium text-[10px] text-green-400">✓ VALID TICKET</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ticket Type:</span>
                    <span className="font-semibold text-white">{guestInfo.ticketType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order ID:</span>
                    <span className="font-mono text-white">{guestInfo.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Check-in Time:</span>
                    <span className="text-white">{guestInfo.checkInTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-medium text-green-400">First Entry ✓</span>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-3 border-slate-700 border-t pt-2"
                >
                  <button className="w-full rounded-lg bg-green-500 py-1.5 font-medium text-white text-xs transition-colors hover:bg-green-600">
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
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500"
              >
                <XCircle className="h-12 w-12 text-white" />
              </motion.div>
              <h4 className="mb-2 font-bold text-lg text-red-400">Invalid Ticket</h4>
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
