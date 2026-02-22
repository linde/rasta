import React, { useState, useEffect } from 'react';

const REQUIRED_FIELDS = ['Game Date', 'Time', 'Opponent', 'Location'];

function ColumnMapper({ csvHeaders, onMappingComplete }) {
  const [mappings, setMappings] = useState({});

  useEffect(() => {
    // Initialize mappings with empty strings or default selections
    const initialMappings = {};
    REQUIRED_FIELDS.forEach(field => {
      initialMappings[field] = '';
    });
    setMappings(initialMappings);
  }, [csvHeaders]);

  const handleSelectChange = (field, selectedHeader) => {
    setMappings(prevMappings => ({
      ...prevMappings,
      [field]: selectedHeader,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Validate that all required fields have been mapped
    const allMapped = REQUIRED_FIELDS.every(field => mappings[field] !== '');
    const uniqueMappings = new Set(Object.values(mappings).filter(Boolean)).size === REQUIRED_FIELDS.length;


    if (allMapped && uniqueMappings) {
      onMappingComplete(mappings);
    } else {
      alert("Please map all required fields to unique CSV columns.");
    }
  };

  return (
    <article>
      <header>
        <h3>Map CSV Columns</h3>
      </header>
      <form onSubmit={handleSubmit}>
        {REQUIRED_FIELDS.map(field => (
          <div key={field} style={{ marginBottom: '1rem' }}>
            <label htmlFor={`map-${field}`}>{field}:</label>
            <select
              id={`map-${field}`}
              value={mappings[field]}
              onChange={(e) => handleSelectChange(field, e.target.value)}
              required
            >
              <option value="">Select a column</option>
              {csvHeaders.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>
        ))}
        <button type="submit">Confirm Mapping</button>
      </form>
    </article>
  );
}

export default ColumnMapper;
