import React from 'react';
import { formatCurrency, formatDate } from '../utils/format.js';

export default function ClientTable({
  clients,
  loading,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="ledger-wrap">
        <div className="empty-state">Loading clients…</div>
      </div>
    );
  }

  if (!clients.length) {
    return (
      <div className="ledger-wrap">
        <div className="empty-state">
          <strong>No clients match yet</strong>
          Adjust your search or filters, or add a new client to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="ledger-wrap">
      <table className="ledger-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Category</th>
            <th>Primary asset class</th>
            <th className="numeric">Net worth</th>
            <th>Onboarded</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client._id}>
              <td>
                <div className="client-name">{client.name}</div>
                <div className="client-email">{client.email}</div>
                {client.interests?.length > 0 && (
                  <div className="interest-tags">
                    {client.interests.map((tag) => (
                      <span className="interest-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </td>
              <td>
                <span className="category-tag">
                  <span
                    className={`category-dot ${client.category === 'UHNI' ? 'uhni' : 'hni'}`}
                  />
                  {client.category}
                </span>
              </td>
              <td>{client.primaryAssetClass}</td>
              <td className="numeric numeral">{formatCurrency(client.netWorth)}</td>
              <td>{formatDate(client.onboardingDate)}</td>
              <td>
                <div className="row-actions">
                  <button className="btn-text" onClick={() => onEdit(client)}>
                    Edit
                  </button>
                  <button className="btn-danger" onClick={() => onDelete(client)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-ghost"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}, {pagination.total} clients in total
          </span>
          <button
            className="btn btn-ghost"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
