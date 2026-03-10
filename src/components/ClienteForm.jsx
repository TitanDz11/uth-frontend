/**
 * Cliente Form Component
 * Handles both create and edit operations
 * Following KISS - simple and focused component
 */

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useClientes } from '../context/ClienteContext';

const initialFormState = {
  nombre: '',
  correo: '',
  telefono: '',
};

// Honduran phone number patterns
const HONDURAN_PHONE = {
  // Local format: 504 XXXX-XXXX (8 digits after 504)
  local: /^(\d{4})$/,
  // With country code: +504 XXXX-XXXX
  withCountry: /^\+504(\d{4})$/,
  // Any format with country code
  fullPattern: /^\+?504?\d{4}-?\d{4}$/,
};

/**
 * Format phone number to Honduran format (504) XXXX-XXXX
 */
const formatHonduranPhone = (value) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // If empty, return empty
  if (!digits) return '';
  
  // Handle country code first (+504 or 504)
  let phoneNumber = digits;
  
  // If starts with 504 (country code without +)
  if (digits.startsWith('504')) {
    phoneNumber = digits.slice(3);
  }
  
  // If it's just the local number (8 digits)
  if (phoneNumber.length <= 8) {
    // Format as XXXX-XXXX
    const part1 = phoneNumber.slice(0, 4);
    const part2 = phoneNumber.slice(4);
    if (part2) {
      return `+504 ${part1}-${part2}`;
    }
    return `+504 ${part1}`;
  }
  
  // If longer than 8 digits, just format what's there
  const part1 = phoneNumber.slice(0, 4);
  const part2 = phoneNumber.slice(4, 8);
  const remaining = phoneNumber.slice(8);
  
  let formatted = `+504 ${part1}`;
  if (part2) {
    formatted += `-${part2}`;
  }
  if (remaining) {
    formatted += remaining;
  }
  
  return formatted;
};

/**
 * Validate Honduran phone number
 */
const validateHonduranPhone = (phone) => {
  // Remove formatting
  const digits = phone.replace(/\D/g, '');
  
  // Must be 8 digits (local) or 11 digits (with country code 504)
  if (digits.length === 8) {
    // Valid local format
    return { valid: true, formatted: formatHonduranPhone(digits) };
  }
  
  if (digits.length === 11 && digits.startsWith('504')) {
    // Valid with country code
    return { valid: true, formatted: formatHonduranPhone(digits) };
  }
  
  // Try general validation - 9-15 digits
  if (/^\+?\d{9,15}$/.test(phone)) {
    return { valid: true, formatted: phone };
  }
  
  return { valid: false, formatted: phone };
};

/**
 * Validate name - only letters and spaces (including Spanish characters)
 */
const validateName = (name) => {
  // Allow letters (including Spanish characters with accents), spaces, and hyphens
  const validPattern = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-']+$/;
  
  if (!name.trim()) {
    return { valid: false, message: 'El nombre es requerido' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, message: 'El nombre debe tener al menos 2 caracteres' };
  }
  
  if (!validPattern.test(name)) {
    return { valid: false, message: 'Solo se permiten letras y espacios' };
  }
  
  return { valid: true, message: '' };
};

export default function ClienteForm({ onClose }) {
  const { selectedCliente, createCliente, updateCliente, clearSelectedCliente, loading } = useClientes();
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const phoneInputRef = useRef(null);
  
  const isEditing = Boolean(selectedCliente);

  useEffect(() => {
    if (selectedCliente) {
      setFormData({
        nombre: selectedCliente.nombre || '',
        correo: selectedCliente.correo || '',
        telefono: selectedCliente.telefono || '',
      });
    }
  }, [selectedCliente]);

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    
    // Format the phone number as user types
    const formattedPhone = formatHonduranPhone(value);
    
    setFormData((prev) => ({ ...prev, [name]: formattedPhone }));
    
    // Clear error when user starts typing
    if (errors.telefono) {
      setErrors((prev) => ({ ...prev, telefono: null }));
    }
  };

  const handleNameChange = (e) => {
    const { name, value } = e.target;
    
    // Filter out invalid characters (only allow letters, spaces, hyphens, and Spanish accents)
    const filteredValue = value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-']/g, '');
    
    setFormData((prev) => ({ ...prev, [name]: filteredValue }));
    
    // Clear error when user starts typing
    if (errors.nombre) {
      setErrors((prev) => ({ ...prev, nombre: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Nombre validation
    const nameValidation = validateName(formData.nombre);
    if (!nameValidation.valid) {
      newErrors.nombre = nameValidation.message;
    }

    // Correo validation
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Formato de correo inválido';
    }

    // Telefono validation for Honduras
    const phoneValidation = validateHonduranPhone(formData.telefono);
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El número de teléfono es requerido';
    } else if (!phoneValidation.valid) {
      newErrors.telefono = 'Ingrese un número válido de Honduras (8 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Format phone number before submitting
      const formattedData = {
        ...formData,
        telefono: formData.telefono.replace(/\D/g, ''),
      };
      
      if (isEditing) {
        await updateCliente(selectedCliente.id, formattedData);
      } else {
        await createCliente(formattedData);
      }
      clearSelectedCliente();
      onClose();
    } catch (error) {
      // Error is handled in context
    }
  };

  const handleClose = () => {
    clearSelectedCliente();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}</h2>
          <button className="btn btn-secondary btn-sm" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleNameChange}
              placeholder="Ingrese el nombre completo"
              className={errors.nombre ? 'error' : ''}
              disabled={loading}
              autoComplete="off"
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="correo">Correo Electrónico</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={(e) => {
                const { name, value } = e.target;
                setFormData((prev) => ({ ...prev, [name]: value }));
                if (errors.correo) {
                  setErrors((prev) => ({ ...prev, correo: null }));
                }
              }}
              placeholder="correo@ejemplo.com"
              className={errors.correo ? 'error' : ''}
              disabled={loading}
              autoComplete="off"
            />
            {errors.correo && <span className="error-message">{errors.correo}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Número de Teléfono (Honduras)</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handlePhoneChange}
              placeholder="+504 XXXX-XXXX"
              className={errors.telefono ? 'error' : ''}
              disabled={loading}
              autoComplete="off"
              ref={phoneInputRef}
              maxLength={14}
            />
            {errors.telefono && <span className="error-message">{errors.telefono}</span>}
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
              Formato: +504 XXXX-XXXX (8 dígitos)
            </span>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
