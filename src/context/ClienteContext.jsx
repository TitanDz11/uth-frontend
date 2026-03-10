/**
 * Cliente Context for State Management
 * Following Solid principles - centralized state management
 */

import { createContext, useContext, useReducer, useCallback } from 'react';
import { clienteAPI } from '../services/api';

const ClienteContext = createContext(null);

const initialState = {
  clientes: [],
  selectedCliente: null,
  loading: false,
  error: null,
  notification: null,
  count: 0,
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CLIENTES: 'SET_CLIENTES',
  SET_SELECTED_CLIENTE: 'SET_SELECTED_CLIENTE',
  ADD_CLIENTE: 'ADD_CLIENTE',
  UPDATE_CLIENTE: 'UPDATE_CLIENTE',
  DELETE_CLIENTE: 'DELETE_CLIENTE',
  SET_NOTIFICATION: 'SET_NOTIFICATION',
  SET_COUNT: 'SET_COUNT',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
function clienteReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ActionTypes.SET_CLIENTES:
      return { ...state, clientes: action.payload, loading: false, error: null };
    
    case ActionTypes.SET_SELECTED_CLIENTE:
      return { ...state, selectedCliente: action.payload };
    
    case ActionTypes.ADD_CLIENTE:
      return {
        ...state,
        clientes: [action.payload, ...state.clientes],
        count: state.count + 1,
        loading: false,
      };
    
    case ActionTypes.UPDATE_CLIENTE:
      return {
        ...state,
        clientes: state.clientes.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
        loading: false,
      };
    
    case ActionTypes.DELETE_CLIENTE:
      return {
        ...state,
        clientes: state.clientes.filter((c) => c.id !== action.payload),
        count: state.count - 1,
        selectedCliente: null,
        loading: false,
      };
    
    case ActionTypes.SET_NOTIFICATION:
      return { ...state, notification: action.payload };
    
    case ActionTypes.SET_COUNT:
      return { ...state, count: action.payload };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
}

// Provider component
export function ClienteProvider({ children }) {
  const [state, dispatch] = useReducer(clienteReducer, initialState);

  // Show notification
  const showNotification = useCallback((message, type = 'success') => {
    dispatch({ type: ActionTypes.SET_NOTIFICATION, payload: { message, type } });
    setTimeout(() => {
      dispatch({ type: ActionTypes.SET_NOTIFICATION, payload: null });
    }, 3000);
  }, []);

  // Fetch all clients
  const fetchClientes = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const response = await clienteAPI.getAll();
      dispatch({ type: ActionTypes.SET_CLIENTES, payload: response.data || [] });
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.response?.data?.error || 'Error al obtener clientes',
      });
    }
  }, []);

  // Fetch client count
  const fetchCount = useCallback(async () => {
    try {
      const response = await clienteAPI.getCount();
      dispatch({ type: ActionTypes.SET_COUNT, payload: response.count });
    } catch (error) {
      console.error('Failed to fetch count:', error);
    }
  }, []);

  // Create client
  const createCliente = useCallback(async (data) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const response = await clienteAPI.create(data);
      dispatch({ type: ActionTypes.ADD_CLIENTE, payload: response.data });
      showNotification(response.message || 'Cliente creado exitosamente');
      return response.data;
    } catch (error) {
      // Extract error message from response
      const errorData = error.response?.data;
      let message = 'Error al crear cliente';
      
      if (errorData) {
        // If there's a specific error message, use it
        if (errorData.error && errorData.error !== 'Error de validación') {
          message = errorData.error;
        } else if (errorData.details) {
          // Extract validation error details
          const details = errorData.details;
          if (details.correo) {
            message = 'Ya existe un cliente con este correo electrónico';
          } else if (details.nombre) {
            message = details.nombre[0];
          } else if (details.telefono) {
            message = details.telefono[0];
          }
        }
      }
      
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      showNotification(message, 'error');
      throw error;
    }
  }, [showNotification]);

  // Update client
  const updateCliente = useCallback(async (id, data) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const response = await clienteAPI.update(id, data);
      dispatch({ type: ActionTypes.UPDATE_CLIENTE, payload: response.data });
      showNotification(response.message || 'Cliente actualizado exitosamente');
      return response.data;
    } catch (error) {
      // Extract error message from response
      const errorData = error.response?.data;
      let message = 'Error al actualizar cliente';
      
      if (errorData) {
        // If there's a specific error message, use it
        if (errorData.error && errorData.error !== 'Error de validación') {
          message = errorData.error;
        } else if (errorData.details) {
          // Extract validation error details
          const details = errorData.details;
          if (details.correo) {
            message = 'Ya existe un cliente con este correo electrónico';
          } else if (details.nombre) {
            message = details.nombre[0];
          } else if (details.telefono) {
            message = details.telefono[0];
          }
        }
      }
      
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      showNotification(message, 'error');
      throw error;
    }
  }, [showNotification]);

  // Delete client
  const deleteCliente = useCallback(async (id) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const response = await clienteAPI.delete(id);
      dispatch({ type: ActionTypes.DELETE_CLIENTE, payload: id });
      showNotification(response.message || 'Cliente eliminado exitosamente');
    } catch (error) {
      const message = error.response?.data?.error || 'Error al eliminar cliente';
      dispatch({ type: ActionTypes.SET_ERROR, payload: message });
      showNotification(message, 'error');
      throw error;
    }
  }, [showNotification]);

  // Select client for editing
  const selectCliente = useCallback((cliente) => {
    dispatch({ type: ActionTypes.SET_SELECTED_CLIENTE, payload: cliente });
  }, []);

  // Clear selected client
  const clearSelectedCliente = useCallback(() => {
    dispatch({ type: ActionTypes.SET_SELECTED_CLIENTE, payload: null });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    fetchClientes,
    fetchCount,
    createCliente,
    updateCliente,
    deleteCliente,
    selectCliente,
    clearSelectedCliente,
    clearError,
  };

  return (
    <ClienteContext.Provider value={value}>
      {children}
    </ClienteContext.Provider>
  );
}

// Custom hook to use the context
export function useClientes() {
  const context = useContext(ClienteContext);
  if (!context) {
    throw new Error('useClientes must be used within a ClienteProvider');
  }
  return context;
}

export default ClienteContext;
