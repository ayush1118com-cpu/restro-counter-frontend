import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      Swal.fire({
        title,
        text: message,
        icon: variant === 'danger' ? 'warning' : 'info',
        showCancelButton: true,
        confirmButtonColor: variant === 'danger' ? '#ef4444' : '#f59e0b',
        cancelButtonColor: '#6b7280',
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        customClass: {
          popup: 'rounded-3xl font-sans',
          title: 'font-black text-gray-900',
          confirmButton: 'font-bold rounded-xl px-5 py-2.5',
          cancelButton: 'font-bold rounded-xl px-5 py-2.5',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          onConfirm();
        } else {
          onClose();
        }
      });
    }
  }, [isOpen]);

  return null;
}
