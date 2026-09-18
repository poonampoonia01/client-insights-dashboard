import React, { useCallback, useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import Navbar from '../components/Navbar.jsx';
import InsightsStrip from '../components/InsightsStrip.jsx';
import SearchFilterBar from '../components/SearchFilterBar.jsx';
import ClientTable from '../components/ClientTable.jsx';
import ClientFormModal from '../components/ClientFormModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const DEFAULT_FILTERS = {
  search: '',
  category: 'All',
  sortBy: 'onboardingDate',
  order: 'desc',
};

export default function Dashboard() {
  const [insights, setInsights] = useState(null);
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [editingClient, setEditingClient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingClient, setDeletingClient] = useState(null);

  const showToast = (message, tone = 'ok') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 3000);
  };

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/clients', {
        params: { ...filters, page, limit: 20 },
      });
      setClients(data.clients);
      setPagination(data.pagination);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not load clients.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  const loadInsights = useCallback(async () => {
    try {
      const { data } = await api.get('/clients/insights');
      setInsights(data);
    } catch {
      // Insights are supplementary; a failed fetch here shouldn't block the table.
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  // Debounce search so we're not firing a request on every keystroke.
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput }));
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleFilterChange = (partial) => {
    if ('search' in partial) {
      setSearchInput(partial.search);
      return;
    }
    setFilters((f) => ({ ...f, ...partial }));
    setPage(1);
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleSaveClient = async (formValues) => {
    if (editingClient) {
      await api.put(`/clients/${editingClient._id}`, formValues);
      showToast('Client updated.');
    } else {
      await api.post('/clients', formValues);
      showToast('Client added.');
    }
    setShowForm(false);
    setEditingClient(null);
    loadClients();
    loadInsights();
  };

  const handleDeleteClient = async () => {
    await api.delete(`/clients/${deletingClient._id}`);
    showToast('Client deleted.');
    setDeletingClient(null);
    loadClients();
    loadInsights();
  };

  return (
    <div>
      <Navbar />

      <main className="dashboard-main">
        <div>
          <h1 className="dashboard-title">Client book</h1>
          <p className="dashboard-subtitle">
            Search, filter, and manage every client relationship in one place.
          </p>
        </div>

        <InsightsStrip insights={insights} />

        <SearchFilterBar
          filters={{ ...filters, search: searchInput }}
          onChange={handleFilterChange}
          onAddClient={handleAddClient}
        />

        <ClientTable
          clients={clients}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          onEdit={handleEditClient}
          onDelete={setDeletingClient}
        />
      </main>

      {showForm && (
        <ClientFormModal
          client={editingClient}
          onClose={() => setShowForm(false)}
          onSave={handleSaveClient}
        />
      )}

      {deletingClient && (
        <ConfirmDialog
          title="Delete this client?"
          message={`This removes ${deletingClient.name} from your book. This can't be undone.`}
          confirmLabel="Delete client"
          onConfirm={handleDeleteClient}
          onCancel={() => setDeletingClient(null)}
        />
      )}

      {toast && <div className={`toast ${toast.tone === 'error' ? 'error' : ''}`}>{toast.message}</div>}
    </div>
  );
}
