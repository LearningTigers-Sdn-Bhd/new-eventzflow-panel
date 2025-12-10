import type React from 'react';
import WhatsApp from '../apps/WhatsApp';
import type { ChatMessage } from '../apps/WhatsApp';

const SupportDemo: React.FC = () => {
  const conversation: ChatMessage[] = [
    { 
      type: 'customer', 
      text: 'I need to transfer my ticket to my friend', 
      time: '16:24',
      status: 'read'
    },
    { 
      type: 'bot', 
      text: 'I can help you transfer your ticket! 🎫\n\nPlease provide:\n1. Your Order ID\n2. Recipient\'s WhatsApp number', 
      time: '16:24',
      status: 'read'
    },
    { 
      type: 'customer', 
      text: 'Order ID: #MF2025-3421\nNumber: +234 801 234 5678', 
      time: '16:25',
      status: 'read'
    },
    { 
      type: 'bot', 
      text: '✓ Verifying your order...', 
      time: '16:25',
      status: 'read'
    },
    { 
      type: 'bot', 
      text: '✅ Order verified!\n\n📋 Transfer Details:\n• 1x VIP Ticket\n• Music Festival 2025\n• To: +234 801 234 5678\n\nTransfer fee: ₦500\n\nConfirm transfer?', 
      time: '16:25',
      status: 'read'
    },
    {
      type: 'buttons',
      buttons: ['✅ Confirm Transfer', '❌ Cancel'],
      time: '16:25'
    },
    { 
      type: 'customer', 
      text: '✅ Confirm Transfer', 
      time: '16:26',
      status: 'read'
    },
    { 
      type: 'bot', 
      text: '🎉 Transfer completed successfully!\n\nNew ticket sent to +234 801 234 5678\nYour original ticket is now deactivated.\n\nTransfer confirmation: #TRF-9832', 
      time: '16:26',
      status: 'read'
    },
    { 
      type: 'customer', 
      text: 'Thank you! That was quick', 
      time: '16:27',
      status: 'read'
    },
    { 
      type: 'bot', 
      text: '😊 You\'re welcome! Is there anything else I can help you with?', 
      time: '16:27',
      status: 'read'
    }
  ];

  return (
    <WhatsApp
      contactName="Support Assistant"
      contactAvatar="🤖"
      contactStatus="Online"
      messages={conversation}
    />
  );
};

export default SupportDemo;
