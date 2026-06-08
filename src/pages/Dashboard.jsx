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
          else if (order.status === 'img_confiremed') imgConfirmed++;
          else if (order.status === 'in delivery') inDelivery++;
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
          <p className="text-slate-400 font-bold">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

  // Story translation helper
  const translateStory = (story) => {
    const storiesMapping = {
      'doctor': 'Little Doctor',
      'astronaut': 'Space Astronaut',
      'engineer': 'Creative Engineer',
      'teacher': 'Role Model Teacher',
      'chef': 'Master Chef',
      'pilot': 'Brave Pilot',
      'artist': 'Talented Artist',
      'writer': 'Little Writer'
    };
    return storiesMapping[story] || story;
  };

  const statusBadges = {
    pending: { label: 'Pending', class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    img_confiremed: { label: 'Image Confirmed', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    'in delivery': { label: 'In Delivery', class: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    paid: { label: 'Paid', class: 'bg-green-500/10 text-green-400 border-green-500/20' },
    cancelled: { label: 'Cancelled', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span>Welcome to Kidzy Dashboard</span>
            <Sparkles className="w-7 h-7 text-accent animate-bounce" />
          </h1>
          <p className="text-slate-400 mt-1 font-medium">Overview of your personalized children books store performance</p>
        </div>
        <div className="text-sm font-bold bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-2 self-start md:self-auto">
          <Calendar className="w-5 h-5 text-primary-400" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-3xl font-medium text-sm">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-primary-400 bg-primary-500/10 border-primary-500/10' },
          { label: 'Pending Review', value: stats.pendingOrders, icon: Clock, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/10' },
          { label: 'Image Confirmed', value: stats.imgConfirmedOrders, icon: Activity, color: 'text-blue-400 bg-blue-500/10 border-blue-500/10' },
          { label: 'In Delivery', value: stats.inDeliveryOrders, icon: Activity, color: 'text-purple-400 bg-purple-500/10 border-purple-500/10' },
          { label: 'Paid Orders', value: stats.paidOrders, icon: CheckCircle, color: 'text-green-400 bg-green-500/10 border-green-500/10' },
        ].map((card, idx) => (
          <div key={idx} className="p-6 bg-slate-900 rounded-[2rem] border border-slate-800 flex items-center justify-between shadow-xl">
            <div>
              <p className="text-slate-400 font-bold text-sm">{card.label}</p>
              <h3 className="text-3xl font-black text-white mt-2">{card.value}</h3>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1 & 2: Recent Orders Table */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] border border-slate-800 p-6 md:p-8 flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <h2 className="text-xl font-extrabold text-white">Recent Orders</h2>
            <Link to="/orders" className="text-primary-400 hover:text-primary-350 text-sm font-bold flex items-center gap-1">
              <span>View all orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 font-bold">
                <ShoppingBag className="w-12 h-12 text-slate-700 mb-3" />
                <p>No orders recorded yet</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 font-bold">
                    <th className="py-3 px-2">ID</th>
                    <th className="py-3 px-4">Kid Name</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Story Type</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-850/50 transition-colors font-medium">
                      <td className="py-4 px-2 font-bold text-slate-300">#{order.id}</td>
                      <td className="py-4 px-4 font-bold text-white">{order.kid_name}</td>
                      <td className="py-4 px-4 text-slate-350">{order.phone}</td>
                      <td className="py-4 px-4 text-slate-350">{translateStory(order.story_type)}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full border text-xs font-bold ${statusBadges[order.status]?.class}`}>
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
        <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-6 md:p-8 flex flex-col shadow-xl">
          <h2 className="text-xl font-extrabold text-white mb-6 border-b border-slate-800 pb-4">Story Types Popularity</h2>
          
          <div className="flex-1 space-y-6">
            {Object.keys(storyBreakdown).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 font-bold">
                <Sparkles className="w-12 h-12 text-slate-700 mb-3" />
                <p>No story statistics yet</p>
              </div>
            ) : (
              Object.entries(storyBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([story, count]) => {
                  const percentage = stats.totalOrders > 0 
                    ? Math.round((count / stats.totalOrders) * 100) 
                    : 0;

                  return (
                    <div key={story} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-200">{translateStory(story)}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-xs">({count} orders)</span>
                          <span className="font-bold text-primary-400">{percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full rounded-full transition-all duration-500" 
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
