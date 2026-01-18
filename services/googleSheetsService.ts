import type { Question, Topic } from '../types';

// Master configuration sheet URL
export const MASTER_CONFIG_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQUv4zA167WG6griM00FRz-MTUm-v8o0687XWoWk_VbJ4PP-X5AyF-joKVu5gTVLu89rWJzvzvZnP55/pub?output=csv';

// Topic configuration from Google Sheet
export interface TopicConfig {
  topic: string;
  link: string;
  worksheetNo: string;
  tabName: string;
  difficulty: string;
}

// Leaderboard entry from Google Sheet
export interface LeaderboardEntry {
  name: string;
  quizzes: number;
  stars: number;
  streaks: number;
}

// Google Sheets URLs for each module (placeholders - will be replaced with actual URLs)
export const SHEET_URLS = {
  space: 'PLACEHOLDER_SPACE_SHEET_URL',
  geography: 'PLACEHOLDER_GEOGRAPHY_SHEET_URL',
  math: 'PLACEHOLDER_MATH_SHEET_URL',
  spell: 'PLACEHOLDER_SPELL_CHECK_SHEET_URL',
};

// Topics configuration with Google Sheets URLs
// Each topic uses a separate Google Sheet (Option 1)
// The worksheetNumber is used to filter questions from the "Worksheet No." column in the CSV
export const TOPICS: Topic[] = [
  {
    id: 'space',
    name: 'Theme',
    icon: '🚀',
    color: '#4dd0e1',
    difficulty: 'Easy',
    solved: 0,
    total: 10,
    sheetUrl: SHEET_URLS.space,
    worksheetNumber: 1, // Filter questions where "Worksheet No." = 1
  },
  {
    id: 'geography',
    name: 'English',
    icon: '🌍',
    color: '#66bb6a',
    difficulty: 'Medium',
    solved: 0,
    total: 8,
    sheetUrl: SHEET_URLS.geography,
    worksheetNumber: 2, // Filter questions where "Worksheet No." = 2
  },
  {
    id: 'math',
    name: 'Math',
    icon: '🔢',
    color: '#ffa726',
    difficulty: 'Hard',
    solved: 0,
    total: 12,
    sheetUrl: SHEET_URLS.math,
    worksheetNumber: 3, // Filter questions where "Worksheet No." = 3
  },
  {
    id: 'spell',
    name: 'Spell Check',
    icon: '✏️',
    color: '#ab47bc',
    difficulty: 'Medium',
    solved: 0,
    total: 7,
    sheetUrl: SHEET_URLS.spell,
    worksheetNumber: 4, // Filter questions where "Worksheet No." = 4
  },
];

/**
 * Build CSV URL with worksheet GID parameter
 */
function buildCsvUrlWithWorksheet(baseUrl: string, worksheetGid?: string): string {
  // Extract GID from existing URL if present
  const gidMatch = baseUrl.match(/[?&]gid=(\d+)/);
  const existingGid = gidMatch ? gidMatch[1] : null;

  // Use provided GID, or existing GID, or default to '0' (first worksheet)
  const gid = worksheetGid || existingGid || '0';

  // Handle different Google Sheets URL formats
  if (baseUrl.includes('/pub?')) {
    // Published sheet format: ensure gid and output=csv are present
    if (baseUrl.includes('gid=')) {
      // Replace existing gid
      return baseUrl.replace(/gid=\d+/, `gid=${gid}`);
    } else {
      // Add gid parameter
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}gid=${gid}&single=true&output=csv`;
    }
  } else if (baseUrl.includes('/export')) {
    // Export format
    if (baseUrl.includes('gid=')) {
      // Replace existing gid
      return baseUrl.replace(/gid=\d+/, `gid=${gid}`);
    } else {
      // Add gid parameter
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}gid=${gid}`;
    }
  } else if (baseUrl.includes('/edit')) {
    // Convert edit URL to export format with gid
    const sheetId = baseUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (sheetId) {
      return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    }
  }

  // Default: return URL as-is and hope for the best
  return baseUrl;
}

/**
 * Parse CSV data from Google Sheets into Question objects
 * Column format: Question, Option 1, Option 2, Option 3, Option 4, Answer, Hint, Know More, Link, YouTube, Image, Type, Concept/Subtopic, Worksheet No
 */
function parseCSVToQuestions(csvText: string, topicId: string, filterWorksheetNumber?: number): Question[] {
  const lines = csvText.trim().split('\n');
  const questions: Question[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line with proper handling of quoted fields
    const parts = parseCSVLine(line);

    if (parts.length >= 6) {
      // Column positions: 0=Question, 1-4=Options, 5=Answer, 6=Hint, 7=Know More desc, 8=Link URL, 10=Image, 13=Worksheet No
      const questionText = parts[0];
      const option1 = parts[1];
      const option2 = parts[2];
      const option3 = parts[3];
      const option4 = parts[4];
      const correctAnswerText = parts[5]; // Full answer text
      const hint = parts[6] || '';
      const knowMoreText = parts[7] || ''; // Column 7 has the description text
      const knowMoreUrl = parts[8] || ''; // Column 8 has the actual URL
      const imageUrl = parts[10] || '';
      const worksheetNo = parts[13]; // Worksheet No is at column 14 (index 13)

      // Parse worksheet number from the data
      const questionWorksheetNumber = worksheetNo ? parseInt(worksheetNo, 10) : undefined;

      // If filterWorksheetNumber is specified, only include questions from that worksheet
      if (filterWorksheetNumber !== undefined && questionWorksheetNumber !== undefined) {
        if (questionWorksheetNumber !== filterWorksheetNumber) {
          continue; // Skip this question, it's from a different worksheet
        }
      }

      // Determine correct answer letter by matching text
      const options = [option1, option2, option3, option4];
      let correctAnswerLetter = 'A';
      const optionLetters = ['A', 'B', 'C', 'D'];
      for (let j = 0; j < options.length; j++) {
        if (options[j].trim().toLowerCase() === correctAnswerText.trim().toLowerCase()) {
          correctAnswerLetter = optionLetters[j];
          break;
        }
      }

      questions.push({
        id: `${topicId}-q${i}`,
        text: questionText,
        hint: hint || undefined,
        knowMore: knowMoreUrl || undefined,
        knowMoreText: knowMoreText || undefined,
        imageUrl: imageUrl || undefined,
        answers: [
          { id: 'A', text: option1 },
          { id: 'B', text: option2 },
          { id: 'C', text: option3 },
          { id: 'D', text: option4 },
        ],
        correctAnswer: correctAnswerLetter,
        topic: topicId,
        worksheetNumber: questionWorksheetNumber,
      });
    }
  }

  return questions;
}

/**
 * Parse a CSV line handling quoted fields with commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

/**
 * Fetch questions from Google Sheets for a specific topic
 * Supports filtering questions by "Worksheet No." column
 */
export async function fetchQuestionsFromSheet(topic: Topic): Promise<Question[]> {
  try {
    // Check if the URL is still a placeholder
    if (topic.sheetUrl.startsWith('PLACEHOLDER_')) {
      console.warn(`Google Sheets URL for ${topic.name} is still a placeholder. Using sample data.`);
      return getSampleQuestions(topic.id);
    }

    // Convert the sheet URL to CSV export format if needed (for separate sheets - Option 1)
    let csvUrl = topic.sheetUrl;
    if (topic.sheetUrl.includes('/edit')) {
      csvUrl = topic.sheetUrl.replace('/edit#gid=0', '/export?format=csv').replace('/edit', '/export?format=csv');
    }

    // If worksheetGid is specified, use it (for single sheet with multiple tabs)
    if (topic.worksheetGid) {
      csvUrl = buildCsvUrlWithWorksheet(csvUrl, topic.worksheetGid);
    }

    // Log which worksheet is being loaded
    const worksheetInfo = topic.worksheetNumber
      ? `filtering Worksheet No. ${topic.worksheetNumber}`
      : 'all worksheets';
    console.log(`Loading ${topic.name} from Google Sheet - ${worksheetInfo}`);

    // Add cache busting parameter
    const url = csvUrl + (csvUrl.includes('?') ? '&' : '?') + 't=' + Date.now();

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch from Google Sheets`);
    }

    const csvText = await response.text();

    // Parse questions and filter by worksheet number from "Worksheet No." column
    const questions = parseCSVToQuestions(csvText, topic.id, topic.worksheetNumber);

    if (questions.length === 0) {
      throw new Error('No questions found in the sheet');
    }

    console.log(`Successfully loaded ${questions.length} questions for ${topic.name} (${worksheetInfo})`);
    return questions;
  } catch (error) {
    console.error(`Error fetching questions for ${topic.name}:`, error);
    // Fallback to sample questions
    return getSampleQuestions(topic.id);
  }
}

/**
 * Get sample questions for testing (used when Google Sheets URL is not configured)
 */
function getSampleQuestions(topicId: string): Question[] {
  const sampleQuestions: Record<string, Question[]> = {
    space: [
      {
        id: 'space-q1',
        text: 'Who took Lily and Max on their space trip?',
        note: 'Read the story carefully before answering.',
        answers: [
          { id: 'A', text: 'Captain Star' },
          { id: 'B', text: 'Emma' },
          { id: 'C', text: 'Jake' },
          { id: 'D', text: 'Columbus' },
        ],
        correctAnswer: 'A',
        topic: 'space',
      },
      {
        id: 'space-q2',
        text: 'What planet is known as the Red Planet?',
        answers: [
          { id: 'A', text: 'Venus' },
          { id: 'B', text: 'Mars' },
          { id: 'C', text: 'Jupiter' },
          { id: 'D', text: 'Saturn' },
        ],
        correctAnswer: 'B',
        topic: 'space',
      },
    ],
    geography: [
      {
        id: 'geography-q1',
        text: 'What is the capital of France?',
        answers: [
          { id: 'A', text: 'London' },
          { id: 'B', text: 'Berlin' },
          { id: 'C', text: 'Paris' },
          { id: 'D', text: 'Madrid' },
        ],
        correctAnswer: 'C',
        topic: 'geography',
      },
    ],
    math: [
      {
        id: 'math-q1',
        text: 'What is 12 + 8?',
        answers: [
          { id: 'A', text: '18' },
          { id: 'B', text: '20' },
          { id: 'C', text: '22' },
          { id: 'D', text: '24' },
        ],
        correctAnswer: 'B',
        topic: 'math',
      },
    ],
    spell: [
      {
        id: 'spell-q1',
        text: 'Which word is spelled correctly?',
        note: 'Look carefully at each spelling before choosing.',
        answers: [
          { id: 'A', text: 'Beatiful' },
          { id: 'B', text: 'Beautiful' },
          { id: 'C', text: 'Beutiful' },
          { id: 'D', text: 'Beautifull' },
        ],
        correctAnswer: 'B',
        topic: 'spell',
      },
    ],
  };

  return sampleQuestions[topicId] || [];
}

/**
 * Fetch topic configuration from master Google Sheet
 */
export async function fetchTopicConfig(): Promise<TopicConfig[]> {
  try {
    const url = MASTER_CONFIG_URL + '&t=' + Date.now();
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    const configs: TopicConfig[] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      if (parts.length >= 5) {
        configs.push({
          topic: parts[0],
          link: parts[1],
          worksheetNo: parts[2],
          tabName: parts[3],
          difficulty: parts[4],
        });
      }
    }
    console.log('Loaded topic config:', configs);
    return configs;
  } catch (error) {
    console.error('Error fetching topic config:', error);
    return [];
  }
}

/**
 * Fetch leaderboard data from master Google Sheet
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const url = MASTER_CONFIG_URL + '&t=' + Date.now();
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    const entries: LeaderboardEntry[] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      // Columns: Topic, Link, Worksheet No, Tab Name, Difficulty, Leaderboard Name, Quizzes, Stars, Streaks
      if (parts.length >= 9 && parts[5]) {
        entries.push({
          name: parts[5],
          quizzes: parseInt(parts[6], 10) || 0,
          stars: parseInt(parts[7], 10) || 0,
          streaks: parseInt(parts[8], 10) || 0,
        });
      }
    }
    // Filter out empty entries
    const validEntries = entries.filter(e => e.name);
    console.log('Loaded leaderboard:', validEntries);
    return validEntries;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}
