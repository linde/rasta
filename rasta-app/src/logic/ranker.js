import moment from 'moment'; // Using moment for robust date/time parsing and manipulation

// Helper to determine time bucket
const getTimeBucket = (timeString) => {
  if (!timeString) return 'Unknown';
  const hour = moment(timeString, ["h:mm A", "H:mm"]).hour(); // Handle both 12-hour and 24-hour formats
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon'; // Before 5 PM
  return 'Evening'; // 5 PM onwards
};

// Helper to determine if it's a mid-week day game
const isMidweekDayGame = (dateString, timeString) => {
  if (!dateString || !timeString) return false;
  const date = moment(dateString);
  const dayOfWeek = date.day(); // Sunday is 0, Monday is 1, ..., Saturday is 6
  const hour = moment(timeString, ["h:mm A", "H:mm"]).hour();

  // Mid-week: Monday (1) to Thursday (4)
  // Day game: Before 5 PM (hour < 17)
  return dayOfWeek >= 1 && dayOfWeek <= 4 && hour < 17;
};

export const processGames = (csvData, columnMappings) => {
  if (!csvData || !columnMappings) return [];

  return csvData.map((row, index) => {
    const gameDateString = row[columnMappings['Game Date']];
    const timeString = row[columnMappings['Time']];
    let opponent = row[columnMappings['Opponent']];
    const location = row[columnMappings['Location']];

    // Remove " at ..." from opponent name
    if (opponent && opponent.includes(' at ')) {
      opponent = opponent.split(' at ')[0].trim();
    }

    const gameDate = moment(gameDateString); // Parse game date
    const timeBucket = getTimeBucket(timeString);
    const midweekDayGame = isMidweekDayGame(gameDateString, timeString);

    return {
      id: `game-${index}`, // Unique ID for each game
      originalData: row, // Keep original row for reference
      gameDate: gameDate.isValid() ? gameDate.toDate() : null, // Store as Date object
      timeString,
      opponent,
      location,
      timeBucket,
      midweekDayGame,
      rank: 0, // Default rank, will be updated later
    };
  }).filter(game => game.gameDate !== null); // Filter out games with invalid dates
};

export const extractUniqueValues = (processedGames) => {
  const uniqueOpponents = new Set();
  const uniqueLocations = new Set();
  const uniqueTimeBuckets = new Set(); // Morning, Afternoon, Evening

  processedGames.forEach(game => {
    if (game.opponent) uniqueOpponents.add(game.opponent);
    if (game.location) uniqueLocations.add(game.location);
    if (game.timeBucket) uniqueTimeBuckets.add(game.timeBucket);
  });

  return {
    opponents: Array.from(uniqueOpponents).sort(),
    locations: Array.from(uniqueLocations).sort(),
    timeBuckets: ['Morning', 'Afternoon', 'Evening'].filter(bucket => uniqueTimeBuckets.has(bucket)), // Ensure consistent order
    midweekDayGame: [true, false], // Always provide these two options for ranking
  };
};

export const generateRanking = (processedGames, rankingPreferences) => {
  if (!processedGames || !rankingPreferences) return [];

  const rankedGames = processedGames.map(game => {
    let score = 0;

    // Apply opponent preference
    score += rankingPreferences[`opponent-${game.opponent}`] || 0;

    // Apply location preference
    score += rankingPreferences[`location-${game.location}`] || 0;

    // Apply time bucket preference
    score += rankingPreferences[`timeBucket-${game.timeBucket}`] || 0;

    // Apply midweek day game preference
    score += rankingPreferences[`midweekDayGame-${game.midweekDayGame}`] || 0;

    return {
      ...game,
      score: score, // Store the calculated score
    };
  });

  // Sort games by score in descending order (higher score = better rank)
  rankedGames.sort((a, b) => b.score - a.score);

  // Assign ranks
  return rankedGames.map((game, index) => ({
    ...game,
    rank: index + 1,
  }));
};
