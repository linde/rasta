import React, { useState, useMemo, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import ColumnMapper from './components/ColumnMapper';
import RankingForm from './components/RankingForm';
import GameList from './components/GameList'; // Import GameList
import { processGames, extractUniqueValues, generateRanking } from './logic/ranker';
import moment from 'moment'; // Import moment for date formatting in share text

function App() {
  const [csvData, setCsvData] = useState(null);
  const [columnMappings, setColumnMappings] = useState(null);
  const [processedGames, setProcessedGames] = useState(null);
  const [uniqueRankingAttributes, setUniqueRankingAttributes] = useState(null);
  const [rankingPreferences, setRankingPreferences] = useState(null);
  const [rankedGames, setRankedGames] = useState(null);
  const [showRankingForm, setShowRankingForm] = useState(false);
  const [shareMessage, setShareMessage] = useState(''); // State for share feedback

  // Handlers for state updates
  const handleFileUpload = (data) => {
    setCsvData(data);
    setColumnMappings(null);
    setRankingPreferences(null);
    setRankedGames(null);
    setShowRankingForm(false);
    setShareMessage('');
    
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
            console.log("Auto-mapped columns:", autoMappings);
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

  // Generate shareable text from rankedGames
  const generateShareText = () => {
    if (!rankedGames || rankedGames.length === 0) return "No ranked games to share.";

    let shareText = "My Ranked Season Tickets:\n\n";
    rankedGames.forEach((game, index) => {
        // Need to replicate the GameList display format here
        const gameDate = moment(game.gameDate);
        const formattedTime = moment(game.timeString, ["h:mm A", "H:mm"]).format('hh:mm A');
        shareText += `${index + 1}. ${gameDate.format('MMM DD, YYYY')} - ${game.opponent} at ${game.location} (${gameDate.format('ddd MM/DD')} @ ${formattedTime})\n`;
    });
    return shareText;
  };

  // Fallback for document.execCommand('copy')
  const fallbackCopyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";  // Avoid scrolling to bottom
    textArea.style.left = "-9999px"; // Hide from view
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
      // Fallback to document.execCommand('copy')
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
      console.log("Processed Games:", games);
      console.log("Unique Ranking Attributes:", attributes);
      // If ranking preferences already exist, re-generate ranks with new processed data
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
      console.log("Ranked Games:", gamesWithRanks);
    }
  }, [processedGames, rankingPreferences]);

  return (
    <main className="container">
      <nav>
        <ul>
          <li>
            <img 
              src={`${process.env.PUBLIC_URL}/rasta-icon.png`} 
              alt="RASTA Icon" 
              style={{ height: '64px', verticalAlign: 'middle', marginRight: '8px' }} 
            />
            <strong style={{ fontSize: '1.5rem' }}>RaSTA</strong> (Rank a Season's Tickets Automatically)
          </li>
        </ul>
        <ul>
          {/* Show Share and Settings buttons only if there's data to rank */}
          {csvData && columnMappings && processedGames && uniqueRankingAttributes && rankedGames && (
            <>
              <li>
                <button onClick={handleShare} className="secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                  {/* No "Share" text here */}
                </button>
              </li>
              <li>
                <button onClick={toggleRankingForm} className="secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 .33 1.82H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
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
          backgroundColor: 'var(--pico-background-color)', // Use Pico's background color
          color: 'var(--pico-color)', // Use Pico's text color
          padding: '1rem 1.5rem',
          borderRadius: 'var(--pico-border-radius)', // Use Pico's border radius
          boxShadow: 'var(--pico-box-shadow)', // Use Pico's box shadow
          zIndex: 1000,
          textAlign: 'center'
        }}>
          {shareMessage}
        </div>
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
              initialPreferences={rankingPreferences} // Pass existing preferences
            />
          ) : (
            <p>Processing game data for ranking...</p>
          )
        ) : (
          rankedGames ? (
            <GameList rankedGames={rankedGames} />
          ) : (
            <p>Generating ranks...</p>
          )
        )}
      </article>
    </main>
  );
}

export default App;
