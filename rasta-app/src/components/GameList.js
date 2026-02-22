import React, { useState, useMemo } from 'react';
import moment from 'moment';

// Define the icon for the delete button
const DeleteIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--pico-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Define the icon for the expand button
const ExpandIcon = ({ expanded }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--pico-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);


const GameList = ({ allRankedGames, onExcludeGame, excludedGameIds }) => { 
  const [expandedSeries, setExpandedSeries] = useState({}); 

  const toggleSeriesExpansion = (seriesKey) => {
    setExpandedSeries(prev => ({
      ...prev,
      [seriesKey]: !prev[seriesKey],
    }));
  };

  const groupedGames = useMemo(() => {
    if (!allRankedGames || allRankedGames.length === 0) return [];

    const groups = [];
    // Sort all games by date for stable series detection
    const sortedAllGames = [...allRankedGames].sort((a, b) => a.gameDate - b.gameDate); 

    let processedGameIds = new Set(); 

    sortedAllGames.forEach((game, index) => {
        if (processedGameIds.has(game.id)) {
            return; 
        }

        let seriesCandidates = [game];
        for (let j = index + 1; j < sortedAllGames.length; j++) {
            const nextGame = sortedAllGames[j];

            const isSameOpponent = game.opponent === nextGame.opponent;
            const isSameLocation = game.location === nextGame.location;
            const daysDiff = moment(nextGame.gameDate).diff(moment(game.gameDate), 'days');

            // Find games that are part of the original series structure
            if (isSameOpponent && isSameLocation && daysDiff > 0 && daysDiff <= 4) {
                seriesCandidates.push(nextGame);
            }
        }

        // We check if this structural group has any games that are "close" in rank among ALL games
        const highestRankInStructuralSeries = Math.min(...seriesCandidates.map(p => p.rank));
        const finalStructuralSeries = seriesCandidates.filter(p => Math.abs(p.rank - highestRankInStructuralSeries) <= 5);

        // A group is defined by its original members.
        // We only care about members that are NOT excluded for rendering.
        const activeSeriesGames = finalStructuralSeries.filter(g => !excludedGameIds.includes(g.id));

        if (activeSeriesGames.length > 1) {
            // Stable key based on the FIRST game of the original structural series
            const seriesKey = `${finalStructuralSeries[0].opponent}-${finalStructuralSeries[0].location}-${moment(finalStructuralSeries[0].gameDate).format('YYYYMMDD')}`;
            
            activeSeriesGames.sort((a, b) => a.rank - b.rank); 
            finalStructuralSeries.forEach(g => processedGameIds.add(g.id));

            const minDate = moment.min(activeSeriesGames.map(g => moment(g.gameDate)));
            const maxDate = moment.max(activeSeriesGames.map(g => moment(g.gameDate)));

            let formattedDateRangeMain;
            if (minDate.format('YYYY') === maxDate.format('YYYY') && minDate.format('MMM') === maxDate.format('MMM')) {
                formattedDateRangeMain = `${minDate.format('MMM D')}-${maxDate.format('D, YYYY')}`;
            } else if (minDate.format('YYYY') === maxDate.format('YYYY')) {
                formattedDateRangeMain = `${minDate.format('MMM D')} - ${maxDate.format('MMM D, YYYY')}`;
            } else {
                formattedDateRangeMain = `${minDate.format('MMM D, YYYY')} - ${maxDate.format('MMM D, YYYY')}`;
            }
            
            const seriesParenthesis = activeSeriesGames.map(g => 
                `${moment(g.gameDate).format('ddd MM/DD')} @ ${moment(g.timeString, ["h:mm A", "H:mm"]).format('hh:mm')}`
            ).join(', ');

            groups.push({
                type: 'series',
                key: seriesKey,
                games: activeSeriesGames, 
                formattedDateRangeMain: formattedDateRangeMain,
                opponent: activeSeriesGames[0].opponent,
                location: activeSeriesGames[0].location,
                seriesParenthesis: seriesParenthesis,
                representativeRank: activeSeriesGames[0].rank // Used for final sorting
            });
        } else if (activeSeriesGames.length === 1) {
            // If only one game is left, it's a single game entry
            groups.push({ type: 'single', game: activeSeriesGames[0] });
            finalStructuralSeries.forEach(g => processedGameIds.add(g.id));
        } else {
            // All games in this potential group were excluded
            finalStructuralSeries.forEach(g => processedGameIds.add(g.id));
        }
    });
    
    // Final sort of groups by their highest rank
    groups.sort((a, b) => {
        const rankA = a.type === 'single' ? a.game.rank : a.representativeRank;
        const rankB = b.type === 'single' ? b.game.rank : b.representativeRank;
        return rankA - rankB;
    });

    return groups;
  }, [allRankedGames, excludedGameIds]);


  return (
    <article>
      <header>
        <h3>Ranked Games</h3>
      </header>
      {groupedGames.length === 0 && <p>No games to display after ranking.</p>}
      {groupedGames.map((group) => (
        <div key={group.type === 'single' ? group.game.id : group.key} style={{ marginBottom: '1rem' }}>
          {group.type === 'single' ? (
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0 }}>
                <strong>{moment(group.game.gameDate).format('MMM DD, YYYY')}</strong> •{" "}
                {group.game.opponent} at {group.game.location}{" "}
                <span style={{ fontSize: '0.6em' }}>
                  ({moment(group.game.gameDate).format('ddd MM/DD')} @ {moment(group.game.timeString, ["h:mm A", "H:mm"]).format('hh:mm')})
                </span>
              </p>
              <button 
                onClick={() => onExcludeGame(group.game.id)} 
                className="secondary outline" 
                style={{ marginLeft: '1rem', padding: '0.2rem 0.5rem', border: 'none' }}
              >
                <DeleteIcon />
              </button>
            </div>
          ) : (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0 }}>
                  <strong>{group.formattedDateRangeMain}</strong> •{" "}
                  {group.opponent} at {group.location}{" "}
                  <span style={{ fontSize: '0.6em' }}>
                    ({group.seriesParenthesis})
                  </span>
                </p>
                <button 
                  onClick={() => toggleSeriesExpansion(group.key)} 
                  className="secondary outline" 
                  style={{ marginLeft: '1rem', padding: '0.2rem 0.5rem', border: 'none' }}
                >
                  <ExpandIcon expanded={expandedSeries[group.key]} />
                </button>
              </div>
              {expandedSeries[group.key] && (
                <ul style={{ listStyle: 'none', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                  {group.games.map(game => (
                    <li key={game.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <p style={{ margin: 0, fontSize: '0.9em' }}>
                        {moment(game.gameDate).format('MMM DD, YYYY')} •{" "}
                        {game.opponent} at {game.location}{" "}
                        <span style={{ fontSize: '0.6em' }}>
                          ({moment(game.gameDate).format('ddd MM/DD')} @ {moment(game.timeString, ["h:mm A", "H:mm"]).format('hh:mm')})
                        </span>
                      </p>
                      <button 
                        onClick={() => onExcludeGame(game.id)} 
                        className="secondary outline" 
                        style={{ marginLeft: '1rem', padding: '0.2rem 0.5rem', border: 'none' }}
                      >
                        <DeleteIcon />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ))}
    </article>
  );
};

export default GameList;
