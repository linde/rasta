import React, { useState, useMemo } from 'react';
import moment from 'moment';
import { groupGames } from '../logic/grouper'; // Import the shared grouping logic

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
    return groupGames(allRankedGames, excludedGameIds);
  }, [allRankedGames, excludedGameIds]);


  return (
    <article style={{ padding: '1rem' }}>
      <header style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Ranked Games</h3>
      </header>
      {groupedGames.length === 0 && <p>No games to display after ranking.</p>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {groupedGames.map((group) => (
          <li key={group.type === 'single' ? group.game.id : group.key} style={{ marginBottom: '0.5rem', listStyle: 'none' }}>
            {group.type === 'single' ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0 }}>
                  {moment(group.game.gameDate).format('MMM DD, YYYY')} • {group.game.opponent} at {group.game.location}{" "}
                  <span style={{ fontSize: '0.6em' }}>
                    ({moment(group.game.gameDate).format('ddd MM/DD')} @ {moment(group.game.timeString, ["h:mm A", "H:mm"]).format('hh:mm')})
                  </span>
                </p>
                <button 
                  onClick={() => onExcludeGame(group.game.id)} 
                  className="secondary outline" 
                  style={{ marginLeft: '1rem', padding: '0.2rem 0.5rem', border: 'none', height: 'auto', width: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <DeleteIcon />
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0 }}>
                    {group.formattedDateRangeMain} • {group.opponent} at {group.location}{" "}
                    <span style={{ fontSize: '0.6em' }}>
                      ({group.seriesParenthesis})
                    </span>
                  </p>
                  <button 
                    onClick={() => toggleSeriesExpansion(group.key)} 
                    className="secondary outline" 
                    style={{ marginLeft: '1rem', padding: '0.2rem 0.5rem', border: 'none', height: 'auto', width: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ExpandIcon expanded={expandedSeries[group.key]} />
                  </button>
                </div>
                {expandedSeries[group.key] && (
                  <ul style={{ listStyle: 'none', paddingLeft: '1.5rem', marginTop: '0.25rem', borderLeft: '2px solid var(--pico-muted-border-color)' }}>
                    {group.games.map(game => (
                      <li key={game.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', listStyle: 'none' }}>
                        <p style={{ margin: 0, fontSize: '0.9em' }}>
                          {moment(game.gameDate).format('MMM DD, YYYY')} • {game.opponent} at {game.location}{" "}
                          <span style={{ fontSize: '0.6em' }}>
                            ({moment(game.gameDate).format('ddd MM/DD')} @ {moment(game.timeString, ["h:mm A", "H:mm"]).format('hh:mm')})
                          </span>
                        </p>
                        <button 
                          onClick={() => onExcludeGame(game.id)} 
                          className="secondary outline" 
                          style={{ marginLeft: '1rem', padding: '0.2rem 0.5rem', border: 'none', height: 'auto', width: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <DeleteIcon />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
};

export default GameList;
