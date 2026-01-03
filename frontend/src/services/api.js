import axios from 'axios';

const API_BASE = 'http://localhost:8001/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Workflows
  getWorkflows: async () => {
    const { data } = await client.get('/workflows/');
    return data;
  },
  
  getWorkflow: async (id) => {
    const { data } = await client.get(`/workflows/${id}/`);
    return data;
  },
  
  createWorkflow: async (workflow) => {
    const { data } = await client.post('/workflows/', workflow);
    return data;
  },
  
  updateWorkflow: async (id, updates) => {
    const { data } = await client.patch(`/workflows/${id}/`, updates);
    return data;
  },
  
  deleteWorkflow: async (id) => {
    await client.delete(`/workflows/${id}/`);
  },
  
  triggerWorkflow: async (id) => {
    const { data } = await client.post(`/workflows/${id}/trigger/`);
    return data;
  },
  
  // Logs
  getLogs: async () => {
    const { data } = await client.get('/logs/');
    return data;
  },
  
  // Integrations
  getIntegrations: async () => {
    const { data } = await client.get('/integrations/');
    return data;
  },
  
  getIntegration: async (id) => {
    const { data } = await client.get(`/integrations/${id}/`);
    return data;
  },
  
  createIntegration: async (integration) => {
    const { data } = await client.post('/integrations/', integration);
    return data;
  },
  
  updateIntegration: async (id, updates) => {
    const { data } = await client.put(`/integrations/${id}`, updates);
    return data;
  },
  
  deleteIntegration: async (id) => {
    await client.delete(`/integrations/${id}`);
  },
  
  healthCheckIntegration: async (id) => {
    const { data } = await client.post(`/integrations/${id}/health`);
    return data;
  },
};