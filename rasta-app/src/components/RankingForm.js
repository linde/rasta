import React, { useState, useEffect, useCallback } from 'react';

function RankingForm({ uniqueRankingAttributes, onRankingComplete, initialPreferences }) {
  const [preferences, setPreferences] = useState({});

  // Function to generate default (now 5) preferences
  const generateDefaultPreferences = useCallback(() => {
    const defaultPrefs = {};

    uniqueRankingAttributes.locations.forEach(location => {
      defaultPrefs[`location-${location}`] = 5;
    });
    // Add Game Month preferences
    uniqueRankingAttributes.gameMonths.forEach(month => {
      defaultPrefs[`gameMonth-${month}`] = 5;
    });
    // Add Day of Week preferences
    uniqueRankingAttributes.daysOfWeek.forEach(day => {
      defaultPrefs[`dayOfWeek-${day}`] = 5;
    });
    uniqueRankingAttributes.timeBuckets.forEach(bucket => {
      defaultPrefs[`timeBucket-${bucket}`] = 5;
    });
    defaultPrefs['midweekDayGame-true'] = 5;
    defaultPrefs['midweekDayGame-false'] = 5;
    uniqueRankingAttributes.opponents.forEach(opponent => {
      defaultPrefs[`opponent-${opponent}`] = 5;
    });
    return defaultPrefs;
  }, [uniqueRankingAttributes]);

  useEffect(() => {
    const newInitialPreferences = {};

    // Initialize with provided initialPreferences if they exist, otherwise default to 5
    uniqueRankingAttributes.locations.forEach(location => {
      newInitialPreferences[`location-${location}`] = initialPreferences?.[`location-${location}`] ?? 5;
    });
    // Initialize Game Month preferences
    uniqueRankingAttributes.gameMonths.forEach(month => {
      newInitialPreferences[`gameMonth-${month}`] = initialPreferences?.[`gameMonth-${month}`] ?? 5;
    });
    // Initialize Day of Week preferences
    uniqueRankingAttributes.daysOfWeek.forEach(day => {
      newInitialPreferences[`dayOfWeek-${day}`] = initialPreferences?.[`dayOfWeek-${day}`] ?? 5;
    });
    uniqueRankingAttributes.timeBuckets.forEach(bucket => {
      newInitialPreferences[`timeBucket-${bucket}`] = initialPreferences?.[`timeBucket-${bucket}`] ?? 5;
    });
    newInitialPreferences['midweekDayGame-true'] = initialPreferences?.['midweekDayGame-true'] ?? 5;
    newInitialPreferences['midweekDayGame-false'] = initialPreferences?.['midweekDayGame-false'] ?? 5;
    uniqueRankingAttributes.opponents.forEach(opponent => {
      newInitialPreferences[`opponent-${opponent}`] = initialPreferences?.[`opponent-${opponent}`] ?? 5;
    });

    setPreferences(newInitialPreferences);
  }, [uniqueRankingAttributes, initialPreferences, generateDefaultPreferences]);

  const handlePreferenceChange = (key, value) => {
    setPreferences(prevPreferences => ({
      ...prevPreferences,
      [key]: parseInt(value, 10), 
    }));
  };

  const handleReset = () => {
    const defaultPrefs = generateDefaultPreferences();
    setPreferences(defaultPrefs);
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pico-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
              min="0"
              max="10"
              value={preferences[`location-${location}`] ?? 5}
              onChange={(e) => handlePreferenceChange(`location-${location}`, e.target.value)}
            />
            <span>{preferences[`location-${location}`] ?? 5}</span>
          </div>
        ))}

        <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Game Month</h4>
        {uniqueRankingAttributes.gameMonths.map(month => (
          <div key={`gameMonth-${month}`} className="grid">
            <label htmlFor={`gameMonth-${month}`}>{month}</label>
            <input
              type="range"
              id={`gameMonth-${month}`}
              min="0"
              max="10"
              value={preferences[`gameMonth-${month}`] ?? 5}
              onChange={(e) => handlePreferenceChange(`gameMonth-${month}`, e.target.value)}
            />
            <span>{preferences[`gameMonth-${month}`] ?? 5}</span>
          </div>
        ))}

        <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Day of Week</h4>
        {uniqueRankingAttributes.daysOfWeek.map(day => (
          <div key={`dayOfWeek-${day}`} className="grid">
            <label htmlFor={`dayOfWeek-${day}`}>{day}</label>
            <input
              type="range"
              id={`dayOfWeek-${day}`}
              min="0"
              max="10"
              value={preferences[`dayOfWeek-${day}`] ?? 5}
              onChange={(e) => handlePreferenceChange(`dayOfWeek-${day}`, e.target.value)}
            />
            <span>{preferences[`dayOfWeek-${day}`] ?? 5}</span>
          </div>
        ))}

        <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Game Time</h4>
        {uniqueRankingAttributes.timeBuckets.map(bucket => (
          <div key={`timeBucket-${bucket}`} className="grid">
            <label htmlFor={`timeBucket-${bucket}`}>{bucket}</label>
            <input
              type="range"
              id={`timeBucket-${bucket}`}
              min="0"
              max="10"
              value={preferences[`timeBucket-${bucket}`] ?? 5}
              onChange={(e) => handlePreferenceChange(`timeBucket-${bucket}`, e.target.value)}
            />
            <span>{preferences[`timeBucket-${bucket}`] ?? 5}</span>
          </div>
        ))}

        <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Mid-week Day Game</h4>
        <div className="grid">
          <label htmlFor="midweekDayGame-true">Yes</label>
          <input
            type="range"
            id="midweekDayGame-true"
            min="0"
            max="10"
            value={preferences['midweekDayGame-true'] ?? 5}
            onChange={(e) => handlePreferenceChange('midweekDayGame-true', e.target.value)}
          />
          <span>{preferences['midweekDayGame-true'] ?? 5}</span>
        </div>
        <div className="grid">
          <label htmlFor="midweekDayGame-false">No</label>
          <input
            type="range"
            id="midweekDayGame-false"
            min="0"
            max="10"
            value={preferences['midweekDayGame-false'] ?? 5}
            onChange={(e) => handlePreferenceChange('midweekDayGame-false', e.target.value)}
          />
          <span>{preferences['midweekDayGame-false'] ?? 5}</span>
        </div>

        <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Opponents</h4>
        {uniqueRankingAttributes.opponents.map(opponent => (
          <div key={`opponent-${opponent}`} className="grid">
            <label htmlFor={`opponent-${opponent}`}>{opponent}</label>
            <input
              type="range"
              id={`opponent-${opponent}`}
              min="0"
              max="10"
              value={preferences[`opponent-${opponent}`] ?? 5}
              onChange={(e) => handlePreferenceChange(`opponent-${opponent}`, e.target.value)}
            />
            <span>{preferences[`opponent-${opponent}`] ?? 5}</span>
          </div>
        ))}
        
        <button type="submit" style={{ marginTop: '2rem' }}>Generate Ranking</button>
      </form>
    </article>
  );
}

export default RankingForm;
