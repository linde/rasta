import React, { useState, useEffect } from 'react';

function RankingForm({ uniqueRankingAttributes, onRankingComplete }) {
  const [preferences, setPreferences] = useState({});

  useEffect(() => {
    // Initialize preferences with default values (e.g., 0 for all attributes)
    const initialPreferences = {};

    // Opponent preferences
    uniqueRankingAttributes.opponents.forEach(opponent => {
      initialPreferences[`opponent-${opponent}`] = 0;
    });

    // Location preferences
    uniqueRankingAttributes.locations.forEach(location => {
      initialPreferences[`location-${location}`] = 0;
    });

    // Time bucket preferences
    uniqueRankingAttributes.timeBuckets.forEach(bucket => {
      initialPreferences[`timeBucket-${bucket}`] = 0;
    });

    // Mid-week day game preference
    initialPreferences['midweekDayGame-true'] = 0;
    initialPreferences['midweekDayGame-false'] = 0;

    setPreferences(initialPreferences);
  }, [uniqueRankingAttributes]);

  const handlePreferenceChange = (key, value) => {
    setPreferences(prevPreferences => ({
      ...prevPreferences,
      [key]: parseInt(value, 10), // Ensure value is a number
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onRankingComplete(preferences);
  };

  return (
    <article>
      <header>
        <h3>Set Ranking Preferences</h3>
      </header>
      <form onSubmit={handleSubmit}>
        <h4 style={{ marginBottom: '1rem' }}>Locations</h4> {/* Added margin-bottom here */}
        {uniqueRankingAttributes.locations.map(location => (
          <div key={`location-${location}`} className="grid"> {/* Removed margin-bottom */}
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

        <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Game Time</h4> {/* Added margin-top and margin-bottom */}
        {uniqueRankingAttributes.timeBuckets.map(bucket => (
          <div key={`timeBucket-${bucket}`} className="grid"> {/* Removed margin-bottom */}
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

        <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Mid-week Day Game</h4> {/* Added margin-top and margin-bottom */}
        <div className="grid"> {/* Removed margin-bottom */}
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
        <div className="grid"> {/* Removed margin-bottom */}
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

        <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Opponents</h4> {/* Added margin-top and margin-bottom */}
        {uniqueRankingAttributes.opponents.map(opponent => (
          <div key={`opponent-${opponent}`} className="grid"> {/* Removed margin-bottom */}
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
        
        <button type="submit" style={{ marginTop: '2rem' }}>Generate Ranking</button> {/* Adjusted margin-top */}
      </form>
    </article>
  );
}

export default RankingForm;
