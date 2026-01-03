import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, CheckCircle, Workflow, BarChart3 } from 'lucide-react';
import { api } from '../services/api';

function DashboardView() {
  const { data: workflows, isLoading: workflowsLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: api.getWorkflows
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: api.getLogs
  });

  if (workflowsLoading || logsLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const activeWorkflows = workflows?.filter(w => w.enabled).length || 0;
  const successRate = logs?.length > 0 
    ? (logs.filter(l => l.status === 'success').length / logs.length * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Total Workflows" value={workflows?.length || 0} icon={<Workflow />} color="blue" />
        <StatsCard title="Active Workflows" value={activeWorkflows} icon={<Activity />} color="green" />
        <StatsCard title="Total Executions" value={logs?.length || 0} icon={<BarChart3 />} color="purple" />
        <StatsCard title="Success Rate" value={`${successRate}%`} icon={<CheckCircle />} color="emerald" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Workflows</h2>
        {workflows?.slice(0, 5).map(workflow => (
          <div key={workflow.id} className="flex items-center justify-between p-3 bg-gray-50 rounded mb-2">
            <div>
              <div className="font-medium">{workflow.name}</div>
              <div className="text-sm text-gray-500">{workflow.description}</div>
            </div>
            <span className={`px-2 py-1 rounded text-xs ${workflow.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {workflow.enabled ? 'Active' : 'Paused'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    emerald: 'bg-emerald-100 text-emerald-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default DashboardView;