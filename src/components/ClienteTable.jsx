/**
 * Cliente Table Component
 * Displays clients in a table with edit and delete actions
 * Following KISS - simple table presentation
 */

import { Pencil, Trash2, User } from 'lucide-react';
import { useClientes } from '../context/ClienteContext';

export default function ClienteTable() {
  const { clientes, selectCliente, deleteCliente, loading } = useClientes();

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPhone = (phone) => {
    if (!phone) return '-';
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Handle different formats
    let localNumber = digits;
    
    // If starts with 504 (country code without +), remove it
    if (digits.startsWith('504')) {
      localNumber = digits.slice(3);
    } else if (digits.startsWith('+504')) {
      localNumber = digits.slice(4);
    }
    
    // If we have 8 digits, format as XXXX-XXXX
    if (localNumber.length === 8) {
      return `+504 ${localNumber.slice(0, 4)}-${localNumber.slice(4)}`;
    }
    
    // If we have more digits, try to format the last 8
    if (localNumber.length > 8) {
      const last8 = localNumber.slice(-8);
      return `+504 ${last8.slice(0, 4)}-${last8.slice(4)}`;
    }
    
    // Fallback: just return with +504 prefix if it looks like a valid number
    return `+504 ${localNumber}`;
  };

  const handleEdit = (cliente) => {
    selectCliente(cliente);
  };

  const handleDelete = async (cliente) => {
    if (window.confirm(`Are you sure you want to delete "${cliente.nombre}"?`)) {
      try {
        await deleteCliente(cliente.id);
      } catch (error) {
        // Error handled in context
      }
    }
  };

  if (clientes.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <User size={48} style={{ marginBottom: '1rem', color: '#94a3b8' }} />
          <h3>No clients found</h3>
          <p>Add your first client to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Registration Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.nombre}</td>
                <td>{cliente.correo}</td>
                <td>{formatPhone(cliente.telefono)}</td>
                <td>{formatDate(cliente.fecha_registro)}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEdit(cliente)}
                      disabled={loading}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(cliente)}
                      disabled={loading}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
