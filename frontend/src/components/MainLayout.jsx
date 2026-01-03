import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Menu, X, Home, Workflow, FileText, Settings, Users, Calendar,
  Activity, CheckCircle, XCircle, Clock, Plus, Play, Pause,
  Trash2, Bell, Search, ChevronDown, BarChart3, Zap
} from 'lucide-react';
import { api } from '../services/api';

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [loadingActions, setLoadingActions] = useState({});

  const { data: workflows, isLoading: workflowsLoading, refetch: refetchWorkflows } = useQuery({
    queryKey: ['workflows'],
    queryFn: api.getWorkflows
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: api.getLogs
  });

  const { data: integrations, isLoading: integrationsLoading, refetch: refetchIntegrations } = useQuery({
    queryKey: ['integrations'],
    queryFn: api.getIntegrations
  });

  const toggleWorkflow = async (id) => {
    setLoadingActions(prev => ({ ...prev, [`toggle-${id}`]: true }));
    try {
      const workflow = workflows.find(w => w.id === id);
      if (!workflow) return;
      
      await api.updateWorkflow(id, { enabled: !workflow.enabled });
      refetchWorkflows();
    } catch (error) {
      console.error('Failed to toggle workflow:', error);
      alert('Failed to toggle workflow. Please try again.');
    } finally {
      setLoadingActions(prev => ({ ...prev, [`toggle-${id}`]: false }));
    }
  };

  const deleteWorkflow = async (id) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    
    setLoadingActions(prev => ({ ...prev, [`delete-${id}`]: true }));
    try {
      await api.deleteWorkflow(id);
      refetchWorkflows();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      alert('Failed to delete workflow. Please try again.');
    } finally {
      setLoadingActions(prev => ({ ...prev, [`delete-${id}`]: false }));
    }
  };

  const triggerWorkflow = async (id) => {
    setLoadingActions(prev => ({ ...prev, [`trigger-${id}`]: true }));
    try {
      await api.triggerWorkflow(id);
      alert('Workflow triggered successfully!');
      // Optionally refetch logs to show the new execution
      // refetchLogs(); // if we add logs refetch
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
      alert('Failed to trigger workflow. Please try again.');
    } finally {
      setLoadingActions(prev => ({ ...prev, [`trigger-${id}`]: false }));
    }
  };

  const stats = {
    totalWorkflows: workflows?.length || 0,
    activeWorkflows: workflows?.filter(w => w.enabled).length || 0,
    totalExecutions: logs?.length || 0,
    successRate: logs?.length > 0
      ? (logs.filter(l => l.status === 'success').length / logs.length * 100).toFixed(1)
      : 0
  };

  const mockCommissions = [
    { id: 1, user: 'John Doe', amount: 1250, date: '2026-01-01', status: 'paid' },
    { id: 2, user: 'Jane Smith', amount: 890, date: '2025-12-28', status: 'pending' },
    { id: 3, user: 'Mike Johnson', amount: 2100, date: '2025-12-25', status: 'paid' },
    { id: 4, user: 'Sarah Williams', amount: 1450, date: '2025-12-20', status: 'paid' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-blue-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6" />
              <span className="font-bold text-lg">AutoEngine</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-blue-700 rounded">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <SidebarItem
            icon={<Home className="w-5 h-5" />}
            text="Dashboard"
            active={currentPage === 'dashboard'}
            collapsed={!sidebarOpen}
            onClick={() => setCurrentPage('dashboard')}
          />
          <SidebarItem
            icon={<Workflow className="w-5 h-5" />}
            text="Workflows"
            active={currentPage === 'workflows'}
            collapsed={!sidebarOpen}
            onClick={() => setCurrentPage('workflows')}
          />
          <SidebarItem
            icon={<FileText className="w-5 h-5" />}
            text="Execution Logs"
            active={currentPage === 'logs'}
            collapsed={!sidebarOpen}
            onClick={() => setCurrentPage('logs')}
          />
          <SidebarItem
            icon={<Calendar className="w-5 h-5" />}
            text="Commissions"
            active={currentPage === 'commissions'}
            collapsed={!sidebarOpen}
            onClick={() => setCurrentPage('commissions')}
          />
          <SidebarItem
            icon={<Users className="w-5 h-5" />}
            text="Users"
            active={currentPage === 'users'}
            collapsed={!sidebarOpen}
            onClick={() => setCurrentPage('users')}
          />
          <SidebarItem
            icon={<Settings className="w-5 h-5" />}
            text="Integrations"
            active={currentPage === 'integrations'}
            collapsed={!sidebarOpen}
            onClick={() => setCurrentPage('integrations')}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search workflows, logs, users..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-semibold text-gray-900">Admin User</div>
                  <div className="text-xs text-gray-500">admin@example.com</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {currentPage === 'dashboard' && <DashboardView stats={stats} workflows={workflows || []} workflowsLoading={workflowsLoading} logsLoading={logsLoading} />}
          {currentPage === 'workflows' && (
            <WorkflowsView
              workflows={workflows || []}
              onToggle={toggleWorkflow}
              onDelete={deleteWorkflow}
              onTrigger={triggerWorkflow}
              loadingActions={loadingActions}
              onNew={() => setShowModal(true)}
            />
          )}
          {currentPage === 'logs' && <LogsView logs={logs || []} />}
          {currentPage === 'commissions' && <CommissionsView commissions={mockCommissions} />}
          {currentPage === 'users' && <UsersView />}
          {currentPage === 'integrations' && <IntegrationsView integrations={integrations || []} onRefetch={refetchIntegrations} />}
        </main>
      </div>

      {/* Create Workflow Modal */}
      {showModal && <CreateWorkflowModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

function SidebarItem({ icon, text, active, collapsed, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        active
          ? 'bg-blue-700 text-white'
          : 'text-blue-100 hover:bg-blue-700/50'
      }`}
    >
      {icon}
      {!collapsed && <span className="font-medium">{text}</span>}
    </button>
  );
}

function DashboardView({ stats, workflows, workflowsLoading, logsLoading }) {
  if (workflowsLoading || logsLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your automation engine</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Workflows"
          value={stats.totalWorkflows}
          icon={<Workflow className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Active Workflows"
          value={stats.activeWorkflows}
          icon={<Activity className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="Total Executions"
          value={stats.totalExecutions.toLocaleString()}
          icon={<BarChart3 className="w-6 h-6" />}
          color="purple"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={<CheckCircle className="w-6 h-6" />}
          color="emerald"
        />
      </div>

      {/* Recent Workflows */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Workflows</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {workflows.slice(0, 3).map(workflow => (
              <div key={workflow.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${workflow.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <div className="font-semibold text-gray-900">{workflow.name}</div>
                    <div className="text-sm text-gray-500">{workflow.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-900">{workflow.executions || 0} runs</div>
                  <div className="text-xs text-gray-500">Last: {workflow.updated_at ? new Date(workflow.updated_at).toLocaleTimeString() : 'Never'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    emerald: 'bg-emerald-100 text-emerald-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function WorkflowsView({ workflows, onToggle, onDelete, onTrigger, loadingActions, onNew }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-500 mt-1">Manage your automation workflows</p>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </button>
      </div>

      <div className="grid gap-4">
        {workflows.map(workflow => (
          <div key={workflow.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    workflow.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {workflow.enabled ? 'Active' : 'Paused'}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {workflow.trigger_type || 'schedule'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{workflow.description}</p>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Last: {workflow.updated_at ? new Date(workflow.updated_at).toLocaleString() : 'Never'}
                  </div>
                  <div className="flex items-center gap-1">
                    {workflow.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    {workflow.status || 'unknown'}
                  </div>
                  <div>{workflow.executions || 0} runs</div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button 
                  onClick={() => onTrigger(workflow.id)}
                  disabled={loadingActions[`trigger-${workflow.id}`]}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-50 disabled:cursor-not-allowed" 
                  title="Run now"
                >
                  {loadingActions[`trigger-${workflow.id}`] ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => onToggle(workflow.id)}
                  disabled={loadingActions[`toggle-${workflow.id}`]}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingActions[`toggle-${workflow.id}`] ? (
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    workflow.enabled ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => onDelete(workflow.id)}
                  disabled={loadingActions[`delete-${workflow.id}`]}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingActions[`delete-${workflow.id}`] ? (
                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogsView({ logs }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter logs based on search term and status
  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      (log.workflow_id && log.workflow_id.toString().toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginate filtered logs
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Execution Logs</h1>
          <p className="text-gray-500 mt-1">Monitor workflow executions and their results</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredLogs.length} of {logs.length} logs
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by workflow ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workflow</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  {logs.length === 0 ? 'No logs available' : 'No logs match your filters'}
                </td>
              </tr>
            ) : (
              paginatedLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {log.workflow_id || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.status === 'success' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {log.started_at ? new Date(log.started_at).toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {log.completed_at && log.started_at ? 
                      `${((new Date(log.completed_at) - new Date(log.started_at)) / 1000).toFixed(1)}s` : 
                      'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 rounded-lg shadow">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 text-sm border rounded ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CommissionsView({ commissions }) {
  const [selectedMonth, setSelectedMonth] = useState('2026-01');

  const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0);
  const paidCommissions = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
          <p className="text-gray-500 mt-1">Track user commissions by calendar</p>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Total Commissions</p>
          <p className="text-3xl font-bold text-gray-900">${totalCommissions.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Paid Out</p>
          <p className="text-3xl font-bold text-green-600">${paidCommissions.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-3xl font-bold text-orange-600">${(totalCommissions - paidCommissions).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {commissions.map(commission => (
              <tr key={commission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{commission.user}</td>
                <td className="px-6 py-4 text-sm text-gray-900">${commission.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{commission.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    commission.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {commission.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersView() {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'User', status: 'inactive' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.role}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CreateWorkflowModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Workflow</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Name</label>
            <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3" />
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
        </div>
      </div>
    </div>
  );
}

function IntegrationsView({ integrations, onRefetch }) {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [healthCheckResults, setHealthCheckResults] = useState({});
  const [loadingActions, setLoadingActions] = useState({});

  const handleConfigure = (integration) => {
    setSelectedIntegration(integration);
    setShowConfigModal(true);
  };

  const handleHealthCheck = async (integration) => {
    setLoadingActions(prev => ({ ...prev, [`health-${integration.id}`]: true }));
    try {
      const result = await api.healthCheckIntegration(integration.id);
      setHealthCheckResults(prev => ({ ...prev, [integration.id]: result }));
      setSelectedIntegration(integration);
      setShowHealthModal(true);
    } catch (error) {
      console.error('Health check failed:', error);
      alert('Health check failed. Please try again.');
    } finally {
      setLoadingActions(prev => ({ ...prev, [`health-${integration.id}`]: false }));
    }
  };

  const handleUpdateIntegration = async (updates) => {
    try {
      await api.updateIntegration(selectedIntegration.id, updates);
      onRefetch();
      setShowConfigModal(false);
      setSelectedIntegration(null);
    } catch (error) {
      console.error('Failed to update integration:', error);
      alert('Failed to update integration. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'healthy':
        return 'bg-green-100 text-green-700';
      case 'disconnected':
      case 'unhealthy':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (integration) => {
    if (integration.is_connected) {
      return 'connected';
    }
    return 'disconnected';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-500 mt-1">Manage your service integrations</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          Add Integration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {integration.service_name.replace('_', ' ')}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getStatusText(integration))}`}>
                {getStatusText(integration)}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Auth Type:</span> {integration.auth_type || 'Not configured'}
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">Last Updated:</span> {integration.updated_at ? new Date(integration.updated_at).toLocaleDateString() : 'Never'}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleConfigure(integration)}
                className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
              >
                Configure
              </button>
              <button
                onClick={() => handleHealthCheck(integration)}
                disabled={loadingActions[`health-${integration.id}`]}
                className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg hover:bg-green-100 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingActions[`health-${integration.id}`] ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  'Health Check'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && selectedIntegration && (
        <IntegrationConfigModal
          integration={selectedIntegration}
          onSave={handleUpdateIntegration}
          onClose={() => {
            setShowConfigModal(false);
            setSelectedIntegration(null);
          }}
        />
      )}

      {/* Health Check Modal */}
      {showHealthModal && selectedIntegration && healthCheckResults[selectedIntegration.id] && (
        <HealthCheckModal
          integration={selectedIntegration}
          healthResult={healthCheckResults[selectedIntegration.id]}
          onClose={() => {
            setShowHealthModal(false);
            setSelectedIntegration(null);
          }}
        />
      )}
    </div>
  );
}

function IntegrationConfigModal({ integration, onSave, onClose }) {
  const [config, setConfig] = useState({
    api_key: integration.api_key || '',
    api_secret: integration.api_secret || '',
    base_url: integration.base_url || '',
    username: integration.username || '',
    password: integration.password || '',
    oauth_token: integration.oauth_token || '',
    oauth_refresh_token: integration.oauth_refresh_token || '',
    webhook_url: integration.webhook_url || '',
    ...integration.config
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(config);
  };

  const renderConfigFields = () => {
    switch (integration.auth_type) {
      case 'api_key':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                type="password"
                value={config.api_key}
                onChange={(e) => setConfig(prev => ({ ...prev, api_key: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter API key"
              />
            </div>
            {integration.service_name === 'redis' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Redis URL</label>
                <input
                  type="text"
                  value={config.base_url}
                  onChange={(e) => setConfig(prev => ({ ...prev, base_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="redis://localhost:6379"
                />
              </div>
            )}
          </>
        );
      case 'oauth':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OAuth Token</label>
              <input
                type="password"
                value={config.oauth_token}
                onChange={(e) => setConfig(prev => ({ ...prev, oauth_token: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter OAuth token"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Token</label>
              <input
                type="password"
                value={config.oauth_refresh_token}
                onChange={(e) => setConfig(prev => ({ ...prev, oauth_refresh_token: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter refresh token"
              />
            </div>
          </>
        );
      case 'basic':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={config.username}
                onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={config.password}
                onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>
          </>
        );
      case 'webhook':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
            <input
              type="url"
              value={config.webhook_url}
              onChange={(e) => setConfig(prev => ({ ...prev, webhook_url: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://your-app.com/webhook"
            />
          </div>
        );
      default:
        return (
          <div className="text-center text-gray-500 py-4">
            No configuration required for this integration type.
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Configure {integration.service_name.replace('_', ' ')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {renderConfigFields()}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HealthCheckModal({ integration, healthResult, onClose }) {
  const getStatusColor = (status) => {
    return status === 'healthy' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status) => {
    return status === 'healthy' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Health Check - {integration.service_name.replace('_', ' ')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(healthResult.status)}
            <span className={`font-medium ${getStatusColor(healthResult.status)}`}>
              {healthResult.status === 'healthy' ? 'Healthy' : 'Unhealthy'}
            </span>
          </div>

          {healthResult.message && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">{healthResult.message}</p>
            </div>
          )}

          {healthResult.details && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Details:</h3>
              <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(healthResult.details, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Checked at: {new Date(healthResult.timestamp).toLocaleString()}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;