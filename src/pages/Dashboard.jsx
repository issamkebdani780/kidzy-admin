import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Clock, 
  Activity, 
  CheckCircle, 
  Mail, 
  ArrowRight, 
  Loader, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { getOrders, getMessages } from '../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    imgConfirmedOrders: 0,
    inDeliveryOrders: 0,
    paidOrders: 0,
    cancelledOrders: 0,
    totalMessages: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [storyBreakdown, setStoryBreakdown] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const ordersRes = await getOrders(1, 100);
        const messagesRes = await getMessages();

        const orders = ordersRes.orders || [];
        const totalOrders = ordersRes.total || orders.length;

        let pending = 0;
        let imgConfirmed = 0;
        let inDelivery = 0;
        let paid = 0;
        let cancelled = 0;
        const stories = {};

        orders.forEach(order => {
          if (order.status === 'pending') pending++;
          else if (order.status === 'img_confieremed' || order.status === 'img_confiremed') imgConfirmed++;
          else if (order.status === 'in_delivery' || order.status === 'in delivery') inDelivery++;
          else if (order.status === 'paid') paid++;
          else if (order.status === 'cancelled') cancelled++;

          if (order.story_type) {
            stories[order.story_type] = (stories[order.story_type] || 0) + 1;
          }
        });

        setStats({
          totalOrders,
          pendingOrders: pending,
          imgConfirmedOrders: imgConfirmed,
          inDeliveryOrders: inDelivery,
          paidOrders: paid,
          cancelledOrders: cancelled,
          totalMessages: messagesRes.contacts ? messagesRes.contacts.length : 0
        });

        setRecentOrders(orders.slice(0, 5));
        setStoryBreakdown(stories);
      } catch (err) {
        console.error('Dashboard loading error:', err);
        setError('Failed to load dashboard statistics. Please check the server connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-10 h-10 text-primary-500 animate-spin" />
          <p className="text-slate-500 font-bold">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-xs font-medium">Overview of your personalized children books store performance</p>
        </div>
        <div className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 flex items-center gap-2 self-start md:self-auto shadow-none">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl font-semibold text-xs">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag },
          { label: 'Pending Review', value: stats.pendingOrders, icon: Clock },
          { label: 'Image Confirmed', value: stats.imgConfirmedOrders, icon: Activity },
          { label: 'In Delivery', value: stats.inDeliveryOrders, icon: Activity },
          { label: 'Paid Orders', value: stats.paidOrders, icon: CheckCircle },
        ].map((card, idx) => (
          <div key={idx} className="p-5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between shadow-none">
            <div>
              <p className="text-slate-500 font-semibold text-xs">{card.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1.5">{card.value}</h3>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 bg-slate-50 text-slate-650">
              <card.icon className="w-4.5 h-4.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 & 2: Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 flex flex-col shadow-none">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200/80 pb-3">
            <h2 className="text-base font-bold text-slate-900">Recent Orders</h2>
            <Link to="/orders" className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 font-bold">
                <ShoppingBag className="w-10 h-10 text-slate-200 mb-2" />
                <p className="text-xs">No orders recorded yet</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-450 border-b border-slate-200/80 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-2">ID</th>
                    <th className="py-2.5 px-3">Kid Name</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Story</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors font-medium">
                      <td className="py-3 px-2 font-bold text-slate-500">#{order.id}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{order.kid_name}</td>
                      <td className="py-3 px-3 text-slate-600">{order.phone}</td>
                      <td className="py-3 px-3 text-slate-600">{translateStory(order.story_type)}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${statusBadges[order.status]?.class}`}>
                          {statusBadges[order.status]?.label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Column 3: Story Type Popularity Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex flex-col shadow-none">
          <h2 className="text-base font-bold text-slate-900 mb-4 border-b border-slate-200/80 pb-3">Story Types Popularity</h2>
          
          <div className="flex-1 space-y-4">
            {Object.keys(storyBreakdown).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 font-bold">
                <Sparkles className="w-10 h-10 text-slate-200 mb-2" />
                <p className="text-xs">No story statistics yet</p>
              </div>
            ) : (
              Object.entries(storyBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([story, count]) => {
                  const percentage = stats.totalOrders > 0 
                    ? Math.round((count / stats.totalOrders) * 100) 
                    : 0;

                  return (
                    <div key={story} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700">{translateStory(story)}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-[10px]">({count})</span>
                          <span className="font-bold text-blue-600">{percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
