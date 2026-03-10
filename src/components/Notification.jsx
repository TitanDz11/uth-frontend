/**
 * Notification Component
 * Displays success/error notifications
 */

import { CheckCircle, XCircle } from 'lucide-react';
import { useClientes } from '../context/ClienteContext';

export default function Notification() {
  const { notification } = useClientes();

  if (!notification) return null;

  return (
    <div className={`notification ${notification.type}`}>
      {notification.type === 'success' ? (
        <CheckCircle size={20} style={{ marginRight: '0.5rem' }} />
      ) : (
        <XCircle size={20} style={{ marginRight: '0.5rem' }} />
      )}
      {notification.message}
    </div>
  );
}
