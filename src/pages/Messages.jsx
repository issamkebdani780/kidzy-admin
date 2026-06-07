import { useState, useEffect } from 'react';
import { 
  Mail, 
  Trash2, 
  Phone, 
  MessageSquare, 
  Loader, 
  User, 
  Clock,
  Sparkles
} from 'lucide-react';
import { getMessages, deleteMessage } from '../services/api';

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
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Support Inquiries</h1>
          <p className="text-slate-400 mt-1 font-medium">Customer inquiries and feedback received from the contact form</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 text-slate-300 font-bold px-4 py-3 rounded-2xl text-sm shrink-0 self-start sm:self-auto">
          Total Inquiries: {messages.length}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-3xl font-medium text-sm">
          {error}
        </div>
      )}

      {/* Main Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader className="w-10 h-10 text-primary-500 animate-spin" />
          <p className="text-slate-500 font-bold">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] py-24 flex flex-col items-center justify-center text-slate-500 gap-3 shadow-xl">
          <Mail className="w-12 h-12 text-slate-800" />
          <p className="font-extrabold text-lg text-slate-400">No support inquiries received yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between hover:border-primary-500/30 transition-all duration-300 shadow-xl"
            >
              <div>
                {/* Message Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-850 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-500/10 border border-primary-500/15 flex items-center justify-center text-primary-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base leading-snug">{msg.name}</h3>
                      <a 
                        href={`tel:${msg.phone}`}
                        className="text-xs text-slate-400 hover:text-primary-400 flex items-center gap-1.5 mt-1 font-bold"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{msg.phone}</span>
                      </a>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mt-1">
                    <Clock className="w-3.5 h-3.5" />
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
                <div className="bg-slate-950/30 border border-slate-850/40 rounded-2xl p-4 md:p-5 mb-6">
                  <p className="text-slate-350 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {msg.message}
                  </p>
                </div>
              </div>

              {/* Message Actions */}
              <div className="flex items-center gap-3 border-t border-slate-850 pt-4 mt-auto">
                <a
                  href={formatWhatsAppLink(msg.phone, msg.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl text-xs shadow-lg transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Reply on WhatsApp</span>
                </a>
                
                <button
                  onClick={() => { setDeleteId(msg.id); setDeleteConfirmOpen(true); }}
                  className="p-3 bg-red-500/10 hover:bg-red-650 hover:text-white border border-red-500/10 hover:border-transparent text-red-400 rounded-2xl transition-all cursor-pointer"
                  title="Delete Message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmOpen(false)}></div>
          
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 md:p-8 z-10 relative shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-black text-white">Confirm Message Deletion</h3>
            <p className="text-slate-400 mt-2 text-sm font-medium">
              Are you sure you want to permanently delete this support inquiry? This action cannot be undone.
            </p>

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-650 hover:bg-red-750 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors cursor-pointer"
              >
                Yes, Delete Message
              </button>
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-2xl text-sm transition-colors cursor-pointer"
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
