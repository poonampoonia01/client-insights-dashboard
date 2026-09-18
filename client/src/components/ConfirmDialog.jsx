import React, { useState } from 'react';

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-panel confirm-panel" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="confirm-body">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button className="btn btn-danger-solid" onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
