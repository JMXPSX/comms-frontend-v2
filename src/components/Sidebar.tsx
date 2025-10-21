import React from 'react';
import { FilterOptions } from '../types';
import './Sidebar.css';

interface SidebarProps {
  filters: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ filters, onFilterChange }) => {
  const filterItems = [
    { key: 'email' as keyof FilterOptions, label: 'By Email', icon: 'E' },
    { key: 'subject' as keyof FilterOptions, label: 'By Subject', icon: 'S' },
    { key: 'ticketNumber' as keyof FilterOptions, label: 'By Ticket Number', icon: 'T' },
    { key: 'orderNumber' as keyof FilterOptions, label: 'By Order Number', icon: 'O' },
    { key: 'status' as keyof FilterOptions, label: 'By Status', icon: 'S' },
    { key: 'date' as keyof FilterOptions, label: 'By Date', icon: 'D' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Filters</h3>
      </div>
      {/* <div className="filter-list">
        {filterItems.map((item) => (
          <div key={item.key} className="filter-item">
            <div className="filter-icon">
              {item.icon}
            </div>
            <div className="filter-content">
              <label className="filter-label">{item.label}</label>
              <input
                type="text"
                value={filters[item.key]}
                onChange={(e) => onFilterChange(item.key, e.target.value)}
                className="filter-input"
                placeholder={`Filter by ${item.label.toLowerCase().replace('by ', '')}`}
              />
            </div>
          </div>
        ))}
      </div> */}
    </aside>
  );
};

export default Sidebar;