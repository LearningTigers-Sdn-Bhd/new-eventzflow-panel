import type React from 'react';
import { useState, useEffect } from 'react';
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
      <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 p-3">
      {!showQR ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.div>
          </div>
          <p className="font-medium text-purple-400 text-xs">Generating QR Code...</p>
          <p className="mt-1 text-[10px] text-gray-500">Payment confirmed ✓</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full rounded-2xl bg-white p-3 shadow-2xl"
        >
          {/* Ticket Header */}
          <div className="mb-2 text-center">
            <div className="mb-1 flex items-center justify-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <h3 className="font-bold text-slate-900 text-xs">Ticket Confirmed</h3>
            </div>
            <p className="text-[10px] text-slate-600">Music Festival 2025</p>
          </div>

          {/* QR Code */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-2 rounded-xl border-4 border-purple-500 bg-white p-2.5"
          >
            <div className="flex aspect-square w-full items-center justify-center bg-white">
              {/* Simulated QR Code Pattern */}
              <div className="grid h-full w-full grid-cols-8 gap-0.5">
                {Array.from({ length: 64 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: Math.random() > 0.5 ? 1 : 0 }}
                    transition={{ delay: i * 0.01 }}
                    className="rounded-sm bg-slate-900"
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Ticket Info */}
          <div className="mb-2 rounded-lg bg-purple-50 p-2 text-[10px]">
            <div className="mb-1 flex justify-between">
              <span className="text-slate-600">Ticket Type:</span>
              <span className="font-semibold text-slate-900">VIP × 2</span>
            </div>
            <div className="mb-1 flex justify-between">
              <span className="text-slate-600">Order ID:</span>
              <span className="font-mono text-slate-900">#MF2025-4821</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Date:</span>
              <span className="font-semibold text-slate-900">Dec 31, 2025</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 font-medium text-[10px] transition-colors ${
                downloading
                  ? 'bg-green-500 text-white'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              {downloading ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  <span>Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="h-3 w-3" />
                  <span>Download</span>
                </>
              )}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="rounded-lg bg-slate-200 px-2 py-1.5 text-slate-700 transition-colors hover:bg-slate-300"
            >
              <Share2 className="h-3 w-3" />
            </motion.button>
          </div>

          {/* Footer */}
          <p className="mt-2 text-center text-[9px] text-slate-500">
            Show this QR code at venue entrance
          </p>
        </motion.div>
      )}
      </div>
    </Phone>
  );
};

export default QRCodeDemo;
