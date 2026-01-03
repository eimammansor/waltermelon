import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import { workflowService } from './services/api';
import { 
  Menu, X, Home, Workflow, FileText, Settings, Users, Calendar,
  Activity, CheckCircle, XCircle, Clock, Plus, Play, Pause, 
  Trash2, Bell, Search, ChevronDown, BarChart3, Zap
} from 'lucide-react';

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const queryClient = useQueryClient();

  // --- LIVE DATA FETCHING ---
  const { data: workflows = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowService.getAll().then(res => res.data),
    refetchInterval: 5000 // Auto-refresh every 5s for the Pi 5
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['logs'],
    queryFn: () => workflowService.getLogs().then(res => res.data),
    refetchInterval: 3000 // Faster refresh for logs
  });

  // --- ACTIONS ---
  const triggerMutation = useMutation({
    mutationFn: (id) => workflowService.trigger(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['logs']);
      alert("🚀 Workflow triggered on Pi 5!");
    }
  });

  if (workflowsLoading) return <div className="h-screen bg-slate-900 flex items-center justify-center text-white text-xl">Connecting to Engine...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {sidebarOpen && <div className="flex items-center gap-2"><Zap className="text-yellow-400" /> <span className="font-bold">AutoEngine</span></div>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-700 rounded"><Menu /></button>
        </div>
        <nav className="p-4 space-y-2">
          <SidebarItem icon={<Home />} text="Dashboard" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} collapsed={!sidebarOpen} />
          <SidebarItem icon={<Workflow />} text="Workflows" active={currentPage === 'workflows'} onClick={() => setCurrentPage('workflows')} collapsed={!sidebarOpen} />
          <SidebarItem icon={<FileText />} text="Execution Logs" active={currentPage === 'logs'} onClick={() => setCurrentPage('logs')} collapsed={!sidebarOpen} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-6`}>
        {currentPage === 'dashboard' && <DashboardView workflows={workflows} logs={logs} />}
        {currentPage === 'workflows' && (
          <WorkflowsView 
            workflows={workflows} 
            onTrigger={(id) => triggerMutation.mutate(id)} 
          />
        )}
        {currentPage === 'logs' && <LogsView logs={logs} />}
      </main>
    </div>
  );
}

// Sub-component for Sidebar Items
function SidebarItem({ icon, text, active, onClick, collapsed }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${active ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>
      {icon} {!collapsed && <span>{text}</span>}
    </button>
  );
}

// --- VIEW COMPONENTS ---
function WorkflowsView({ workflows, onTrigger }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Active Workflows</h2>
      {workflows.map(wf => (
        <div key={wf.id} className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-center border border-gray-200">
          <div>
            <h3 className="font-bold text-lg">{wf.name}</h3>
            <p className="text-gray-500 text-sm">{wf.description}</p>
          </div>
          <button 
            onClick={() => onTrigger(wf.id)}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 shadow-lg transition"
          >
            <Play size={20} />
          </button>
        </div>
      ))}
    </div>
  );
}

function LogsView({ logs }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Workflow ID</th>
            <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Execution Time</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {logs.map(log => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="p-4 italic">
                {log.status === 'success' ? <CheckCircle className="text-green-500 inline mr-2" size={16}/> : <XCircle className="text-red-500 inline mr-2" size={16}/>}
                {log.status}
              </td>
              <td className="p-4 font-medium">#{log.workflow_id}</td>
              <td className="p-4 text-gray-500 text-sm">{new Date(log.execution_time).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;