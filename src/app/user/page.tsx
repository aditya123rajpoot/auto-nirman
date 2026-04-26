'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaBuilding, FaCalendarAlt, FaCrown, FaCog,
  FaBell, FaShieldAlt, FaSignOutAlt, FaEdit,
  FaCheckCircle, FaClock, FaChartLine,
} from 'react-icons/fa';

const mockProjects = [
  { name: 'Gomti Nagar Residential Complex', status: 'Active', value: '₹4.2 Cr', date: 'Mar 2025', leakage: '₹18L saved' },
  { name: 'Hazratganj Commercial Tower', status: 'Completed', value: '₹12.8 Cr', date: 'Jan 2025', leakage: '₹54L saved' },
  { name: 'Alambagh Housing Project', status: 'Review', value: '₹2.9 Cr', date: 'Apr 2025', leakage: 'Pending' },
];

const statusColor: Record<string, string> = {
  Active: '#38bdf8',
  Completed: '#4ade80',
  Review: '#f59e0b',
};

export default function UserPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'plan' | 'settings'>('profile');
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [twoFA, setTwoFA] = useState(false);

  // Real user data from session, fallback to guest values
  const user = {
    name: session?.user?.name ?? 'Guest User',
    email: session?.user?.email ?? 'guest@autonirman.com',
    avatar: session?.user?.image ?? null,
    phone: '+91 98765 43210',
    location: 'Lucknow, Uttar Pradesh',
    company: 'Autonirman',
    joinDate: 'January 2025',
    plan: 'Pro',
    planExpiry: 'December 2025',
  };

  const isGuest = status === 'unauthenticated' ||
    (typeof window !== 'undefined' && localStorage.getItem('autonirman_guest') === 'true');

  const handleSignOut = async () => {
    if (typeof window !== 'undefined') localStorage.removeItem('autonirman_guest');
    await signOut({ callbackUrl: '/login' });
  };

  const tabs = [
    { key: 'profile',  label: 'Profile',     icon: FaUser },
    { key: 'projects', label: 'Projects',     icon: FaChartLine },
    { key: 'plan',     label: 'Subscription', icon: FaCrown },
    { key: 'settings', label: 'Settings',     icon: FaCog },
  ] as const;

  return (
    <div className="relative min-h-screen pt-20 px-4 pb-12 bg-black text-white font-sans overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_1px_1px,_#38bdf811_1px,_transparent_0)] [background-size:20px_20px] opacity-10" />

      <div className="relative z-10 max-w-3xl mx-auto">

        {/* Guest banner */}
        {isGuest && (
          <div className="mb-6 flex items-center justify-between bg-blue-400/10 border border-blue-400/30 rounded-xl px-4 py-3">
            <p className="text-sm text-blue-300">You're browsing as a guest. Sign in for full access.</p>
            <button
              onClick={() => router.push('/login')}
              className="text-xs bg-blue-400 text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-300 transition-colors"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-24 h-24 rounded-full border-2 border-blue-400 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-2 border-blue-400 bg-white/10 backdrop-blur flex items-center justify-center text-3xl font-bold text-blue-400">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            <button className="absolute bottom-0 right-0 bg-blue-400 text-black rounded-full p-1.5 hover:bg-blue-300 transition-colors">
              <FaEdit size={11} />
            </button>
          </div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-slate-400 text-sm">{user.company}</p>
          <span className="mt-2 flex items-center gap-1 text-xs bg-blue-400/10 border border-blue-400/30 text-blue-300 rounded-full px-3 py-1">
            <FaCrown size={10} /> {isGuest ? 'Guest' : user.plan + ' Plan'}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-1.5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key ? 'bg-blue-400 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon size={13} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
            {[
              { icon: FaUser,         label: 'Full Name',    value: user.name },
              { icon: FaEnvelope,     label: 'Email',        value: user.email },
              { icon: FaPhone,        label: 'Phone',        value: user.phone },
              { icon: FaMapMarkerAlt, label: 'Location',     value: user.location },
              { icon: FaBuilding,     label: 'Company',      value: user.company },
              { icon: FaCalendarAlt,  label: 'Member since', value: user.joinDate },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center text-blue-400">
                  <row.icon size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">{row.label}</p>
                  <p className="text-sm font-medium">{row.value}</p>
                </div>
                <button className="text-slate-600 hover:text-blue-400 transition-colors">
                  <FaEdit size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 mb-2">
              {[
                { label: 'Total Projects', value: '3' },
                { label: 'Total Saved',    value: '₹72L' },
                { label: 'Active',         value: '1' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-blue-400">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            {mockProjects.map((p, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-sm leading-snug max-w-xs">{p.name}</h3>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full border ml-2 shrink-0"
                    style={{ color: statusColor[p.status], borderColor: statusColor[p.status] + '44' }}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Project Value', value: p.value,   icon: FaChartLine },
                    { label: 'Date',          value: p.date,    icon: FaCalendarAlt },
                    { label: 'Leakage',       value: p.leakage, icon: p.status === 'Completed' ? FaCheckCircle : FaClock },
                  ].map((item, j) => (
                    <div key={j} className="bg-white/5 rounded-xl p-2">
                      <item.icon size={12} className="mx-auto mb-1 text-blue-400" />
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className="text-xs font-semibold mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Plan Tab */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-lg border border-blue-400/30 rounded-2xl p-6 text-center">
              <FaCrown className="text-blue-400 text-4xl mx-auto mb-3" />
              <h2 className="text-2xl font-bold">{isGuest ? 'Guest' : user.plan + ' Plan'}</h2>
              {!isGuest && <p className="text-slate-400 text-sm mt-1">Valid until {user.planExpiry}</p>}
              <button
                onClick={() => isGuest && router.push('/login')}
                className="mt-4 bg-blue-400 text-black font-semibold rounded-xl px-6 py-2.5 text-sm hover:bg-blue-300 transition-colors"
              >
                {isGuest ? 'Sign in to Upgrade' : 'Upgrade Plan'}
              </button>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">What's included</h3>
              <div className="space-y-3">
                {[
                  'BOQ Analysis (up to 10 projects/month)',
                  'AI-powered leakage detection',
                  'PDF report generation',
                  'Benchmark rate comparison',
                  'Priority support',
                  'Data export (Excel + PDF)',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <FaCheckCircle className="text-blue-400 shrink-0" size={14} />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FaBell size={14} className="text-blue-400" /> Notifications
              </h3>
              {[
                { label: 'Push notifications', sub: 'Get alerts for project updates', state: notifications, set: setNotifications },
                { label: 'Email alerts',        sub: 'Receive reports via email',     state: emailAlerts,   set: setEmailAlerts },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.sub}</p>
                  </div>
                  <button
                    onClick={() => item.set(!item.state)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${item.state ? 'bg-blue-400' : 'bg-white/10'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${item.state ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FaShieldAlt size={14} className="text-blue-400" /> Security
              </h3>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div>
                  <p className="text-sm font-medium">Two-factor authentication</p>
                  <p className="text-xs text-slate-500">Add an extra layer of security</p>
                </div>
                <button
                  onClick={() => setTwoFA(!twoFA)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${twoFA ? 'bg-blue-400' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${twoFA ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
              <button className="mt-3 w-full text-sm text-slate-400 hover:text-white border border-white/10 rounded-xl py-2.5 transition-colors">
                Change Password
              </button>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
            >
              <FaSignOutAlt size={14} /> Sign Out
            </button>
          </div>
        )}

      </div>
    </div>
  );
}