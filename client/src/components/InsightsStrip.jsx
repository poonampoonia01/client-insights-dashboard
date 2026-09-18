import React from 'react';
import { formatCurrency } from '../utils/format.js';

export default function InsightsStrip({ insights }) {
  if (!insights) return null;

  const { totalClients, categoryDistribution, aggregateNetWorth, averageNetWorth } = insights;

  return (
    <div className="insights-strip">
      <div className="insight-figure">
        <span className="insight-value numeral">{totalClients}</span>
        <span className="insight-label">Total clients</span>
      </div>

      <div className="insight-figure">
        <span className="insight-value numeral">
          {categoryDistribution.HNI} / {categoryDistribution.UHNI}
        </span>
        <div className="insight-split">
          <span>
            <span className="category-dot hni" /> HNI
          </span>
          <span>
            <span className="category-dot uhni" /> UHNI
          </span>
        </div>
      </div>

      <div className="insight-figure">
        <span className="insight-value numeral">{formatCurrency(aggregateNetWorth)}</span>
        <span className="insight-label">Aggregate net worth</span>
      </div>

      <div className="insight-figure">
        <span className="insight-value numeral">{formatCurrency(averageNetWorth || 0)}</span>
        <span className="insight-label">Average per client</span>
      </div>
    </div>
  );
}
