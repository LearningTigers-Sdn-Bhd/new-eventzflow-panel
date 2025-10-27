import React from 'react';
import { motion } from 'framer-motion';
import WhatsApp, { type ChatMessage } from '../apps/WhatsApp';

const WhatsAppSalesDemo: React.FC = () => {
  const conversation: ChatMessage[] = [
    { 
      type: 'customer', 
      text: 'Hi! I want to buy tickets for the Tech Conference', 
      time: '14:32',
      status: 'read'
    },
    { 
      type: 'bot', 
      text: '💼 Welcome! Tech Conference 2025 tickets available:\n\n🎟️ Regular - $150\n🌟 VIP - $350\n💎 Premium - $500\n\nHow many tickets would you like?', 
      time: '14:32',
      status: 'read'
    },
    { 
      type: 'customer', 
      text: '2 VIP tickets please', 
      time: '14:33',
      status: 'read'
    },
    { 
      type: 'bot', 
      text: '✅ Great choice!\n\n2 VIP Tickets × $350 = $700\n\nPlease confirm your order:', 
      time: '14:33',
      status: 'read'
    },
    {
      type: 'buttons',
      buttons: ['✅ Confirm Order', '❌ Cancel'],
      time: '14:33'
    },
    { 
      type: 'customer', 
      text: '✅ Confirm Order', 
      time: '14:34',
      status: 'read'
    },
    { 
      type: 'bot', 
      text: 'Perfect! 💳 Choose your payment method:', 
      time: '14:34',
      status: 'read'
    },
    {
      type: 'buttons',
      buttons: ['💳 Card Payment', '🏦 Bank Transfer', '📱 USSD'],
      time: '14:34'
    },
    { 
      type: 'customer', 
      text: '💳 Card Payment', 
      time: '14:35',
      status: 'read'
    },
    { 
      type: 'bot', 
      text: '🔒 Secure payment link generated:\n\npay.ticketz.com/xyz123\n\nClick to complete payment safely', 
      time: '14:35',
      status: 'read'
    },
    { 
      type: 'bot', 
      text: '✅ Payment successful!\n\n🎟️ Generating your tickets...', 
      time: '14:36',
      status: 'read'
    },
    {
      type: 'ticket',
      time: '14:37'
    },
    { 
      type: 'bot', 
      text: '🎉 Success! Your tickets have been sent to your email.\n\nSee you at the Tech Conference! 💼', 
      time: '14:37',
      status: 'read'
    },
    { 
      type: 'customer', 
      text: 'Perfect! Thank you so much! 😊', 
      time: '14:37',
      status: 'read'
    }
  ];

  // Custom render function for ticket message type
  const renderCustomMessage = (message: ChatMessage, index: number) => {
    if (message.type === 'ticket') {
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ 
            type: "spring",
            stiffness: 400,
            damping: 25,
            duration: 0.5
          }}
          className="flex justify-start"
        >
          <div className="bg-[#1f2c34] rounded-[8px] rounded-tl-[2px] px-2.5 py-2 max-w-[85%] shadow-md">
            {/* Ticket File Card */}
            <div className="bg-[#0a1420] rounded-lg p-2 border border-slate-700">
              <div className="flex items-center gap-2">
                {/* PDF Icon */}
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
                  </svg>
                </div>
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-white text-[11px] font-medium truncate">VIP_Tickets_x2.pdf</div>
                  <div className="text-[#8696a0] text-[9px]">2 pages • 145 KB</div>
                </div>
                {/* Download Icon */}
                <div className="flex-shrink-0">
                  <svg className="w-4 h-4 text-[#8696a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Timestamp */}
            <div className="text-[9px] text-[#8696a0] mt-1">
              {message.time}
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex items-center justify-center">
      <WhatsApp 
        contactName="TicketZ Bot"
        contactAvatar="TB"
        messages={conversation}
        renderCustomMessage={renderCustomMessage}
      />
    </div>
  );
};

export default WhatsAppSalesDemo;
