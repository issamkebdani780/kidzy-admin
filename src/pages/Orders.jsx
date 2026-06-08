import { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  ChevronDown,
  Check,
  Clock,
  Image,
  Truck,
  CheckCircle,
  XCircle,
  Upload,
  ExternalLink,
  Save,
  PhoneOff,
  Package,
  MapPin
} from 'lucide-react';
import { getOrders, updateOrderStatus, deleteOrder, getOrderHistory, updateOrderDetails } from '../services/api';

const StatusDropdown = ({ value, onChange, disabled, size = 'md' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const statuses = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-500' },
    { value: 'confiremed', label: 'Confirmed', icon: CheckCircle, color: 'text-blue-500' },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-rose-500' },
    { value: 'no answer', label: 'No Answer', icon: PhoneOff, color: 'text-slate-400' },
    { value: 'img_confieremed', label: 'Image Confirmed', icon: Image, color: 'text-sky-500' },
    { value: 'in_preparation', label: 'In Preparation', icon: Package, color: 'text-orange-500' },
    { value: 'in_delivery', label: 'In Delivery', icon: Truck, color: 'text-indigo-500' },
    { value: 'paid', label: 'Paid', icon: CheckCircle, color: 'text-emerald-500' },
    { value: 'return', label: 'Returned', icon: MapPin, color: 'text-purple-500' },
  ];

  let currentKey = value;
  if (value === 'in delivery') currentKey = 'in_delivery';
  if (value === 'img_confiremed') currentKey = 'img_confieremed';

  const current = statuses.find(s => s.value === currentKey) || statuses[0];
  const CurrentIcon = current.icon;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerClasses = size === 'sm'
    ? 'px-2.5 py-1.5 rounded-lg text-xs gap-1.5'
    : 'px-3.5 py-2.5 rounded-xl text-sm gap-2.5';

  const iconClasses = size === 'sm'
    ? 'w-3.5 h-3.5'
    : 'w-4 h-4';

  const itemPadding = size === 'sm'
    ? 'px-2.5 py-1.5 text-xs'
    : 'px-3.5 py-2 text-sm';

  return (
    <div ref={dropdownRef} className="relative inline-block w-full text-left">
      <style>{`
        .custom-select-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-select-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-select-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 9999px;
        }
        .custom-select-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border bg-white hover:bg-slate-50 text-slate-700 transition-all duration-200 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${triggerClasses} ${isOpen
            ? 'border-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.08)]'
            : 'border-slate-200'
          }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <CurrentIcon className={`${iconClasses} ${current.color} shrink-0`} />
          <span className="font-semibold text-slate-700 truncate">{current.label}</span>
        </span>
        <ChevronDown
          className={`${iconClasses} text-slate-400 shrink-0 transition-transform duration-200`}
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 z-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1 max-h-60 overflow-y-auto custom-select-scrollbar min-w-[180px]">
          {statuses.map((s) => {
            const isSelected = currentKey === s.value;
            const ItemIcon = s.icon;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => {
                  onChange(s.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between hover:bg-slate-50 font-semibold transition-colors cursor-pointer text-left ${itemPadding} ${isSelected ? 'bg-slate-50 text-slate-900 font-bold' : 'text-slate-600'
                  }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <ItemIcon className={`${iconClasses} ${s.color} shrink-0`} />
                  <span className="truncate">{s.label}</span>
                </span>
                {isSelected && <Check className={`${iconClasses} text-primary-500 shrink-0`} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  // History State
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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
  const [zoomImageSrc, setZoomImageSrc] = useState(null);

  // New features state
  const [canvaUrlInput, setCanvaUrlInput] = useState('');
  const [savingCanva, setSavingCanva] = useState(false);
  const [uploadingChar, setUploadingChar] = useState(false);

  // Synchronize Canva URL input when selected order changes
  useEffect(() => {
    if (selectedOrder) {
      setCanvaUrlInput(selectedOrder.canva_url || '');
    } else {
      setCanvaUrlInput('');
    }
  }, [selectedOrder]);

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

  // Fetch status history when order details modal is opened
  useEffect(() => {
    if (selectedOrder) {
      const fetchHistory = async () => {
        try {
          setLoadingHistory(true);
          const res = await getOrderHistory(selectedOrder.id);
          if (res.success) {
            setOrderHistory(res.history || []);
          }
        } catch (err) {
          console.error('Failed to load history:', err);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    } else {
      setOrderHistory([]);
    }
  }, [selectedOrder]);

  // Handle status update
  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const res = await updateOrderStatus(id, newStatus);
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
          // Refresh status history
          try {
            const histRes = await getOrderHistory(id);
            if (histRes.success) {
              setOrderHistory(histRes.history || []);
            }
          } catch (histErr) {
            console.error('Failed to reload order history:', histErr);
          }
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

  // Handle upload of kid's character illustration
  const handleCharacterImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingChar(true);
      const formData = new FormData();
      formData.append('character_image', file);

      const res = await updateOrderDetails(selectedOrder.id, formData);
      if (res.success) {
        // Update local orders list state
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, kid_char_image_url: res.order.kid_char_image_url } : o));
        // Update selectedOrder modal state
        setSelectedOrder(prev => ({ ...prev, kid_char_image_url: res.order.kid_char_image_url }));

        // Refresh order history
        try {
          const histRes = await getOrderHistory(selectedOrder.id);
          if (histRes.success) {
            setOrderHistory(histRes.history || []);
          }
        } catch (histErr) {
          console.error('Failed to reload order history:', histErr);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to upload character illustration');
    } finally {
      setUploadingChar(false);
    }
  };

  // Handle saving the Canva link
  const handleSaveCanvaUrl = async () => {
    try {
      setSavingCanva(true);
      const formData = new FormData();
      formData.append('canva_url', canvaUrlInput);

      const res = await updateOrderDetails(selectedOrder.id, formData);
      if (res.success) {
        // Update local orders list state
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, canva_url: res.order.canva_url } : o));
        // Update selectedOrder modal state
        setSelectedOrder(prev => ({ ...prev, canva_url: res.order.canva_url }));

        // Refresh order history
        try {
          const histRes = await getOrderHistory(selectedOrder.id);
          if (histRes.success) {
            setOrderHistory(histRes.history || []);
          }
        } catch (histErr) {
          console.error('Failed to reload order history:', histErr);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to save Canva link');
    } finally {
      setSavingCanva(false);
    }
  };

  // Story translation helper
  const translateStory = (story) => {
    const storiesMapping = {
      'doctor': 'Doctor',
      'astronaut': 'Astronaut',
      'engineer': 'Engineer',
      'teacher': 'Teacher',
      'chef': 'Chef',
      'pilot': 'Pilot',
      'artist': 'Artist',
      'writer': 'Little Writer'
    };
    return storiesMapping[story] || story;
  };

  // Status badges definitions
  const statusBadges = {
    pending: { label: 'Pending', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    confiremed: { label: 'Confirmed', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    cancelled: { label: 'Cancelled', class: 'bg-rose-50 text-rose-700 border-rose-200' },
    'no answer': { label: 'No Answer', class: 'bg-slate-50 text-slate-700 border-slate-200' },
    img_confieremed: { label: 'Image Confirmed', class: 'bg-sky-50 text-sky-700 border-sky-200' },
    in_preparation: { label: 'In Preparation', class: 'bg-orange-50 text-orange-700 border-orange-200' },
    in_delivery: { label: 'In Delivery', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    paid: { label: 'Paid', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    routeur: { label: 'Router', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    // Backwards compatibility with old DB values
    img_confiremed: { label: 'Image Confirmed', class: 'bg-sky-50 text-sky-700 border-sky-200' },
    'in delivery': { label: 'In Delivery', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  };

  // Filter & Search computation
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.kid_name.toLowerCase().includes(search.toLowerCase()) ||
      order.phone.includes(search) ||
      order.id.toString().includes(search);

    const matchesStatus =
      statusFilter === 'all' ||
      order.status === statusFilter ||
      (statusFilter === 'in_delivery' && order.status === 'in delivery') ||
      (statusFilter === 'img_confieremed' && order.status === 'img_confiremed');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 mt-1 text-xs font-medium">Track and process personalized Kidzy children book orders</p>
        </div>
        <div className="bg-white border border-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-xl text-xs shadow-none">
          Total Orders: {totalOrders}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-750 p-4 rounded-xl font-semibold text-xs">
          {error}
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-none">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto">
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'confiremed', label: 'Confirmed' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'no answer', label: 'No Answer' },
            { value: 'img_confieremed', label: 'Image Confirmed' },
            { value: 'in_preparation', label: 'In Preparation' },
            { value: 'in_delivery', label: 'In Delivery' },
            { value: 'paid', label: 'Paid' },
            { value: 'routeur', label: 'Router' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${statusFilter === tab.value
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-1.5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 text-xs font-medium text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-none overflow-hidden md:overflow-visible">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-400 text-xs font-semibold">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <Sparkles className="w-10 h-10 text-slate-200" />
            <p className="font-semibold text-sm text-slate-500">No orders match this search or filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto md:overflow-visible">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200 font-bold bg-slate-50/50 uppercase tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Kid Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Story</th>
                  <th className="py-3 px-4">Character</th>
                  <th className="py-3 px-4">Canva</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/40 transition-colors font-medium">
                    <td className="py-2.5 px-4 text-slate-500 font-bold">#{order.id}</td>
                    <td className="py-2.5 px-4 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(order.created_at).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{order.kid_name}</td>
                    <td className="py-2.5 px-4 text-slate-600">{order.phone}</td>
                    <td className="py-2.5 px-4 text-slate-600">{translateStory(order.story_type)}</td>
                    <td className="py-2.5 px-4">
                      {order.kid_char_image_url ? (
                        <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex-shrink-0 overflow-hidden">
                          <img
                            src={order.kid_char_image_url}
                            alt="Character"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {order.canva_url ? (
                        <a
                          href={order.canva_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-150/70 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-md text-[11px] font-semibold transition-all cursor-pointer"
                        >
                          <span>Canva</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No link</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusDropdown
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(val) => handleStatusChange(order.id, val)}
                        size="sm"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-lg transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setDeleteId(order.id); setDeleteConfirmOpen(true); }}
                          className="p-1.5 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-650 text-slate-500 rounded-lg transition-all cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
          <div className="flex items-center justify-between px-4 py-2.5 bg-white border-t border-slate-200 text-slate-500">
            <span className="text-[11px] font-semibold">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>

          <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl p-6 z-10 relative shadow-xl flex flex-col lg:flex-row gap-6 max-h-[90vh] overflow-y-auto text-slate-800 text-xs">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image Previews (Left Column) */}
            <div className="w-full lg:w-1/3 flex flex-col gap-5 lg:border-r border-slate-200 lg:pr-6">
              {/* Child Photo */}
              <div className="flex flex-col items-start w-full">
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Child Photo</h3>
                <div
                  className="w-full aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden border border-slate-200 relative group cursor-pointer"
                  onClick={() => setZoomImageSrc(selectedOrder.image_url)}
                >
                  <img
                    src={selectedOrder.image_url}
                    alt={selectedOrder.kid_name}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-103"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[11px] font-semibold">
                    Click to Zoom
                  </div>
                </div>
              </div>

              {/* Kid Character Photo */}
              <div className="flex flex-col items-start w-full">
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Character Illustration</h3>
                {selectedOrder.kid_char_image_url ? (
                  <div className="w-full relative group">
                    <div
                      className="w-full aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden border border-slate-200 relative cursor-pointer"
                      onClick={() => setZoomImageSrc(selectedOrder.kid_char_image_url)}
                    >
                      <img
                        src={selectedOrder.kid_char_image_url}
                        alt="Character illustration"
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-103"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[11px] font-semibold">
                        Click to Zoom
                      </div>
                    </div>

                    {/* Upload button overlay */}
                    <label className="absolute bottom-2.5 right-2.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-750 rounded-lg border border-slate-200 text-[11px] font-semibold cursor-pointer transition-all flex items-center gap-1 shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>{uploadingChar ? 'Uploading...' : 'Change'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCharacterImageUpload}
                        disabled={uploadingChar}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className={`w-full aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all hover:bg-slate-50 ${uploadingChar
                      ? 'border-blue-500/50 bg-slate-50'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                    }`}>
                    {uploadingChar ? (
                      <>
                        <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                        <span className="text-[11px] text-slate-500 font-semibold">Uploading illustration...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-slate-200 text-slate-400">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div className="text-center">
                          <span className="text-[11px] font-bold text-slate-700 block">Upload illustration</span>
                          <span className="text-[9px] text-slate-400 font-medium mt-0.5 block">png, jpg, webp</span>
                        </div>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCharacterImageUpload}
                      disabled={uploadingChar}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Information details (Middle Column) */}
            <div className="w-full lg:w-1/3 flex flex-col justify-between lg:border-r border-slate-200 lg:pr-6">
              <div>
                <span className="inline-block bg-slate-100 text-slate-700 rounded-md px-2 py-0.5 text-[10px] font-semibold">
                  Order #{selectedOrder.id}
                </span>

                <h2 className="text-xl font-bold text-slate-900 mt-3">{selectedOrder.kid_name}</h2>

                <div className="mt-4 space-y-3 font-medium text-slate-650">
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400 shrink-0">Story Type:</span>
                    <span className="text-slate-800 font-semibold">{translateStory(selectedOrder.story_type)}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400 shrink-0">Phone:</span>
                    <span className="text-slate-800">{selectedOrder.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400 shrink-0">Order Date:</span>
                    <span className="text-slate-800">
                      {new Date(selectedOrder.created_at).toLocaleString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Status selector */}
                <div className="mt-5 space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Order Status <span className="text-blue-600">*</span>
                  </label>
                  <StatusDropdown
                    value={selectedOrder.status}
                    onChange={(val) => handleStatusChange(selectedOrder.id, val)}
                  />
                </div>

                {/* Canva URL Input */}
                <div className="mt-5 space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Canva Project Link
                  </label>
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        placeholder="https://www.canva.com/design/..."
                        value={canvaUrlInput}
                        onChange={(e) => setCanvaUrlInput(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none text-slate-800 placeholder-slate-450 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={savingCanva || canvaUrlInput === (selectedOrder.canva_url || '')}
                      onClick={handleSaveCanvaUrl}
                      className="px-3 bg-white hover:bg-slate-50 disabled:bg-slate-50 text-slate-700 disabled:text-slate-400 border border-slate-200 rounded-lg transition-all font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed shadow-none"
                    >
                      {savingCanva ? (
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {selectedOrder.canva_url && (
                      <a
                        href={selectedOrder.canva_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg transition-all font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer"
                        title="Open Canva Project"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-3.5 border-t border-slate-200 flex items-center justify-end">
                <button
                  onClick={() => { setDeleteId(selectedOrder.id); setDeleteConfirmOpen(true); }}
                  className="flex items-center justify-center gap-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-semibold py-2 px-3.5 rounded-lg transition-all cursor-pointer text-xs"
                  title="Delete Order Permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Order</span>
                </button>
              </div>
            </div>

            {/* Order History Timeline (Right Column) */}
            <div className="w-full lg:w-1/3 flex flex-col pt-5 lg:pt-0">
              <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3">Status Update History</h3>
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-10 gap-1.5">
                  <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="text-slate-400 text-[10px] font-semibold">Loading history...</span>
                </div>
              ) : orderHistory.length === 0 ? (
                <div className="text-slate-400 text-xs py-10 text-center font-medium">
                  No status updates recorded yet.
                </div>
              ) : (
                <div className="relative border-l border-slate-200 pl-4 space-y-4 ml-1.5 py-1.5 flex-1 max-h-[350px] overflow-y-auto pr-1">
                  {orderHistory.map((hist) => (
                    <div key={hist.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[20.5px] top-1.5 w-2 h-2 rounded-full bg-white border-2 border-blue-600"></div>

                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full border text-[9px] font-bold ${statusBadges[hist.status]?.class || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {statusBadges[hist.status]?.label || hist.status}
                        </span>
                        <p className="text-[11px] text-slate-600 mt-1">{hist.notes}</p>
                        <span className="text-[9px] text-slate-400 font-medium block mt-0.5">
                          {new Date(hist.created_at).toLocaleString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom */}
      {zoomImageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90" onClick={() => setZoomImageSrc(null)}>
          <button
            className="absolute top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-full cursor-pointer transition-colors"
            onClick={() => setZoomImageSrc(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={zoomImageSrc}
            alt="Zoomed"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/10"
          />
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

            <h3 className="text-base font-bold text-slate-900">Confirm Order Deletion</h3>
            <p className="text-slate-550 mt-1.5 text-xs font-medium">
              Are you sure you want to permanently delete this order? This action cannot be undone.
            </p>

            <div className="flex items-center gap-2 mt-6">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Delete Order
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

export default Orders;
