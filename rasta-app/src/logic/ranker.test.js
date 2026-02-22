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
      'Opponent': 'DESCRIPTION',
      'Location': 'LOCATION',
    };
  });

  describe('processGames', () => {
    it('should correctly process the example game data', () => {
      const processed = processGames(realCsvData, realColumnMappings);
      expect(processed.length).toBe(realCsvData.length); // All rows should be valid
      
      const firstGame = processed[0];
      expect(firstGame).toMatchObject({
        opponent: 'Local TV: SF Video ----- Local Radio: KNBR 104.5 FM',
        location: 'Scottsdale Stadium - Scottsdale',
        timeString: '01:05 PM',
        timeBucket: 'Afternoon',
        midweekDayGame: false, // Sunday
      });
      expect(moment(firstGame.gameDate).format('MM/DD/YY')).toBe('02/22/26');
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
    });

    it('should extract unique locations', () => {
      expect(uniqueValues.locations).toEqual(['Oracle Park - San Francisco', 'Scottsdale Stadium - Scottsdale']);
    });
  });

  describe('generateRanking', () => {
    let processedGames;

    beforeAll(() => {
      processedGames = processGames(realCsvData, realColumnMappings);
    });

    const mockRankingPreferences = {
      'opponent-Local TV: ESPN ----- Local Radio: KNBR 104.5 FM': 10,
      'location-Oracle Park - San Francisco': 20,
      'timeBucket-Evening': 5,
      'midweekDayGame-true': -5, // User doesn't like mid-week day games
    };

    it('should assign scores and ranks based on preferences', () => {
      const ranked = generateRanking(processedGames, mockRankingPreferences);
      
      expect(ranked.length).toBe(processedGames.length);
      expect(ranked[0]).toHaveProperty('score');
      expect(ranked[0]).toHaveProperty('rank');
      
      const highestScoreGame = ranked.find(game => game.rank === 1);
      const scores = ranked.map(game => game.score);
      expect(highestScoreGame.score).toBe(Math.max(...scores));
    });
  });
});
