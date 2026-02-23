import moment from 'moment';

export const groupGames = (allRankedGames, excludedGameIds) => {
  if (!allRankedGames || allRankedGames.length === 0) return [];

  const groups = [];
  // Use ALL games for grouping logic, sorted by date for stable structural detection
  const sortedAllGames = [...allRankedGames].sort((a, b) => a.gameDate - b.gameDate); 

  let processedGameIds = new Set(); 

  sortedAllGames.forEach((game, index) => {
      if (processedGameIds.has(game.id)) {
          return; 
      }

      // 1. Identify "Structural Series": games against same opponent/location within 4 days
      let structuralSeriesCandidates = [game];
      for (let j = index + 1; j < sortedAllGames.length; j++) {
          const nextGame = sortedAllGames[j];

          const isSameOpponent = game.opponent === nextGame.opponent;
          const isSameLocation = game.location === nextGame.location;
          const daysDiff = moment(nextGame.gameDate).diff(moment(game.gameDate), 'days');

          if (isSameOpponent && isSameLocation && daysDiff > 0 && daysDiff <= 4) {
              structuralSeriesCandidates.push(nextGame);
          }
      }

      // Mark these structural members as processed so we don't start a new group with them
      structuralSeriesCandidates.forEach(c => processedGameIds.add(c.id));

      // 2. Identify "Ranked Series": members of the structural series that are "close" in rank
      const highestRankInStructuralSeries = Math.min(...structuralSeriesCandidates.map(p => p.rank));
      const rankedSeriesGames = structuralSeriesCandidates.filter(p => Math.abs(p.rank - highestRankInStructuralSeries) <= 5);

      // 3. Identify "Active Series": members of the ranked series that are NOT excluded
      const activeGames = rankedSeriesGames.filter(g => !excludedGameIds.includes(g.id));

      if (activeGames.length > 1) {
          // It's still a series group
          const seriesKey = `${game.opponent}-${game.location}-${moment(game.gameDate).format('YYYYMMDD')}`;
          activeGames.sort((a, b) => a.rank - b.rank); 

          const minDate = moment.min(activeGames.map(g => moment(g.gameDate)));
          const maxDate = moment.max(activeGames.map(g => moment(g.gameDate)));

          let formattedDateRangeMain;
          if (minDate.format('YYYY') === maxDate.format('YYYY') && minDate.format('MMM') === maxDate.format('MMM')) {
              formattedDateRangeMain = `${minDate.format('MMM D')}-${maxDate.format('D, YYYY')}`;
          } else if (minDate.format('YYYY') === maxDate.format('YYYY')) {
              formattedDateRangeMain = `${minDate.format('MMM D')} - ${maxDate.format('MMM D, YYYY')}`;
          } else {
              formattedDateRangeMain = `${minDate.format('MMM D, YYYY')} - ${maxDate.format('MMM D, YYYY')}`;
          }
          
          const seriesParenthesis = activeGames.map(g => 
              `${moment(g.gameDate).format('ddd MM/DD')} @ ${moment(g.timeString, ["h:mm A", "H:mm"]).format('hh:mm')}`
          ).join(', ');

          groups.push({
              type: 'series',
              key: seriesKey,
              games: activeGames, 
              formattedDateRangeMain: formattedDateRangeMain,
              opponent: activeGames[0].opponent,
              location: activeGames[0].location,
              seriesParenthesis: seriesParenthesis,
              representativeRank: activeGames[0].rank 
          });
      } else if (activeGames.length === 1) {
          // Only one game left in this ranked grouping, show as single
          groups.push({ type: 'single', game: activeGames[0] });
      }
      
      // If activeGames.length === 0, all games in this ranked series were excluded.
      // We also need to check if any games from structuralSeriesCandidates that were NOT in rankedSeriesGames are still active.
      // These should be processed as singles in subsequent iterations, but we marked them as processed.
      // FIX: Only mark members of the rankedSeriesGames as processed if we want them to stay together.
      // Actually, if a game was structurally in a series but rank-wise far away, it should have been 
      // its own single or part of another series. 
      // To be safe, we re-evaluate games that were in structuralSeriesCandidates but NOT in rankedSeriesGames.
      
      structuralSeriesCandidates.forEach(c => {
          if (!rankedSeriesGames.some(rg => rg.id === c.id)) {
              processedGameIds.delete(c.id); // Allow them to be processed again
          }
      });
  });
  
  // Final sort of groups by their highest rank
  groups.sort((a, b) => {
      const rankA = a.type === 'single' ? a.game.rank : a.representativeRank;
      const rankB = b.type === 'single' ? b.game.rank : b.representativeRank;
      return rankA - rankB;
  });

  return groups;
};
