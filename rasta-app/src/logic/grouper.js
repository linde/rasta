import moment from 'moment';

export const groupGames = (allRankedGames, excludedGameIds) => {
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
};
