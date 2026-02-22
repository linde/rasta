import React, { useState, useEffect, useCallback } from 'react';

function RankingForm({ uniqueRankingAttributes, onRankingComplete, initialPreferences }) {
  const [preferences, setPreferences] = useState({});

  // Function to generate default (zero) preferences
  const generateDefaultPreferences = useCallback(() => {
    const defaultPrefs = {};

    uniqueRankingAttributes.locations.forEach(location => {
      defaultPrefs[`location-${location}`] = 0;
    });
    // Add Game Month preferences
    uniqueRankingAttributes.gameMonths.forEach(month => {
      defaultPrefs[`gameMonth-${month}`] = 0;
    });
    uniqueRankingAttributes.timeBuckets.forEach(bucket => {
      defaultPrefs[`timeBucket-${bucket}`] = 0;
    });
    defaultPrefs['midweekDayGame-true'] = 0;
    defaultPrefs['midweekDayGame-false'] = 0;
    uniqueRankingAttributes.opponents.forEach(opponent => {
      defaultPrefs[`opponent-${opponent}`] = 0;
    });
    return defaultPrefs;
  }, [uniqueRankingAttributes]);

  useEffect(() => {
    const newInitialPreferences = {};

    // Initialize with provided initialPreferences if they exist, otherwise default to 0
    uniqueRankingAttributes.locations.forEach(location => {
      newInitialPreferences[`location-${location}`] = initialPreferences?.[`location-${location}`] || 0;
    });
    // Initialize Game Month preferences
    uniqueRankingAttributes.gameMonths.forEach(month => {
      newInitialPreferences[`gameMonth-${month}`] = initialPreferences?.[`gameMonth-${month}`] || 0;
    });
    uniqueRankingAttributes.timeBuckets.forEach(bucket => {
      newInitialPreferences[`timeBucket-${bucket}`] = initialPreferences?.[`timeBucket-${bucket}`] || 0;
    });
    newInitialPreferences['midweekDayGame-true'] = initialPreferences?.['midweekDayGame-true'] || 0;
    newInitialPreferences['midweekDayGame-false'] = initialPreferences?.['midweekDayGame-false'] || 0;
    uniqueRankingAttributes.opponents.forEach(opponent => {
      newInitialPreferences[`opponent-${opponent}`] = initialPreferences?.[`opponent-${opponent}`] || 0;
    });

    setPreferences(newInitialPreferences);
  }, [uniqueRankingAttributes, initialPreferences, generateDefaultPreferences]);

  const handlePreferenceChange = (key, value) => {
    setPreferences(prevPreferences => ({
      ...prevPreferences,
      [key]: parseInt(value, 10), // Ensure value is a number
    }));
  };

  const handleReset = () => {
    const defaultPrefs = generateDefaultPreferences();
    setPreferences(defaultPrefs);
    // onRankingComplete(defaultPrefs); // No longer notify parent on reset
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onRankingComplete(preferences);
  };

  return (
    <article>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Set Ranking Preferences</h3>
        <button onClick={handleReset} className="secondary" style={{ width: 'auto', padding: '0.5rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <polyline points="23 20 23 14 17 14"></polyline>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
          </svg>
        </button>
      </header>
      <form onSubmit={handleSubmit}>
        <h4 style={{ marginBottom: '1rem' }}>Locations</h4>
        {uniqueRankingAttributes.locations.map(location => (
          <div key={`location-${location}`} className="grid">
            <label htmlFor={`location-${location}`}>{location}</label>
            <input
              type="range"
              id={`location-${location}`}
              min="-10"
              max="10"
              value={preferences[`location-${location}`] || 0}
              onChange={(e) => handlePreferenceChange(`location-${location}`, e.target.value)}
            />
            <span>{preferences[`location-${location}`] || 0}</span>
          </div>
        ))}

        {/* New Game Month section */}
        <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Game Month</h4>
        {uniqueRankingAttributes.gameMonths.map(month => (
          <div key={`gameMonth-${month}`} className="grid">
            <label htmlFor={`gameMonth-${month}`}>{month}</label>
            <input
              type="range"
              id={`gameMonth-${month}`}
              min="-10"
              max="10"
              value={preferences[`gameMonth-${month}`] || 0}
              onChange={(e) => handlePreferenceChange(`gameMonth-${month}`, e.target.value)}
            />
            <span>{preferences[`gameMonth-${month}`] || 0}</span>
          </div>
        ))}

        <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Game Time</h4>
        {uniqueRankingAttributes.timeBuckets.map(bucket => (
          <div key={`timeBucket-${bucket}`} className="grid">
            <label htmlFor={`timeBucket-${bucket}`}>{bucket}</label>
            <input
              type="range"
              id={`timeBucket-${bucket}`}
              min="-10"
              max="10"
              value={preferences[`timeBucket-${bucket}`] || 0}
              onChange={(e) => handlePreferenceChange(`timeBucket-${bucket}`, e.target.value)}
            />
            <span>{preferences[`timeBucket-${bucket}`] || 0}</span>
          </div>
        ))}

        <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Mid-week Day Game</h4>
        <div className="grid">
          <label htmlFor="midweekDayGame-true">Yes</label>
          <input
            type="range"
            id="midweekDayGame-true"
            min="-10"
            max="10"
            value={preferences['midweekDayGame-true'] || 0}
            onChange={(e) => handlePreferenceChange('midweekDayGame-true', e.target.value)}
          />
          <span>{preferences['midweekDayGame-true'] || 0}</span>
        </div>
        <div className="grid">
          <label htmlFor="midweekDayGame-false">No</label>
          <input
            type="range"
            id="midweekDayGame-false"
            min="-10"
            max="10"
            value={preferences['midweekDayGame-false'] || 0}
            onChange={(e) => handlePreferenceChange('midweekDayGame-false', e.target.value)}
          />
          <span>{preferences['midweekDayGame-false'] || 0}</span>
        </div>

        <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Opponents</h4>
        {uniqueRankingAttributes.opponents.map(opponent => (
          <div key={`opponent-${opponent}`} className="grid">
            <label htmlFor={`opponent-${opponent}`}>{opponent}</label>
            <input
              type="range"
              id={`opponent-${opponent}`}
              min="-10"
              max="10"
              value={preferences[`opponent-${opponent}`] || 0}
              onChange={(e) => handlePreferenceChange(`opponent-${opponent}`, e.target.value)}
            />
            <span>{preferences[`opponent-${opponent}`] || 0}</span>
          </div>
        ))}
        
        <button type="submit" style={{ marginTop: '2rem' }}>Generate Ranking</button>
      </form>
    </article>
  );
}

export default RankingForm;
