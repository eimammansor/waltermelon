import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { workflowService } from '../services/api';
import { Play, Activity, Clock, Plus } from 'lucide-react';

const DashboardView = () => {
  // Use React Query to fetch workflows every 5 seconds
  const { data: workflows, isLoading, error } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => workflowService.getAll().then(res => res.data),
    refetchInterval: 5000, // Auto-refresh!
  });

const handleTrigger = async (id) => {
  try {
    const response = await workflowService.trigger(id);
    console.log(response.data.message);
    // Optional: Refresh logs or show a toast notification
  } catch (error) {
    alert("Trigger failed: " + error.message);
  }
};

  if (isLoading) return <div className="p-8 text-center">Connecting to Engine...</div>;
  if (error) return <div className="p-8 text-red-500 text-center">Engine Offline. Check Port 8000.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Automation Dashboard</h1>
        {/* We will link the Modal to this button next */}
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> New Workflow
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Active Jobs</p>
          <p className="text-2xl font-bold">{workflows?.length || 0}</p>
        </div>
        {/* Add more stats cards here */}
      </div>

      {/* Workflow Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-sm">Workflow Name</th>
              <th className="p-4 font-semibold text-sm">Status</th>
              <th className="p-4 font-semibold text-sm">Last Run</th>
              <th className="p-4 font-semibold text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {workflows?.map((wf) => (
              <tr key={wf.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium">{wf.name}</div>
                  <div className="text-xs text-gray-400">{wf.description}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${wf.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {wf.is_active ? 'Active' : 'Paused'}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {wf.last_run || 'Never'}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleTrigger(wf.id)}
                    className="p-2 hover:bg-blue-100 rounded-full text-blue-600 transition-colors"
                    title="Run Now"
                    >
                    <Play size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;