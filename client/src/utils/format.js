// Formats large numbers the way Indian wealth statements usually do:
// crores and lakhs, with a rupee sign, rather than a raw digit string.
export function formatCurrency(value) {
  const amount = Number(value) || 0;
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
