import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  // State management
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [newTabTitle, setNewTabTitle] = useState('');
  const [stats, setStats] = useState([
    { name: "Total Users", value: "1,234", change: "+12% from last month", icon: "👥" },
    { name: "Revenue", value: "$5,678", change: "+8% from last month", icon: "💰" },
    { name: "Tasks", value: "56", change: "-3% from last month", icon: "✅" },
    { name: "Projects", value: "24", change: "+5% from last month", icon: "📁" }
  ]);

  // Load data from MongoDB on component mount
  useEffect(() => {
    fetchTabsFromDB();
  }, []);

  // Fetch tabs from MongoDB via Cloudflare Worker
  const fetchTabsFromDB = async () => {
    try {
      const response = await fetch('/api/tabs');
      const data = await response.json();
      setTabs(data.tabs || []);
      
      if (data.tabs && data.tabs.length > 0) {
        setActiveTab(data.tabs[0].id);
      }
    } catch (error) {
      console.error('Error fetching tabs:', error);
    }
  };

  // Add new tab to MongoDB
  const addNewTab = async () => {
    if (!newTabTitle.trim()) return;

    const newTab = {
      id: Date.now().toString(),
      title: newTabTitle,
      content: `Content for ${newTabTitle}`
    };

    try {
      const response = await fetch('/api/tabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTab)
      });

      if (response.ok) {
        const savedTab = await response.json();
        setTabs([...tabs, savedTab]);
        
        if (tabs.length === 0) {
          setActiveTab(savedTab.id);
        }
        
        setNewTabTitle('');
        setIsAddingTab(false);
      }
    } catch (error) {
      console.error('Error adding tab:', error);
    }
  };

  // Remove tab from MongoDB
  const removeTab = async (tabId) => {
    try {
      await fetch(`/api/tabs/${tabId}`, { method: 'DELETE' });
      const updatedTabs = tabs.filter(tab => tab.id !== tabId);
      setTabs(updatedTabs);
      
      if (activeTab === tabId && updatedTabs.length > 0) {
        setActiveTab(updatedTabs[0].id);
      } else if (updatedTabs.length === 0) {
        setActiveTab(null);
      }
    } catch (error) {
      console.error('Error removing tab:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-300 text-sm">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsAddingTab(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                + Add Tab
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">{stat.name}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <p className="text-green-400 text-xs mt-1">{stat.change}</p>
                </div>
                <div className="text-3xl opacity-80">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Tabs Area */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex items-center justify-between bg-black/20 p-4">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab(tab.id);
                    }}
                    className="hover:bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            {isAddingTab ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newTabTitle}
                  onChange={(e) => setNewTabTitle(e.target.value)}
                  placeholder="Tab title..."
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={addNewTab}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => setIsAddingTab(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTab(true)}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors duration-200"
              >
                +
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-6 min-h-96">
            {tabs.find(tab => tab.id === activeTab) ? (
              <div className="animate-fadeIn">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {tabs.find(tab => tab.id === activeTab).title}
                </h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed">
                    {tabs.find(tab => tab.id === activeTab).content}
                  </p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="text-white font-medium mb-2">Recent Activity</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• New user registration</li>
                        <li>• System update completed</li>
                        <li>• Security scan passed</li>
                      </ul>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="text-white font-medium mb-2">Quick Actions</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• View reports</li>
                        <li>• Manage settings</li>
                        <li>• Contact support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <p>No content available</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <p className="text-white text-sm">Activity #{item}</p>
                    <p className="text-gray-400 text-xs">2 minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">CPU Usage</span>
                  <span className="text-white">64%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full w-3/5"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Memory</span>
                  <span className="text-white">42%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full w-2/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
