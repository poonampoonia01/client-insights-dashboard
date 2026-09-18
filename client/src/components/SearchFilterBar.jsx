import React from 'react';

export default function SearchFilterBar({ filters, onChange, onAddClient }) {
  const { search, category, sortBy, order } = filters;

  return (
    <div className="toolbar">
      <div className="toolbar-search">
        <input
          type="text"
          placeholder="Search clients by name…"
          value={search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <select value={category} onChange={(e) => onChange({ category: e.target.value })}>
        <option value="All">All categories</option>
        <option value="HNI">HNI</option>
        <option value="UHNI">UHNI</option>
      </select>

      <select
        value={`${sortBy}:${order}`}
        onChange={(e) => {
          const [sortByValue, orderValue] = e.target.value.split(':');
          onChange({ sortBy: sortByValue, order: orderValue });
        }}
      >
        <option value="onboardingDate:desc">Newest onboarded first</option>
        <option value="onboardingDate:asc">Oldest onboarded first</option>
        <option value="netWorth:desc">Net worth: high to low</option>
        <option value="netWorth:asc">Net worth: low to high</option>
        <option value="name:asc">Name: A to Z</option>
        <option value="name:desc">Name: Z to A</option>
      </select>

      <button className="btn btn-primary" onClick={onAddClient}>
        Add client
      </button>
    </div>
  );
}
