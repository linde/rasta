import React, { useMemo } from 'react';
import moment from 'moment';

const GameList = ({ rankedGames }) => {
  const groupedGames = useMemo(() => {
    if (!rankedGames || rankedGames.length === 0) return [];

    const groups = [];
    const gamesForSeriesDetection = [...rankedGames].sort((a, b) => a.gameDate - b.gameDate); 

    let processedGameIds = new Set(); 

    gamesForSeriesDetection.forEach((game, index) => {
        if (processedGameIds.has(game.id)) {
            return; 
        }

        let seriesCandidates = [game];
        for (let j = index + 1; j < gamesForSeriesDetection.length; j++) {
            const nextGame = gamesForSeriesDetection[j];

            const isSameOpponent = game.opponent === nextGame.opponent;
            const isSameLocation = game.location === nextGame.location;
            const daysDiff = moment(nextGame.gameDate).diff(moment(game.gameDate), 'days');

            if (isSameOpponent && isSameLocation && daysDiff > 0 && daysDiff <= 4) {
                seriesCandidates.push(nextGame);
            }
        }

        const potentialSeries = rankedGames.filter(rankedGame => 
            seriesCandidates.some(candidate => candidate.id === rankedGame.id)
        );

        if (potentialSeries.length > 1) {
            const highestRankInSeries = Math.min(...potentialSeries.map(p => p.rank));
            const finalSeriesGames = potentialSeries.filter(p => Math.abs(p.rank - highestRankInSeries) <= 5);

            if (finalSeriesGames.length > 1) {
                finalSeriesGames.sort((a, b) => a.rank - b.rank); 
                finalSeriesGames.forEach(g => processedGameIds.add(g.id));

                const minDate = moment.min(finalSeriesGames.map(g => moment(g.gameDate)));
                const maxDate = moment.max(finalSeriesGames.map(g => moment(g.gameDate)));

                // Format date range for series (main display)
                let formattedDateRangeMain;
                if (minDate.format('YYYY') === maxDate.format('YYYY') && minDate.format('MMM') === maxDate.format('MMM')) {
                    formattedDateRangeMain = `${minDate.format('MMM D')}-${maxDate.format('D, YYYY')}`;
                } else if (minDate.format('YYYY') === maxDate.format('YYYY')) {
                    formattedDateRangeMain = `${minDate.format('MMM D')} - ${maxDate.format('MMM D, YYYY')}`;
                } else {
                    formattedDateRangeMain = `${minDate.format('MMM D, YYYY')} - ${maxDate.format('MMM D, YYYY')}`;
                }
                
                // Parenthesis content for series (all games listed)
                const seriesParenthesis = finalSeriesGames.map(game => 
                    `${moment(game.gameDate).format('ddd MM/DD')} @ ${moment(game.timeString, ["h:mm A", "H:mm"]).format('hh:mm')}` // Changed A to empty string
                ).join(', ');


                groups.push({
                    type: 'series',
                    key: `${finalSeriesGames[0].opponent}-${finalSeriesGames[0].location}-${minDate.format('YYYYMMDD')}`,
                    games: finalSeriesGames, 
                    minDate: minDate.toDate(),
                    maxDate: maxDate.toDate(),
                    formattedDateRangeMain: formattedDateRangeMain,
                    opponent: finalSeriesGames[0].opponent,
                    location: finalSeriesGames[0].location,
                    seriesParenthesis: seriesParenthesis,
                });
            } else {
                groups.push({ type: 'single', game: game });
                processedGameIds.add(game.id);
            }
        } else {
            groups.push({ type: 'single', game: game });
            processedGameIds.add(game.id);
        }
    });
    
    groups.sort((a, b) => {
        const rankA = a.type === 'single' ? a.game.rank : a.games[0].rank;
        const rankB = b.type === 'single' ? b.game.rank : b.games[0].rank;
        return rankA - rankB;
    });

    return groups;
  }, [rankedGames]);


  return (
    <article>
      <header>
        <h3>Ranked Games</h3>
      </header>
      {groupedGames.length === 0 && <p>No games to display after ranking.</p>}
      {groupedGames.map((group) => (
        <div key={group.type === 'single' ? group.game.id : group.key} style={{ marginBottom: '1rem' }}>
          {group.type === 'single' ? (
            <div className="card">
              <p>
                <strong>{moment(group.game.gameDate).format('MMM DD, YYYY')}</strong> -{" "}
                {group.game.opponent} at {group.game.location}{" "}
                <span style={{ fontSize: '0.6em' }}>
                  ({moment(group.game.gameDate).format('ddd MM/DD')} @ {moment(group.game.timeString, ["h:mm A", "H:mm"]).format('hh:mm')})
                </span>
              </p>
            </div>
          ) : (
            <div className="card">
              <p>
                <strong>{group.formattedDateRangeMain}</strong> -{" "}
                {group.opponent} at {group.location}{" "}
                <span style={{ fontSize: '0.6em' }}>
                  ({group.seriesParenthesis})
                </span>
              </p>
            </div>
          )}
        </div>
      ))}
    </article>
  );
};

export default GameList;
