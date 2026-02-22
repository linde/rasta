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
    const gameMonth = gameDate.isValid() ? gameDate.format('MMMM') : 'Unknown'; 
    const dayOfWeek = gameDate.isValid() ? gameDate.format('ルト') : 'Unknown'; // Default full day name (localized by locale, but usually English in CRA defaults)
    // Actually using .format('dddd') for clarity
    const dddd = gameDate.isValid() ? gameDate.format('dddd') : 'Unknown';

    return {
      id: `game-${index}`, // Unique ID for each game
      originalData: row, // Keep original row for reference
      gameDate: gameDate.isValid() ? gameDate.toDate() : null, // Store as Date object
      timeString,
      opponent,
      location,
      timeBucket,
      midweekDayGame,
      gameMonth, 
      dayOfWeek: dddd, // Full day name (e.g. "Monday")
      rank: 0, // Default rank, will be updated later
    };
  }).filter(game => game.gameDate !== null); // Filter out games with invalid dates
};

export const extractUniqueValues = (processedGames) => {
  const uniqueOpponents = new Set();
  const uniqueLocations = new Set();
  const uniqueTimeBuckets = new Set(); 
  const uniqueGameMonths = new Set(); 
  const uniqueDaysOfWeek = new Set();

  processedGames.forEach(game => {
    if (game.opponent) uniqueOpponents.add(game.opponent);
    if (game.location) uniqueLocations.add(game.location);
    if (game.timeBucket) uniqueTimeBuckets.add(game.timeBucket);
    if (game.gameMonth) uniqueGameMonths.add(game.gameMonth);
    if (game.dayOfWeek) uniqueDaysOfWeek.add(game.dayOfWeek);
  });

  // Define sort orders
  const monthOrder = moment.months();
  const dayOrder = moment.weekdays(); // Sunday, Monday, ...

  return {
    opponents: Array.from(uniqueOpponents).sort(),
    locations: Array.from(uniqueLocations).sort(),
    timeBuckets: ['Morning', 'Afternoon', 'Evening'].filter(bucket => uniqueTimeBuckets.has(bucket)),
    midweekDayGame: [true, false], 
    gameMonths: Array.from(uniqueGameMonths).sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)),
    daysOfWeek: Array.from(uniqueDaysOfWeek).sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)),
  };
};

export const generateRanking = (processedGames, rankingPreferences) => {
  if (!processedGames || !rankingPreferences) return [];

  const rankedGames = processedGames.map(game => {
    let score = 0;

    // Apply preferences
    score += rankingPreferences[`opponent-${game.opponent}`] || 0;
    score += rankingPreferences[`location-${game.location}`] || 0;
    score += rankingPreferences[`timeBucket-${game.timeBucket}`] || 0;
    score += rankingPreferences[`midweekDayGame-${game.midweekDayGame}`] || 0;
    score += rankingPreferences[`gameMonth-${game.gameMonth}`] || 0;
    score += rankingPreferences[`dayOfWeek-${game.dayOfWeek}`] || 0;

    return {
      ...game,
      score: score, 
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
