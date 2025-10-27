import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Share2 } from 'lucide-react';
import Phone from '../Phone';

const QRCodeDemo: React.FC = () => {
  const [showQR, setShowQR] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowQR(true), 1000);
    const timer2 = setTimeout(() => {
      setDownloading(true);
      setTimeout(() => setDownloading(false), 1500);
    }, 3000);
    
    const resetTimer = setInterval(() => {
      setShowQR(false);
      setDownloading(false);
      setTimeout(() => setShowQR(true), 1000);
      setTimeout(() => {
        setDownloading(true);
        setTimeout(() => setDownloading(false), 1500);
      }, 3000);
    }, 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearInterval(resetTimer);
    };
  }, []);

  return (
    <Phone>
      <div className="h-full bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center justify-center p-3">
      {!showQR ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.div>
          </div>
          <p className="text-purple-400 text-xs font-medium">Generating QR Code...</p>
          <p className="text-gray-500 text-[10px] mt-1">Payment confirmed ✓</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-3 shadow-2xl w-full"
        >
          {/* Ticket Header */}
          <div className="text-center mb-2">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <h3 className="text-slate-900 font-bold text-xs">Ticket Confirmed</h3>
            </div>
            <p className="text-slate-600 text-[10px]">Music Festival 2025</p>
          </div>

          {/* QR Code */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="bg-white p-2.5 rounded-xl border-4 border-purple-500 mb-2"
          >
            <div className="w-full aspect-square bg-white flex items-center justify-center">
              {/* Simulated QR Code Pattern */}
              <div className="grid grid-cols-8 gap-0.5 w-full h-full">
                {Array.from({ length: 64 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: Math.random() > 0.5 ? 1 : 0 }}
                    transition={{ delay: i * 0.01 }}
                    className="bg-slate-900 rounded-sm"
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Ticket Info */}
          <div className="bg-purple-50 rounded-lg p-2 mb-2 text-[10px]">
            <div className="flex justify-between mb-1">
              <span className="text-slate-600">Ticket Type:</span>
              <span className="text-slate-900 font-semibold">VIP × 2</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-600">Order ID:</span>
              <span className="text-slate-900 font-mono">#MF2025-4821</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Date:</span>
              <span className="text-slate-900 font-semibold">Dec 31, 2025</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 text-[10px] font-medium transition-colors ${
                downloading
                  ? 'bg-green-500 text-white'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              {downloading ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  <span>Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </>
              )}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="py-1.5 px-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
            >
              <Share2 className="w-3 h-3" />
            </motion.button>
          </div>

          {/* Footer */}
          <p className="text-center text-[9px] text-slate-500 mt-2">
            Show this QR code at venue entrance
          </p>
        </motion.div>
      )}
      </div>
    </Phone>
  );
};

export default QRCodeDemo;
