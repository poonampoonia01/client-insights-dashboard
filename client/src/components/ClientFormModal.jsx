import React, { useState } from 'react';

const ASSET_CLASSES = ['Equity', 'Real Estate', 'Startups', 'Alternatives', 'Fixed Income', 'Cash', 'Other'];

function toDateInputValue(date) {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
}

function emptyForm() {
  return {
    name: '',
    email: '',
    phone: '',
    netWorth: '',
    category: 'HNI',
    primaryAssetClass: 'Equity',
    interests: '',
    onboardingDate: toDateInputValue(new Date()),
  };
}

function clientToForm(client) {
  return {
    name: client.name,
    email: client.email,
    phone: client.phone,
    netWorth: String(client.netWorth),
    category: client.category,
    primaryAssetClass: client.primaryAssetClass,
    interests: (client.interests || []).join(', '),
    onboardingDate: toDateInputValue(client.onboardingDate),
  };
}

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required.';
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email address.';
  if (!/^[+]?[\d\s-]{7,15}$/.test(form.phone)) errors.phone = 'Enter a valid phone number.';
  if (form.netWorth === '' || Number(form.netWorth) < 0) {
    errors.netWorth = 'Net worth must be a positive number.';
  }
  if (!form.primaryAssetClass.trim()) errors.primaryAssetClass = 'Primary asset class is required.';
  if (!form.onboardingDate) errors.onboardingDate = 'Onboarding date is required.';
  return errors;
}

export default function ClientFormModal({ client, onClose, onSave }) {
  const isEditing = Boolean(client);
  const [form, setForm] = useState(client ? clientToForm(client) : emptyForm());
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitError('');
    setSubmitting(true);
    try {
      await onSave({
        ...form,
        netWorth: Number(form.netWorth),
        interests: form.interests
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      setSubmitError(
        Array.isArray(apiErrors) ? apiErrors.join(' ') : err.response?.data?.message || 'Could not save this client.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit client' : 'Add client'}</h2>
          <button className="btn-text" onClick={onClose} aria-label="Close">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {submitError && <div className="form-error-banner">{submitError}</div>}

          <div className="modal-form-grid">
            <div className="field span-2">
              <label htmlFor="name">Full name</label>
              <input id="name" value={form.name} onChange={update('name')} />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={form.email} onChange={update('email')} />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" value={form.phone} onChange={update('phone')} />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>

            <div className="field">
              <label htmlFor="netWorth">Net worth (₹)</label>
              <input
                id="netWorth"
                type="number"
                min="0"
                step="1000"
                value={form.netWorth}
                onChange={update('netWorth')}
              />
              {errors.netWorth && <span className="field-error">{errors.netWorth}</span>}
            </div>

            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" value={form.category} onChange={update('category')}>
                <option value="HNI">HNI</option>
                <option value="UHNI">UHNI</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="primaryAssetClass">Primary asset class</label>
              <select
                id="primaryAssetClass"
                value={form.primaryAssetClass}
                onChange={update('primaryAssetClass')}
              >
                {ASSET_CLASSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="onboardingDate">Onboarding date</label>
              <input
                id="onboardingDate"
                type="date"
                value={form.onboardingDate}
                onChange={update('onboardingDate')}
              />
              {errors.onboardingDate && <span className="field-error">{errors.onboardingDate}</span>}
            </div>

            <div className="field span-2">
              <label htmlFor="interests">Investment interests</label>
              <input
                id="interests"
                value={form.interests}
                onChange={update('interests')}
                placeholder="e.g. Venture Capital, ESG, IPOs"
              />
              <span className="tag-input-hint">Separate multiple interests with commas.</span>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
