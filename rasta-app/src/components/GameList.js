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
