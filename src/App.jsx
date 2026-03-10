/**
 * Main App Component
 * Entry point for the Cliente Management application
 */

import { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { ClienteProvider, useClientes } from './context/ClienteContext';
import ClienteForm from './components/ClienteForm';
import ClienteTable from './components/ClienteTable';
import Notification from './components/Notification';

function AppContent() {
  const { clientes, loading, error, selectedCliente, fetchClientes, fetchCount } = useClientes();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchClientes();
    fetchCount();
  }, [fetchClientes, fetchCount]);

  // Show form when either showForm is true or when a client is selected for editing
  const isFormOpen = showForm || selectedCliente;

  return (
    <div className="container">
      <Notification />
      
      <header className="header">
        <h1>Módulo de Clientes</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={20} />
          Agregar Cliente
        </button>
      </header>

      <div className="stats">
        <div className="stat-card">
          <h3>Total de Clientes</h3>
          <p>{clientes.length}</p>
        </div>
        <div className="stat-card">
          <h3>Registrados Este Mes</h3>
          <p>{clientes.length}</p>
        </div>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}

      <ClienteTable />

      {isFormOpen && (
        <ClienteForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ClienteProvider>
      <AppContent />
    </ClienteProvider>
  );
}
