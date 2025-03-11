import React, { useState } from 'react';

function ExpenseAccount() {
    const [showFilterSettings, setShowFilterSettings] = useState(false);

    function handleSearchClick() {
        setShowFilterSettings(prev => !prev);
    }

    return (
        <div>
            <button 
                onClick={handleSearchClick} 
                style={{ color: 'green', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
                Search
            </button>
            {showFilterSettings && (
                <div className="filter-settings">
                    <input type="text" placeholder="Search by vendor name..." />
                    <input type="text" placeholder="Invoice/Receipt #" />
                    <select>
                        <option>Status</option>
                    </select>
                    <input type="date" placeholder="From Date" />
                    <input type="date" placeholder="To Date" />
                    <input type="number" placeholder="Min Amount" />
                    <input type="number" placeholder="Max Amount" />
                    <button>Clear Filters</button>
                    <button style={{ backgroundColor: 'green', color: 'white' }}>Apply Filters</button>
                </div>
            )}
        </div>
    );
}

export default ExpenseAccount; 