import { useState, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  Trash2, 
  Phone, 
  MessageSquare, 
  Loader, 
  ChevronRight, 
  ChevronLeft,
  X,
  Calendar,
  Sparkles
} from 'lucide-react';
import { getOrders, updateOrderStatus, deleteOrder } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const limit = 15;

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState(false);

  const fetchOrdersData = async () => {
    try {
      setLoading(true);
      const res = await getOrders(page, limit);
      if (res.success) {
        setOrders(res.orders || []);
        setTotalPages(res.totalPages || 1);
        setTotalOrders(res.total || 0);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('An error occurred while loading orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();
  }, [page]);

  // Handle status update
  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const res = await updateOrderStatus(id, newStatus);
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle delete order
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setLoading(true);
      const res = await deleteOrder(deleteId);
      if (res.success) {
        setDeleteConfirmOpen(false);
        setDeleteId(null);
        setSelectedOrder(null);
        if (orders.length === 1 && page > 1) {
          setPage(p => p - 1);
        } else {
          fetchOrdersData();
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to delete order');
      setLoading(false);
    }
  };

  // Format WhatsApp Link
  const formatWhatsAppLink = (phone, kidName, storyType) => {
    let cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '213' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('213') && cleanPhone.length === 9) {
      cleanPhone = '213' + cleanPhone;
    }

    const storyName = translateStory(storyType);
    const message = encodeURIComponent(`مرحباً بكم من متجر Kidzy! 📚\nنحن بصدد مراجعة طلبكم الخاص بالطفل(ة) "${kidName}" ونوع القصة "${storyName}".\nنريد تأكيد بعض التفاصيل معكم لبدء التصميم والطباعة.`);
    
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  // Story translation helper
  const translateStory = (story) => {
    const storiesMapping = {
      'doctor': 'Little Doctor 🩺',
      'astronaut': 'Space Astronaut 🚀',
      'engineer': 'Creative Engineer 🏗️',
      'teacher': 'Role Model Teacher 🍎',
      'chef': 'Master Chef 🍳',
      'pilot': 'Brave Pilot ✈️',
      'artist': 'Talented Artist 🎨',
      'writer': 'Little Writer 📝'
    };
    return storiesMapping[story] || story;
  };

  // Status badges definitions
  const statusBadges = {
    pending: { label: 'Pending', class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25' },
    processing: { label: 'Processing', class: 'bg-blue-500/10 text-blue-400 border-blue-500/25' },
    shipped: { label: 'Shipped', class: 'bg-purple-500/10 text-purple-400 border-purple-500/25' },
    delivered: { label: 'Delivered', class: 'bg-green-500/10 text-green-400 border-green-500/25' },
    cancelled: { label: 'Cancelled', class: 'bg-red-500/10 text-red-400 border-red-500/25' },
  };

  // Filter & Search computation
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.kid_name.toLowerCase().includes(search.toLowerCase()) || 
      order.phone.includes(search) || 
      order.id.toString().includes(search);
      
    const matchesStatus = 
      statusFilter === 'all' || 
      order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Orders Management</h1>
          <p className="text-slate-400 mt-1 font-medium">Track and process personalized Kidzy children book orders</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 text-slate-300 font-bold px-4 py-3 rounded-2xl text-sm shrink-0 self-start sm:self-auto">
          Total Orders: {totalOrders}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-3xl font-medium text-sm">
          {error}
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-[2rem] shadow-xl">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 overflow-x-auto">
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                statusFilter === tab.value
                  ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/10'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by kid name, phone, number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/40 border border-slate-850 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:border-primary-500 text-sm font-medium text-slate-200"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader className="w-10 h-10 text-primary-500 animate-spin" />
            <p className="text-slate-500 font-bold">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
            <Sparkles className="w-12 h-12 text-slate-800" />
            <p className="font-extrabold text-lg text-slate-400">No orders match this search or filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80 font-bold bg-slate-850/30">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Kid Name</th>
                  <th className="py-4 px-6">Phone Number</th>
                  <th className="py-4 px-6">Story Type</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-850/30 transition-colors font-medium">
                    <td className="py-4 px-6 font-bold text-slate-300">#{order.id}</td>
                    <td className="py-4 px-6 text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {new Date(order.created_at).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-white text-base">{order.kid_name}</td>
                    <td className="py-4 px-6 text-slate-350">{order.phone}</td>
                    <td className="py-4 px-6 text-slate-350">{translateStory(order.story_type)}</td>
                    <td className="py-4 px-6">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-bold bg-slate-900 outline-none cursor-pointer border-slate-800 ${
                          statusBadges[order.status]?.class
                        }`}
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="processing">⚙️ Processing</option>
                        <option value="shipped">📦 Shipped</option>
                        <option value="delivered">✅ Delivered</option>
                        <option value="cancelled">❌ Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 bg-slate-800 hover:bg-primary-600 hover:text-white text-primary-400 rounded-xl transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={formatWhatsAppLink(order.phone, order.kid_name, order.story_type)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-slate-800 hover:bg-green-600 hover:text-white text-green-400 rounded-xl transition-colors cursor-pointer"
                          title="WhatsApp Chat"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => { setDeleteId(order.id); setDeleteConfirmOpen(true); }}
                          className="p-2 bg-slate-800 hover:bg-red-600 hover:text-white text-red-400 rounded-xl transition-colors cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-850/20 border-t border-slate-800 text-slate-400">
            <span className="text-xs font-bold">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
          
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2.5rem] p-6 md:p-8 z-10 relative shadow-2xl flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Preview */}
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <h3 className="text-slate-400 text-xs font-bold mb-3">Child Photo</h3>
              <div 
                className="w-full aspect-[4/3] md:aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative group cursor-pointer"
                onClick={() => setZoomImage(true)}
              >
                <img
                  src={selectedOrder.image_url}
                  alt={selectedOrder.kid_name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                  Click to Zoom
                </div>
              </div>
            </div>

            {/* Information details */}
            <div className="w-full md:w-1/2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold px-3 py-1 bg-slate-800 text-slate-300 rounded-full">
                  Order #{selectedOrder.id}
                </span>
                
                <h2 className="text-2xl font-black text-white mt-4">{selectedOrder.kid_name}</h2>
                
                <div className="mt-6 space-y-4 font-medium text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 shrink-0">Story Type:</span>
                    <span className="text-white font-bold">{translateStory(selectedOrder.story_type)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 shrink-0">Phone:</span>
                    <span className="text-white">{selectedOrder.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 shrink-0">Order Date:</span>
                    <span className="text-white">
                      {new Date(selectedOrder.created_at).toLocaleString('en-US', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Status selector */}
                <div className="mt-6 space-y-2">
                  <label className="block text-xs font-bold text-slate-500">Current Order Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold bg-slate-950/40 outline-none cursor-pointer border-slate-850 ${
                      statusBadges[selectedOrder.status]?.class
                    }`}
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="processing">⚙️ Processing</option>
                    <option value="shipped">📦 Shipped</option>
                    <option value="delivered">✅ Delivered</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <a
                  href={formatWhatsAppLink(selectedOrder.phone, selectedOrder.kid_name, selectedOrder.story_type)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-colors cursor-pointer text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Chat</span>
                </a>
                <button
                  onClick={() => { setDeleteId(selectedOrder.id); setDeleteConfirmOpen(true); }}
                  className="p-3.5 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-2xl transition-colors cursor-pointer"
                  title="Delete Order Permanently"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Image Zoom */}
      {zoomImage && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90" onClick={() => setZoomImage(false)}>
          <button 
            className="absolute top-4 right-4 p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full cursor-pointer"
            onClick={() => setZoomImage(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedOrder.image_url}
            alt={selectedOrder.kid_name}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border-2 border-slate-800"
          />
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
            
            <h3 className="text-xl font-black text-white">Confirm Order Deletion</h3>
            <p className="text-slate-400 mt-2 text-sm font-medium">
              Are you sure you want to permanently delete this order? This action cannot be undone.
            </p>

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-655 hover:bg-red-750 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors cursor-pointer"
              >
                Yes, Delete Order
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

export default Orders;
