import React, { useState, useMemo, useEffect, useCallback } from 'react'; 
import FileUpload from './components/FileUpload';
import ColumnMapper from './components/ColumnMapper';
import RankingForm from './components/RankingForm';
import GameList from './components/GameList'; 
import { processGames, extractUniqueValues, generateRanking } from './logic/ranker';
import { groupGames } from './logic/grouper'; // Import shared grouping logic
import moment from 'moment';

function App() {
  const [csvData, setCsvData] = useState(null);
  const [columnMappings, setColumnMappings] = useState(null);
  const [processedGames, setProcessedGames] = useState(null);
  const [uniqueRankingAttributes, setUniqueRankingAttributes] = useState(null);
  const [rankingPreferences, setRankingPreferences] = useState(null);
  const [rankedGames, setRankedGames] = useState(null);
  const [showRankingForm, setShowRankingForm] = useState(false);
  const [shareMessage, setShareMessage] = useState(''); 
  const [excludedGameIds, setExcludedGameIds] = useState([]); 
  const [manuallyRestoredIds, setManuallyRestoredIds] = useState([]); 
  const [selectedGameForInfo, setSelectedGameForInfo] = useState(null); // State for info popup

  // Function to reset all relevant state to initial values
  const handleResetApp = useCallback((event) => {
    if (event) event.preventDefault(); 
    setCsvData(null);
    setColumnMappings(null);
    setRankingPreferences(null);
    setProcessedGames(null);
    setUniqueRankingAttributes(null);
    setRankedGames(null);
    setShowRankingForm(false);
    setShareMessage('');
    setExcludedGameIds([]); 
    setManuallyRestoredIds([]);
    setSelectedGameForInfo(null);
  }, []); 

  // Handlers for state updates
  const handleFileUpload = (data) => {
    setCsvData(data);
    setColumnMappings(null);
    setRankingPreferences(null);
    setRankedGames(null);
    setShowRankingForm(false);
    setShareMessage('');
    setExcludedGameIds([]); 
    setManuallyRestoredIds([]);
    setSelectedGameForInfo(null);
    
    // Auto-mapping logic
    if (data && data.length > 0) {
        const headers = Object.keys(data[0]);
        const lowerCaseHeaders = headers.map(h => h.toLowerCase());
        const autoMappings = {};

        const mappingsToFind = {
            'Game Date': 'start date',
            'Time': 'start time',
            'Opponent': 'subject',
            'Location': 'location'
        };

        for (const [key, value] of Object.entries(mappingsToFind)) {
            const index = lowerCaseHeaders.indexOf(value);
            if (index !== -1) {
                autoMappings[key] = headers[index];
            }
        }
        
        if (Object.keys(autoMappings).length === Object.keys(mappingsToFind).length) {
            handleMappingComplete(autoMappings);
        }
    }
  };

  const handleMappingComplete = (mappings) => {
    setColumnMappings(mappings);
    setRankingPreferences(null);
    setRankedGames(null);
    setShowRankingForm(true);
    setShareMessage('');
    setExcludedGameIds([]); 
    setManuallyRestoredIds([]);
  };

  const handleRankingComplete = (preferences) => {
    setRankingPreferences(preferences);
    setShowRankingForm(false);
    setShareMessage('');
  };

  // Toggle ranking form visibility
  const toggleRankingForm = () => {
    setShowRankingForm(prev => !prev);
  };

  // Handle excluding/re-including a game
  const handleExcludeGame = useCallback((gameId) => {
    setExcludedGameIds(prevIds => {
      if (prevIds.includes(gameId)) {
        setManuallyRestoredIds(prev => [...prev, gameId]);
        return prevIds.filter(id => id !== gameId); 
      } else {
        setManuallyRestoredIds(prev => prev.filter(id => id !== gameId));
        return [...prevIds, gameId]; 
      }
    });
  }, []);

  // Effect to handle automatic exclusions based on zero preferences
  useEffect(() => {
    if (processedGames && rankingPreferences) {
      const newExcludedIds = new Set(excludedGameIds);
      let changed = false;

      processedGames.forEach(game => {
        const isZeroLocation = rankingPreferences[`location-${game.location}`] === 0;
        const isZeroMonth = rankingPreferences[`gameMonth-${game.gameMonth}`] === 0;
        const isZeroDay = rankingPreferences[`dayOfWeek-${game.dayOfWeek}`] === 0;
        const isZeroTime = rankingPreferences[`timeBucket-${game.timeBucket}`] === 0;
        const isZeroMidweek = rankingPreferences[`midweekDayGame-${game.midweekDayGame}`] === 0;
        const isZeroOpponent = rankingPreferences[`opponent-${game.opponent}`] === 0;

        if (isZeroLocation || isZeroMonth || isZeroDay || isZeroTime || isZeroMidweek || isZeroOpponent) {
          if (!newExcludedIds.has(game.id) && !manuallyRestoredIds.includes(game.id)) {
            newExcludedIds.add(game.id);
            changed = true;
          }
        }
      });

      if (changed) {
        setExcludedGameIds(Array.from(newExcludedIds));
      }
    }
  }, [processedGames, rankingPreferences, manuallyRestoredIds, excludedGameIds]);

  // Generate shareable text from grouped ranked games
  const generateShareText = () => {
    if (!rankedGames || rankedGames.length === 0) return "No ranked games to share.";

    // Use the shared grouping logic
    const groups = groupGames(rankedGames, excludedGameIds);
    if (groups.length === 0) return "No ranked games to share.";

    let shareText = "My Ranked Season Tickets:\n\n";
    groups.forEach((group, index) => {
        if (group.type === 'single') {
            const gameDate = moment(group.game.gameDate);
            const formattedTime = moment(group.game.timeString, ["h:mm A", "H:mm"]).format('hh:mm A');
            shareText += `${index + 1}. ${gameDate.format('MMM DD, YYYY')} • ${group.game.opponent} at ${group.game.location} (${gameDate.format('ddd MM/DD')} @ ${formattedTime})\n`;
        } else {
            shareText += `${index + 1}. ${group.formattedDateRangeMain} • ${group.opponent} at ${group.location} (${group.seriesParenthesis})\n`;
        }
    });
    return shareText;
  };

  // Fallback for document.execCommand('copy')
  const fallbackCopyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";  
    textArea.style.left = "-9999px"; 
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      console.error('Fallback: Failed to copy text: ', err);
      document.body.removeChild(textArea);
      return false;
    }
  };

  // Handle sharing to clipboard
  const handleShare = async () => {
    const textToCopy = generateShareText();
    let copiedSuccessfully = false;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        copiedSuccessfully = true;
      } catch (err) {
        console.error('navigator.clipboard.writeText failed: ', err);
      }
    }

    if (!copiedSuccessfully) {
      copiedSuccessfully = fallbackCopyToClipboard(textToCopy);
    }

    if (copiedSuccessfully) {
      setShareMessage('Copied to clipboard!');
      setTimeout(() => setShareMessage(''), 3000);
    } else {
      setShareMessage('Failed to copy.');
      setTimeout(() => setShareMessage(''), 3000);
    }
  };

  // Style for the title button to make it look like a link
  const titleButtonStyle = {
    background: 'none',
    border: 'none',
    padding: 0,
    color: 'inherit',
    cursor: 'pointer',
    font: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    textAlign: 'left',
    textDecoration: 'none'
  };

  // Memoize csvHeaders for performance
  const csvHeaders = useMemo(() => {
    if (csvData && csvData.length > 0) {
      return Object.keys(csvData[0]);
    }
    return [];
  }, [csvData]);

  // Process games and extract unique attributes once csvData and columnMappings are available
  useEffect(() => {
    if (csvData && columnMappings) {
      const games = processGames(csvData, columnMappings);
      setProcessedGames(games);
      const attributes = extractUniqueValues(games);
      setUniqueRankingAttributes(attributes);
      
      if (rankingPreferences) {
        const gamesWithRanks = generateRanking(games, rankingPreferences);
        setRankedGames(gamesWithRanks);
      }
    }
  }, [csvData, columnMappings, rankingPreferences]);

  // Generate ranks when preferences change or processedGames change
  useEffect(() => {
    if (processedGames && rankingPreferences) {
      const gamesWithRanks = generateRanking(processedGames, rankingPreferences);
      setRankedGames(gamesWithRanks);
    }
  }, [processedGames, rankingPreferences]);

  return (
    <main className="container">
      <nav>
        <ul>
          <li>
            <button onClick={handleResetApp} style={titleButtonStyle}>
              <img 
                src={`${process.env.PUBLIC_URL}/rasta-icon.png`} 
                alt="RaSTA Icon" 
                style={{ height: '64px', verticalAlign: 'middle', marginRight: '8px' }} 
              />
              <span style={{ fontSize: '1.5rem', fontWeight: 'normal' }}>
                <strong style={{ fontWeight: 'bold' }}>RaSTA</strong> (Rank a Season's Tickets Automatically)
              </span>
            </button>
          </li>
        </ul>
        <ul>
          {csvData && columnMappings && processedGames && uniqueRankingAttributes && rankedGames && (
            <>
              <li>
                <button onClick={handleShare} className="secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                </button>
              </li>
              <li>
                <button onClick={toggleRankingForm} className="secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 1 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 .33 1.82H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
      {shareMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--pico-background-color)', 
          color: 'var(--pico-color)', 
          padding: '1rem 1.5rem',
          borderRadius: 'var(--pico-border-radius)', 
          boxShadow: 'var(--pico-box-shadow)', 
          zIndex: 1000,
          textAlign: 'center'
        }}>
          {shareMessage}
        </div>
      )}

      {/* Info Popup Modal */}
      {selectedGameForInfo && (
        <dialog open>
          <article>
            <header>
              <button aria-label="Close" rel="prev" onClick={() => setSelectedGameForInfo(null)}></button>
              <h3>Ranking Coefficients</h3>
              <p style={{ margin: 0, fontSize: '0.9em' }}>
                {moment(selectedGameForInfo.gameDate).format('MMM DD, YYYY')} • {selectedGameForInfo.opponent} at {selectedGameForInfo.location}
              </p>
            </header>
            <table className="striped">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Value</th>
                  <th>Coefficient (Score)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Location</td>
                  <td>{selectedGameForInfo.location}</td>
                  <td>{rankingPreferences[`location-${selectedGameForInfo.location}`] || 0}</td>
                </tr>
                <tr>
                  <td>Month</td>
                  <td>{selectedGameForInfo.gameMonth}</td>
                  <td>{rankingPreferences[`gameMonth-${selectedGameForInfo.gameMonth}`] || 0}</td>
                </tr>
                <tr>
                  <td>Day of Week</td>
                  <td>{selectedGameForInfo.dayOfWeek}</td>
                  <td>{rankingPreferences[`dayOfWeek-${selectedGameForInfo.dayOfWeek}`] || 0}</td>
                </tr>
                <tr>
                  <td>Game Time</td>
                  <td>{selectedGameForInfo.timeBucket}</td>
                  <td>{rankingPreferences[`timeBucket-${selectedGameForInfo.timeBucket}`] || 0}</td>
                </tr>
                <tr>
                  <td>Mid-week Day</td>
                  <td>{selectedGameForInfo.midweekDayGame ? 'Yes' : 'No'}</td>
                  <td>{rankingPreferences[`midweekDayGame-${selectedGameForInfo.midweekDayGame}`] || 0}</td>
                </tr>
                <tr>
                  <td>Opponent</td>
                  <td>{selectedGameForInfo.opponent}</td>
                  <td>{rankingPreferences[`opponent-${selectedGameForInfo.opponent}`] || 0}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan="2">Total Score</th>
                  <th>{selectedGameForInfo.score}</th>
                </tr>
              </tfoot>
            </table>
          </article>
        </dialog>
      )}

      <article>
        {!csvData ? (
          <FileUpload onFileUpload={handleFileUpload} />
        ) : !columnMappings ? (
          <ColumnMapper csvHeaders={csvHeaders} onMappingComplete={handleMappingComplete} />
        ) : showRankingForm || !rankingPreferences ? (
          uniqueRankingAttributes ? (
            <RankingForm
              uniqueRankingAttributes={uniqueRankingAttributes}
              onRankingComplete={handleRankingComplete}
              initialPreferences={rankingPreferences} 
            />
          ) : (
            <p>Processing game data for ranking...</p>
          )
        ) : (
          rankedGames ? (
            <GameList 
              allRankedGames={rankedGames} 
              excludedGameIds={excludedGameIds} 
              onExcludeGame={handleExcludeGame} 
            />
          ) : (
            <p>Generating ranks...</p>
          )
        )}
      </article>
      {excludedGameIds.length > 0 && (
        <article>
          <header>
            <h4 style={{ margin: 0 }}>Exclusions</h4>
          </header>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {excludedGameIds.map(id => {
              const game = processedGames?.find(g => g.id === id); // Use processedGames to get the latest scores/data
              // Note: rankedGames might be outdated if we just changed preferences, 
              // but generateRanking updated rankedGames state in the second useEffect.
              // To be safe, we'll try to find it in rankedGames first to get the current score.
              const currentRankedGame = rankedGames?.find(g => g.id === id) || game;
              
              if (!currentRankedGame) return null;
              return (
                <li key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <p style={{ margin: 0 }}>
                    {moment(currentRankedGame.gameDate).format('MMM DD, YYYY')} • {currentRankedGame.opponent} at {currentRankedGame.location}{" "}
                    <span style={{ fontSize: '0.6em' }}>
                      ({moment(currentRankedGame.gameDate).format('ddd MM/DD')} @ {moment(currentRankedGame.timeString, ["h:mm A", "H:mm"]).format('hh:mm')})
                    </span>
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => setSelectedGameForInfo(currentRankedGame)} 
                      className="secondary outline" 
                      style={{ padding: '0.4rem', border: 'none', height: 'auto', width: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pico-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleExcludeGame(id)} 
                      className="secondary outline" 
                      style={{ padding: '0.2rem 0.5rem', border: 'none', height: 'auto', width: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', lineHeight: 1 }}>⟲</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </article>
      )}
    </main>
  );
}

export default App;
