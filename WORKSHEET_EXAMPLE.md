# Worksheet No. Column - Example Usage

This document provides examples of how to use the "Worksheet No." column to organize multiple sets of questions in your Google Sheets.

## Option 1: Separate Google Sheets (Recommended for Organization)

Each module has its own Google Sheet, but you can still use "Worksheet No." to organize multiple question sets within each sheet.

### Example: Space Module Google Sheet

```csv
Question,Answer A,Answer B,Answer C,Answer D,Correct Answer,Note,Worksheet No.
"Who took Lily and Max on their space trip?","Captain Star","Emma","Jake","Columbus","A","Read the story carefully before answering.",1
"What planet is known as the Red Planet?","Venus","Mars","Jupiter","Saturn","B","",1
"Which planet has rings?","Earth","Mars","Saturn","Venus","C","",1
"How many planets are in our solar system?","7","8","9","10","B","",1
```

**Configuration:**
```typescript
{
  id: 'space',
  name: 'Space',
  sheetUrl: 'YOUR_SPACE_SHEET_URL',
  worksheetNumber: 1, // Only loads questions where "Worksheet No." = 1
}
```

### Example: Geography Module Google Sheet

```csv
Question,Answer A,Answer B,Answer C,Answer D,Correct Answer,Note,Worksheet No.
"What is the capital of France?","London","Berlin","Paris","Madrid","C","",2
"Which ocean is the largest?","Atlantic","Pacific","Indian","Arctic","B","",2
"What is the longest river?","Amazon","Nile","Mississippi","Yangtze","B","",2
```

**Configuration:**
```typescript
{
  id: 'geography',
  name: 'Geography',
  sheetUrl: 'YOUR_GEOGRAPHY_SHEET_URL',
  worksheetNumber: 2, // Only loads questions where "Worksheet No." = 2
}
```

## Option 2: Single Google Sheet with All Modules

Store all quiz questions in ONE Google Sheet, organized by "Worksheet No."

### Example: Combined Quiz Data

```csv
Question,Answer A,Answer B,Answer C,Answer D,Correct Answer,Note,Worksheet No.
"Who took Lily and Max on their space trip?","Captain Star","Emma","Jake","Columbus","A","Read the story carefully before answering.",1
"What planet is known as the Red Planet?","Venus","Mars","Jupiter","Saturn","B","",1
"What is the capital of France?","London","Berlin","Paris","Madrid","C","",2
"Which ocean is the largest?","Atlantic","Pacific","Indian","Arctic","B","",2
"What is 12 + 8?","18","20","22","24","B","",3
"What is 5 x 6?","25","30","35","40","B","",3
"Which word is spelled correctly?","Beatiful","Beautiful","Beutiful","Beautifull","B","Look carefully at each spelling before choosing.",4
"Choose the correct spelling","Recieve","Receive","Recive","Receeve","B","",4
```

**Configuration:**
```typescript
export const SHEET_URLS = {
  space: 'YOUR_SINGLE_SHEET_URL',
  geography: 'YOUR_SINGLE_SHEET_URL',  // Same URL
  math: 'YOUR_SINGLE_SHEET_URL',       // Same URL
  spell: 'YOUR_SINGLE_SHEET_URL',      // Same URL
};

export const TOPICS: Topic[] = [
  {
    id: 'space',
    sheetUrl: SHEET_URLS.space,
    worksheetNumber: 1, // Filters Worksheet No. = 1
  },
  {
    id: 'geography',
    sheetUrl: SHEET_URLS.geography,
    worksheetNumber: 2, // Filters Worksheet No. = 2
  },
  {
    id: 'math',
    sheetUrl: SHEET_URLS.math,
    worksheetNumber: 3, // Filters Worksheet No. = 3
  },
  {
    id: 'spell',
    sheetUrl: SHEET_URLS.spell,
    worksheetNumber: 4, // Filters Worksheet No. = 4
  },
];
```

## Benefits of Using "Worksheet No." Column

1. **Flexible Organization**: Organize questions however you want
2. **Easy Management**: Keep all questions in one place (Option 2) or separate them (Option 1)
3. **Future Expansion**: Add more worksheet numbers for additional question sets
4. **Version Control**: Use different worksheet numbers for different difficulty levels or versions

## Advanced Usage: Multiple Question Sets Per Module

You can store multiple question sets for the same module:

```csv
Question,Answer A,Answer B,Answer C,Answer D,Correct Answer,Note,Worksheet No.
"Space Easy Question 1","A","B","C","D","A","",1
"Space Easy Question 2","A","B","C","D","B","",1
"Space Hard Question 1","A","B","C","D","C","",5
"Space Hard Question 2","A","B","C","D","D","",5
```

Then switch between them by changing the `worksheetNumber` in configuration:
```typescript
{
  id: 'space',
  worksheetNumber: 1, // Easy questions
  // Change to 5 for hard questions
}
```

## How the Filtering Works

The app:
1. Fetches the entire CSV from Google Sheets
2. Parses each row and reads the "Worksheet No." column
3. Filters questions based on the `worksheetNumber` configured for each topic
4. Returns only the matching questions for that module

**Example:**
- If Space module has `worksheetNumber: 1`
- And the CSV has rows with "Worksheet No." values: 1, 1, 2, 3, 1, 4
- The app will only load the questions where "Worksheet No." = 1 (rows 1, 2, and 5)
