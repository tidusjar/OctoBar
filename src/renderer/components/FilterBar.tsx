import { FilterType } from '../types/notifications';

interface FilterBarProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function FilterBar({ currentFilter, onFilterChange }: FilterBarProps) {
  const filters: { value: FilterType; label: string; icon: JSX.Element }[] = [
    { 
      value: 'all', 
      label: 'All', 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c0 1.1.9 2 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
      )
    },
    { 
      value: 'mentions', 
      label: 'Mentions', 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      )
    },
    { 
      value: 'reviews', 
      label: 'Reviews', 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
      )
    },
    { 
      value: 'assignments', 
      label: 'Assignments', 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L12 12.5 9.01 8.99C8.54 8.37 7.8 8 7 8H5.46c-.8 0-1.54.37-2.01.99L1 18.5V22h16z"/>
        </svg>
      )
    },
    { 
      value: 'comments', 
      label: 'Comments', 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.99 4c0-1.1-.89-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      )
    },
    { 
      value: 'security', 
      label: 'Security', 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
      )
    },
    { 
      value: 'other', 
      label: 'Other', 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="filter-bar">
      {filters.map((filter) => (
        <button
          key={filter.value}
          className={`filter-button ${currentFilter === filter.value ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.value)}
        >
          <span className="filter-icon">{filter.icon}</span>
          <span className="filter-label">{filter.label}</span>
        </button>
      ))}
    </div>
  );
}
