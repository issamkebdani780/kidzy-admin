import { useState, useEffect } from 'react';
import { 
  Mail, 
  Trash2, 
  Phone, 
  MessageSquare, 
  Loader, 
  User, 
  Clock,
  Sparkles,
  Check
} from 'lucide-react';
import { getMessages, deleteMessage, viewMessage } from '../services/api';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Deletion state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fetchMessagesData = async () => {
    try {
      setLoading(true);
      const res = await getMessages();
      if (res.success) {
        setMessages(res.contacts || []);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
      setError('An error occurred while loading messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessagesData();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setLoading(true);
      const res = await deleteMessage(deleteId);
      if (res.success) {
        setDeleteConfirmOpen(false);
        setDeleteId(null);
        fetchMessagesData();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete message');
      setLoading(false);
    }
  };

  const handleMarkViewed = async (id) => {
    try {
      await viewMessage(id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_viewed: 1 } : m));
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  const handleWhatsAppClick = (id, phone, name) => {
    handleMarkViewed(id);
    window.open(formatWhatsAppLink(phone, name), '_blank', 'noreferrer');
  };

  const formatWhatsAppLink = (phone, name) => {
    let cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '213' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('213') && cleanPhone.length === 9) {
      cleanPhone = '213' + cleanPhone;
    }
    const message = encodeURIComponent(`مرحباً أستاذ(ة) ${name}،\nلقد تلقينا استفساركم عبر موقع Kidzy وسعداء جداً بالتواصل معكم. كيف يمكننا مساعدتكم؟`);
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support Inquiries</h1>
          <p className="text-slate-550 mt-1 text-xs font-medium">Customer inquiries and feedback received from the contact form</p>
        </div>
        <div className="bg-white border border-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-xl text-xs shadow-none">
          Total Inquiries: {messages.length}
        </div>
      </div>

      {error && (
        <div className="bg-red-55 border border-red-200 text-red-750 p-4 rounded-xl font-semibold text-xs">
          {error}
        </div>
      )}

      {/* Main Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-400 text-xs font-semibold">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-20 flex flex-col items-center justify-center text-slate-400 gap-2 shadow-none">
          <Mail className="w-10 h-10 text-slate-200" />
          <p className="font-semibold text-sm text-slate-500">No support inquiries received yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {messages.map((msg) => {
            const isUnread = msg.is_viewed === 0;
            return (
              <div 
                key={msg.id} 
                className={`bg-white border rounded-xl p-5 flex flex-col justify-between hover:border-slate-350 transition-all duration-200 shadow-none ${
                  isUnread ? 'border-slate-250 ring-2 ring-blue-600/5' : 'border-slate-200 opacity-90'
                }`}
              >
                <div>
                  {/* Message Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5 mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        isUnread 
                          ? 'bg-blue-50 border border-blue-100 text-blue-600' 
                          : 'bg-slate-50 border border-slate-200 text-slate-400'
                      }`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-slate-900 text-xs leading-snug">{msg.name}</h3>
                          {isUnread && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-50 border border-blue-100 text-blue-600 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <a 
                          href={`tel:${msg.phone}`}
                          className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 mt-0.5 font-semibold"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{msg.phone}</span>
                        </a>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>
                        {new Date(msg.created_at).toLocaleDateString('en-US', { 
                          day: 'numeric', 
                          month: 'short', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-5">
                    <p className="text-slate-650 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                      {msg.message}
                    </p>
                  </div>
                </div>

                {/* Message Actions */}
                <div className="flex items-center gap-2 border-t border-slate-100 pt-3.5 mt-auto">
                  <button
                    onClick={() => handleWhatsAppClick(msg.id, msg.phone, msg.name)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Reply on WhatsApp</span>
                  </button>
                  
                  {isUnread && (
                    <button
                      onClick={() => handleMarkViewed(msg.id)}
                      className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 hover:text-blue-700 rounded-lg transition-all cursor-pointer"
                      title="Mark as Read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => { setDeleteId(msg.id); setDeleteConfirmOpen(true); }}
                    className="p-2 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-650 text-slate-500 rounded-lg transition-all cursor-pointer"
                    title="Delete Message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirmOpen(false)}></div>
          
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-xl p-6 z-10 relative shadow-xl text-center text-slate-800 text-xs">
            <div className="w-12 h-12 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-base font-bold text-slate-900">Confirm Message Deletion</h3>
            <p className="text-slate-550 mt-1.5 text-xs font-medium">
              Are you sure you want to permanently delete this support inquiry? This action cannot be undone.
            </p>

            <div className="flex items-center gap-2 mt-6">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Delete Message
              </button>
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
