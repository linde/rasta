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
      'Opponent': 'SUBJECT', 
      'Location': 'LOCATION',
    };
  });

  describe('processGames', () => {
    it('should correctly process the example game data including day of week', () => {
      const processed = processGames(realCsvData, realColumnMappings);
      expect(processed.length).toBe(realCsvData.length); 
      
      const firstGame = processed[0]; // Feb 22, 2026 is a Sunday
      expect(firstGame).toMatchObject({
        opponent: 'Cubs',
        location: 'Scottsdale Stadium - Scottsdale',
        timeString: '01:05 PM',
        timeBucket: 'Afternoon',
        midweekDayGame: false,
        gameMonth: 'February',
        dayOfWeek: 'Sunday',
      });
    });
  });

  describe('extractUniqueValues', () => {
    let processedGames;
    let uniqueValues;

    beforeAll(() => {
      processedGames = processGames(realCsvData, realColumnMappings);
      uniqueValues = extractUniqueValues(processedGames);
    });

    it('should extract unique days of week in correct order', () => {
      // The example data has games on every day of the week
      expect(uniqueValues.daysOfWeek).toEqual([
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
      ]);
    });
  });

  describe('generateRanking', () => {
    let processedGames;

    beforeAll(() => {
      processedGames = processGames(realCsvData, realColumnMappings);
    });

    it('should assign scores based on day of week preferences', () => {
      const mockRankingPreferences = {
        'dayOfWeek-Saturday': 50,
        'dayOfWeek-Sunday': 50,
        'dayOfWeek-Monday': -10,
      };

      const ranked = generateRanking(processedGames, mockRankingPreferences);
      
      // A Saturday game should have a higher score than a Monday game (all else being equal)
      const saturdayGame = ranked.find(g => g.dayOfWeek === 'Saturday');
      const mondayGame = ranked.find(g => g.dayOfWeek === 'Monday');
      
      // Note: other default factors are 0, so Saturday should be ~50 and Monday ~ -10
      expect(saturdayGame.score).toBeGreaterThan(mondayGame.score);
      expect(saturdayGame.score).toBe(50);
      expect(mondayGame.score).toBe(-10);
    });
  });
});
