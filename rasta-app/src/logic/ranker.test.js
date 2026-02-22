import { processGames, extractUniqueValues, generateRanking } from './ranker';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

describe('ranker.js with real data', () => {
  let realCsvData;
  let realColumnMappings;

  beforeAll(() => {
    const csvFilePath = path.resolve(__dirname, '../../public/GameTicketPromotionPrice.csv');
    const csvString = fs.readFileSync(csvFilePath, 'utf8');
    const parsed = Papa.parse(csvString, { header: true, skipEmptyLines: true });
    realCsvData = parsed.data;

    realColumnMappings = {
      'Game Date': 'START DATE',
      'Time': 'START TIME',
      'Opponent': 'SUBJECT', // Changed from DESCRIPTION to SUBJECT
      'Location': 'LOCATION',
    };
  });

  describe('processGames', () => {
    it('should correctly process the example game data', () => {
      const processed = processGames(realCsvData, realColumnMappings);
      expect(processed.length).toBe(realCsvData.length); // All rows should be valid
      
      const firstGame = processed[0]; // Feb 22, 2026
      expect(firstGame).toMatchObject({
        opponent: 'Cubs', // 'Cubs at Giants' -> 'Cubs'
        location: 'Scottsdale Stadium - Scottsdale',
        timeString: '01:05 PM',
        timeBucket: 'Afternoon',
        midweekDayGame: false, // Sunday
        gameMonth: 'February',
      });
      expect(moment(firstGame.gameDate).format('MM/DD/YY')).toBe('02/22/26');

      const gameInMarch = processed.find(g => moment(g.gameDate).month() === 2); // March
      expect(gameInMarch.gameMonth).toBe('March');
    });
  });

  describe('extractUniqueValues', () => {
    let processedGames;
    let uniqueValues;

    beforeAll(() => {
      processedGames = processGames(realCsvData, realColumnMappings);
      uniqueValues = extractUniqueValues(processedGames);
    });

    it('should extract unique opponents', () => {
      expect(uniqueValues.opponents.length).toBeGreaterThan(10); // Check for a reasonable number of opponents
      expect(uniqueValues.opponents).toContain('Cubs');
      expect(uniqueValues.opponents).not.toContain('Cubs at Giants');
    });

    it('should extract unique locations', () => {
      expect(uniqueValues.locations).toEqual(['Oracle Park - San Francisco', 'Scottsdale Stadium - Scottsdale']);
    });

    it('should extract unique game months in correct order', () => {
      // Based on the provided CSV, months should be Feb, Mar, Apr, May, Jun, Jul, Aug, Sep
      expect(uniqueValues.gameMonths).toEqual([
        'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September'
      ]);
    });
  });

  describe('generateRanking', () => {
    let processedGames;

    beforeAll(() => {
      processedGames = processGames(realCsvData, realColumnMappings);
    });

    const mockRankingPreferences = {
      'opponent-Cubs': 10,
      'location-Oracle Park - San Francisco': 20,
      'timeBucket-Evening': 5,
      'midweekDayGame-true': -5, 
      'gameMonth-March': 15, // Prefer March games
      'gameMonth-February': 5,
    };

    it('should assign scores and ranks based on preferences including game month', () => {
      const ranked = generateRanking(processedGames, mockRankingPreferences);
      
      expect(ranked.length).toBe(processedGames.length);
      expect(ranked[0]).toHaveProperty('score');
      expect(ranked[0]).toHaveProperty('rank');
      
      const highestScoreGame = ranked.find(game => game.rank === 1);
      const scores = ranked.map(game => game.score);
      expect(highestScoreGame.score).toBe(Math.max(...scores));

      // Test a specific game's score based on new preferences
      // Find a game in March at Oracle Park (example: 03/23/26 Sultanes at Giants)
      const sultanesMarchGame = processedGames.find(game => 
        game.opponent === 'Sultanes' && 
        game.location === 'Oracle Park - San Francisco' && 
        game.gameMonth === 'March'
      );
      
      // Expected score for sultanesMarchGame:
      // opponent-Sultanes: 0 (not in preferences)
      // location-Oracle Park - San Francisco: 20
      // timeBucket-Evening: 5 (06:45 PM is Evening)
      // midweekDayGame-true: 0 (Monday 03/23/26, 06:45 PM is not a mid-week day game)
      // gameMonth-March: 15
      // Total: 20 + 5 + 15 = 40
      const rankedSultanesMarchGame = ranked.find(game => game.id === sultanesMarchGame.id);
      expect(rankedSultanesMarchGame.score).toBe(40);
    });
  });
});
