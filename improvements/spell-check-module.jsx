import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// GOOGLE SHEETS CONFIGURATION - PLACEHOLDER PATHS
// ============================================================
const GOOGLE_SHEETS_CONFIG = {
  // Main Google Sheet ID containing all word data
  sheetId: 'YOUR_GOOGLE_SHEET_ID_HERE',
  
  // API Key for Google Sheets API
  apiKey: 'YOUR_GOOGLE_API_KEY_HERE',
  
  // Sheet names/tabs
  sheets: {
    spellChallenge: 'SpellChallengeWords',  // Tab for spelling words
    meanings: 'WordMeanings',                // Tab for meaning exercises
  },
  
  // Expected columns in SpellChallengeWords sheet:
  // | word | difficulty | hint | category | fillInBlank |
  // | elephant | easy | Large animal with trunk | animals | ele____t |
  
  // Expected columns in WordMeanings sheet:
  // | word | meaning | synonyms | exampleSentence | difficulty |
  // | happy | feeling joy or pleasure | joyful, glad, cheerful | I am happy today | easy |
  
  // Placeholder endpoint (replace with actual Google Sheets API call)
  getSpellWordsEndpoint: () => 
    `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.sheetId}/values/${GOOGLE_SHEETS_CONFIG.sheets.spellChallenge}?key=${GOOGLE_SHEETS_CONFIG.apiKey}`,
  
  getMeaningsEndpoint: () =>
    `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.sheetId}/values/${GOOGLE_SHEETS_CONFIG.sheets.meanings}?key=${GOOGLE_SHEETS_CONFIG.apiKey}`,
};

// ============================================================
// SAMPLE DATA (Replace with Google Sheets data)
// ============================================================
const SAMPLE_SPELL_WORDS = [
  { word: 'elephant', difficulty: 'easy', hint: 'Large grey animal with a trunk', category: 'Animals', fillInBlank: 'ele____t' },
  { word: 'beautiful', difficulty: 'medium', hint: 'Very pretty or attractive', category: 'Adjectives', fillInBlank: 'beau____ul' },
  { word: 'difficult', difficulty: 'medium', hint: 'Not easy to do', category: 'Adjectives', fillInBlank: 'diffi____t' },
  { word: 'favourite', difficulty: 'easy', hint: 'The one you like most', category: 'Adjectives', fillInBlank: 'favo____te' },
  { word: 'knowledge', difficulty: 'hard', hint: 'What you learn and know', category: 'Nouns', fillInBlank: 'know____ge' },
  { word: 'butterfly', difficulty: 'easy', hint: 'Colorful flying insect', category: 'Animals', fillInBlank: 'butt____ly' },
  { word: 'chocolate', difficulty: 'easy', hint: 'Sweet brown treat', category: 'Food', fillInBlank: 'choc____te' },
  { word: 'adventure', difficulty: 'medium', hint: 'An exciting journey', category: 'Nouns', fillInBlank: 'adven____e' },
];

const SAMPLE_MEANINGS = [
  { word: 'Happy', meaning: 'feeling joy or pleasure', synonyms: ['joyful', 'glad', 'cheerful'], example: 'I am happy to see you!', difficulty: 'easy' },
  { word: 'Brave', meaning: 'not afraid of danger', synonyms: ['courageous', 'fearless', 'bold'], example: 'The brave firefighter saved the cat.', difficulty: 'easy' },
  { word: 'Curious', meaning: 'wanting to know or learn something', synonyms: ['inquisitive', 'interested'], example: 'The curious child asked many questions.', difficulty: 'medium' },
  { word: 'Ancient', meaning: 'very old, from long ago', synonyms: ['old', 'historic', 'antique'], example: 'We visited an ancient temple.', difficulty: 'medium' },
  { word: 'Generous', meaning: 'willing to give and share', synonyms: ['kind', 'giving', 'unselfish'], example: 'She was generous with her toys.', difficulty: 'medium' },
  { word: 'Enormous', meaning: 'very large in size', synonyms: ['huge', 'giant', 'massive'], example: 'The elephant was enormous!', difficulty: 'easy' },
];

// ============================================================
// MAIN SPELL CHECK APP COMPONENT
// ============================================================
export default function SpellCheckApp() {
  const [currentScreen, setCurrentScreen] = useState('landing'); // landing, spellChallenge, meaning
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null); // null, 'correct', 'incorrect'
  const [showHint, setShowHint] = useState(false);
  const [spellMode, setSpellMode] = useState('full'); // 'full' or 'fillIn'
  const [isPlaying, setIsPlaying] = useState(false);
  const [streak, setStreak] = useState(0);

  // Speech synthesis for Indian English accent
  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(word);
      
      // Try to find Indian English voice
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(voice => 
        voice.lang.includes('en-IN') || 
        voice.name.includes('India') ||
        voice.name.includes('indian')
      );
      
      if (indianVoice) {
        utterance.voice = indianVoice;
      }
      
      utterance.rate = 0.8; // Slower for kids
      utterance.pitch = 1.1;
      utterance.onend = () => setIsPlaying(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Check spelling answer
  const checkSpelling = () => {
    const currentWord = SAMPLE_SPELL_WORDS[currentWordIndex];
    const isCorrect = userInput.toLowerCase().trim() === currentWord.word.toLowerCase();
    
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setTotalQuestions(prev => prev + 1);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  // Check meaning answer (contextual check)
  const checkMeaning = () => {
    const currentWord = SAMPLE_MEANINGS[currentWordIndex];
    const userAnswer = userInput.toLowerCase().trim();
    const correctMeaning = currentWord.meaning.toLowerCase();
    const synonyms = currentWord.synonyms.map(s => s.toLowerCase());
    
    // Contextual check: look for key words
    const keyWords = correctMeaning.split(' ').filter(w => w.length > 3);
    const matchedWords = keyWords.filter(kw => userAnswer.includes(kw));
    const synonymMatch = synonyms.some(syn => userAnswer.includes(syn));
    
    // Consider correct if >50% key words match or synonym found
    const isCorrect = (matchedWords.length >= keyWords.length * 0.5) || synonymMatch;
    
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setTotalQuestions(prev => prev + 1);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  // Next question
  const nextQuestion = () => {
    setFeedback(null);
    setUserInput('');
    setShowHint(false);
    
    const maxIndex = currentScreen === 'spellChallenge' 
      ? SAMPLE_SPELL_WORDS.length - 1 
      : SAMPLE_MEANINGS.length - 1;
    
    if (currentWordIndex < maxIndex) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      setCurrentWordIndex(0); // Loop back
    }
  };

  // Reset game
  const resetGame = () => {
    setCurrentWordIndex(0);
    setScore(0);
    setTotalQuestions(0);
    setUserInput('');
    setFeedback(null);
    setShowHint(false);
    setStreak(0);
  };

  // ==================== LANDING SCREEN ====================
  const LandingScreen = () => (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.bgPattern}>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.floatingLetter,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${20 + Math.random() * 30}px`,
            }}
          >
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', '✏️', '📚', '🔤', '✨'][Math.floor(Math.random() * 12)]}
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => window.history.back()}>
          <span>←</span>
        </button>
        <div style={styles.titleSection}>
          <span style={styles.titleIcon}>✏️</span>
          <h1 style={styles.mainTitle}>Spell Check</h1>
        </div>
        <div style={styles.streakBadge}>
          <span>🔥</span>
          <span>{streak}</span>
        </div>
      </div>

      {/* Stats Banner */}
      <div style={styles.statsBanner}>
        <div style={styles.statItem}>
          <span style={styles.statEmoji}>⭐</span>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{score}</span>
            <span style={styles.statLabel}>Score</span>
          </div>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={styles.statEmoji}>📝</span>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{totalQuestions}</span>
            <span style={styles.statLabel}>Attempted</span>
          </div>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={styles.statEmoji}>🎯</span>
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{totalQuestions > 0 ? Math.round((score/totalQuestions)*100) : 0}%</span>
            <span style={styles.statLabel}>Accuracy</span>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div style={styles.welcomeBox}>
        <span style={styles.welcomeEmoji}>👋</span>
        <p style={styles.welcomeText}>Hey Champ! Ready to become a <strong>Spelling Superstar</strong>?</p>
      </div>

      {/* Activity Cards */}
      <h2 style={styles.sectionTitle}>Choose Your Challenge</h2>
      
      <div style={styles.cardsContainer}>
        {/* Spell Challenge Card */}
        <div 
          style={styles.activityCard}
          onClick={() => { resetGame(); setCurrentScreen('spellChallenge'); }}
        >
          <div style={styles.cardGlow} />
          <div style={styles.cardIconWrapper}>
            <span style={styles.cardIcon}>🔊</span>
            <div style={styles.soundWaves}>
              <div style={styles.wave1} />
              <div style={styles.wave2} />
              <div style={styles.wave3} />
            </div>
          </div>
          <h3 style={styles.cardTitle}>Spell Challenge</h3>
          <p style={styles.cardDescription}>
            Listen to the word and type the correct spelling!
          </p>
          <div style={styles.cardFeatures}>
            <span style={styles.featureTag}>🎧 Audio</span>
            <span style={styles.featureTag}>✍️ Type</span>
          </div>
          <div style={styles.difficultyBadges}>
            <span style={{...styles.diffBadge, background: '#4caf50'}}>Easy</span>
            <span style={{...styles.diffBadge, background: '#ff9800'}}>Medium</span>
            <span style={{...styles.diffBadge, background: '#f44336'}}>Hard</span>
          </div>
          <button style={styles.playButton}>
            <span>▶</span>
            <span>Play Now</span>
          </button>
        </div>

        {/* Meaning Card */}
        <div 
          style={{...styles.activityCard, ...styles.meaningCard}}
          onClick={() => { resetGame(); setCurrentScreen('meaning'); }}
        >
          <div style={{...styles.cardGlow, background: 'radial-gradient(circle, rgba(76, 175, 80, 0.3) 0%, transparent 70%)'}} />
          <div style={styles.cardIconWrapper}>
            <span style={styles.cardIcon}>📖</span>
            <div style={styles.sparkles}>✨</div>
          </div>
          <h3 style={styles.cardTitle}>Word Meaning</h3>
          <p style={styles.cardDescription}>
            See the word and write what it means!
          </p>
          <div style={styles.cardFeatures}>
            <span style={{...styles.featureTag, background: 'rgba(76, 175, 80, 0.2)', color: '#4caf50'}}>👀 Read</span>
            <span style={{...styles.featureTag, background: 'rgba(76, 175, 80, 0.2)', color: '#4caf50'}}>💭 Think</span>
          </div>
          <div style={styles.difficultyBadges}>
            <span style={{...styles.diffBadge, background: '#4caf50'}}>Easy</span>
            <span style={{...styles.diffBadge, background: '#ff9800'}}>Medium</span>
          </div>
          <button style={{...styles.playButton, background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)'}}>
            <span>▶</span>
            <span>Play Now</span>
          </button>
        </div>
      </div>

      {/* Mascot */}
      <div style={styles.mascotSection}>
        <span style={styles.mascot}>🦉</span>
        <div style={styles.mascotBubble}>
          <p>I'm Ollie the Owl! Let's learn together! 🌟</p>
        </div>
      </div>
    </div>
  );

  // ==================== SPELL CHALLENGE SCREEN ====================
  const SpellChallengeScreen = () => {
    const currentWord = SAMPLE_SPELL_WORDS[currentWordIndex];
    const inputRef = useRef(null);

    useEffect(() => {
      if (inputRef.current) inputRef.current.focus();
    }, [currentWordIndex]);

    return (
      <div style={styles.gameContainer}>
        {/* Background */}
        <div style={styles.gameBg}>
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.star,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Top Bar */}
        <div style={styles.gameTopBar}>
          <button style={styles.gameBackBtn} onClick={() => setCurrentScreen('landing')}>
            <span>←</span>
            <span>Back</span>
          </button>
          
          <div style={styles.progressPill}>
            <span style={styles.progressIcon}>📝</span>
            <span>{currentWordIndex + 1} / {SAMPLE_SPELL_WORDS.length}</span>
          </div>

          <div style={styles.gameStats}>
            <div style={styles.gameStatBadge}>
              <span>⭐</span>
              <span>{score}</span>
            </div>
            <div style={styles.streakBadgeSmall}>
              <span>🔥</span>
              <span>{streak}</span>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div style={styles.modeToggle}>
          <button 
            style={{
              ...styles.modeBtn,
              ...(spellMode === 'full' ? styles.modeBtnActive : {}),
            }}
            onClick={() => setSpellMode('full')}
          >
            Full Word
          </button>
          <button 
            style={{
              ...styles.modeBtn,
              ...(spellMode === 'fillIn' ? styles.modeBtnActive : {}),
            }}
            onClick={() => setSpellMode('fillIn')}
          >
            Fill Blanks
          </button>
        </div>

        {/* Main Game Card */}
        <div style={styles.gameCard}>
          {/* Category Badge */}
          <div style={styles.categoryBadge}>
            <span>📂</span>
            <span>{currentWord.category}</span>
          </div>

          {/* Speaker Section */}
          <div style={styles.speakerSection}>
            <button 
              style={{
                ...styles.speakerButton,
                ...(isPlaying ? styles.speakerPlaying : {}),
              }}
              onClick={() => speakWord(currentWord.word)}
            >
              <span style={styles.speakerIcon}>{isPlaying ? '🔊' : '🔈'}</span>
              <div style={styles.speakerRings}>
                <div style={{...styles.ring, animationPlayState: isPlaying ? 'running' : 'paused'}} />
                <div style={{...styles.ring, ...styles.ring2, animationPlayState: isPlaying ? 'running' : 'paused'}} />
              </div>
            </button>
            <p style={styles.speakerText}>
              {isPlaying ? 'Speaking...' : 'Tap to hear the word'}
            </p>
          </div>

          {/* Fill in Blank Display */}
          {spellMode === 'fillIn' && (
            <div style={styles.fillInDisplay}>
              <span style={styles.fillInText}>{currentWord.fillInBlank}</span>
            </div>
          )}

          {/* Input Section */}
          <div style={styles.inputSection}>
            <label style={styles.inputLabel}>
              {spellMode === 'full' ? '✍️ Type the word you heard:' : '✍️ Fill in the missing letters:'}
            </label>
            <div style={styles.inputWrapper}>
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={spellMode === 'full' ? 'Type here...' : 'Complete the word...'}
                style={{
                  ...styles.gameInput,
                  ...(feedback === 'correct' ? styles.inputCorrect : {}),
                  ...(feedback === 'incorrect' ? styles.inputIncorrect : {}),
                }}
                disabled={feedback !== null}
                onKeyPress={(e) => e.key === 'Enter' && !feedback && checkSpelling()}
              />
              {feedback && (
                <span style={styles.feedbackIcon}>
                  {feedback === 'correct' ? '✅' : '❌'}
                </span>
              )}
            </div>
          </div>

          {/* Hint Section */}
          {!feedback && (
            <button style={styles.hintBtn} onClick={() => setShowHint(true)}>
              <span>💡</span>
              <span>Need a Hint?</span>
            </button>
          )}

          {showHint && !feedback && (
            <div style={styles.hintBox}>
              <span>💡</span>
              <p>{currentWord.hint}</p>
            </div>
          )}

          {/* Feedback Section */}
          {feedback && (
            <div style={{
              ...styles.feedbackBox,
              background: feedback === 'correct' 
                ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
                : 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
              borderColor: feedback === 'correct' ? '#4caf50' : '#f44336',
            }}>
              <span style={styles.feedbackEmoji}>
                {feedback === 'correct' ? '🎉' : '😊'}
              </span>
              <p style={{
                ...styles.feedbackText,
                color: feedback === 'correct' ? '#2e7d32' : '#c62828',
              }}>
                {feedback === 'correct' 
                  ? 'Awesome! You got it right!' 
                  : `Good try! The correct spelling is "${currentWord.word}"`
                }
              </p>
              {streak >= 3 && feedback === 'correct' && (
                <div style={styles.streakAlert}>
                  <span>🔥</span>
                  <span>{streak} in a row!</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div style={styles.gameActions}>
          {!feedback ? (
            <button 
              style={{
                ...styles.submitBtn,
                opacity: userInput.trim() ? 1 : 0.5,
              }}
              onClick={checkSpelling}
              disabled={!userInput.trim()}
            >
              <span>Check Answer</span>
              <span>✓</span>
            </button>
          ) : (
            <button style={styles.nextBtn} onClick={nextQuestion}>
              <span>Next Word</span>
              <span>→</span>
            </button>
          )}
        </div>

        {/* Mascot Helper */}
        <div style={styles.helperMascot}>
          <span>🦉</span>
        </div>
      </div>
    );
  };

  // ==================== MEANING SCREEN ====================
  const MeaningScreen = () => {
    const currentWord = SAMPLE_MEANINGS[currentWordIndex];
    const inputRef = useRef(null);

    useEffect(() => {
      if (inputRef.current) inputRef.current.focus();
    }, [currentWordIndex]);

    return (
      <div style={styles.meaningContainer}>
        {/* Background */}
        <div style={styles.meaningBg}>
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.floatingBook,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            >
              {['📚', '📖', '📕', '📗', '📘', '✨', '💫'][Math.floor(Math.random() * 7)]}
            </div>
          ))}
        </div>

        {/* Top Bar */}
        <div style={styles.meaningTopBar}>
          <button style={styles.meaningBackBtn} onClick={() => setCurrentScreen('landing')}>
            <span>←</span>
            <span>Back</span>
          </button>
          
          <div style={styles.meaningProgressPill}>
            <span>📖</span>
            <span>{currentWordIndex + 1} / {SAMPLE_MEANINGS.length}</span>
          </div>

          <div style={styles.gameStats}>
            <div style={styles.meaningStatBadge}>
              <span>⭐</span>
              <span>{score}</span>
            </div>
            <div style={styles.meaningStreakBadge}>
              <span>🔥</span>
              <span>{streak}</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div style={styles.meaningCard}>
          {/* Difficulty Badge */}
          <div style={{
            ...styles.meaningDiffBadge,
            background: currentWord.difficulty === 'easy' ? '#4caf50' : '#ff9800',
          }}>
            {currentWord.difficulty === 'easy' ? '🌟 Easy' : '⭐ Medium'}
          </div>

          {/* Word Display */}
          <div style={styles.wordDisplaySection}>
            <p style={styles.wordLabel}>What does this word mean?</p>
            <div style={styles.wordDisplay}>
              <span style={styles.bigWord}>{currentWord.word}</span>
            </div>
          </div>

          {/* Example Sentence */}
          <div style={styles.exampleBox}>
            <span style={styles.exampleIcon}>💬</span>
            <p style={styles.exampleText}>
              <strong>Example:</strong> {currentWord.example}
            </p>
          </div>

          {/* Input Section */}
          <div style={styles.meaningInputSection}>
            <label style={styles.meaningInputLabel}>
              💭 Write the meaning in your own words:
            </label>
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type what this word means..."
              style={{
                ...styles.meaningTextarea,
                ...(feedback === 'correct' ? styles.textareaCorrect : {}),
                ...(feedback === 'incorrect' ? styles.textareaIncorrect : {}),
              }}
              disabled={feedback !== null}
              rows={3}
            />
          </div>

          {/* Hint - Synonyms */}
          {!feedback && (
            <button style={styles.synonymHintBtn} onClick={() => setShowHint(true)}>
              <span>💡</span>
              <span>Show Similar Words</span>
            </button>
          )}

          {showHint && !feedback && (
            <div style={styles.synonymBox}>
              <span>💡 Similar words: </span>
              <div style={styles.synonymTags}>
                {currentWord.synonyms.map((syn, i) => (
                  <span key={i} style={styles.synonymTag}>{syn}</span>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div style={{
              ...styles.meaningFeedback,
              background: feedback === 'correct' 
                ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
                : 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
              borderColor: feedback === 'correct' ? '#4caf50' : '#ff9800',
            }}>
              <span style={styles.feedbackEmoji}>
                {feedback === 'correct' ? '🎉' : '💪'}
              </span>
              <div style={styles.feedbackContent}>
                <p style={{
                  ...styles.feedbackTitle,
                  color: feedback === 'correct' ? '#2e7d32' : '#e65100',
                }}>
                  {feedback === 'correct' ? 'Great job!' : 'Nice try!'}
                </p>
                <p style={styles.feedbackMeaning}>
                  <strong>Meaning:</strong> {currentWord.meaning}
                </p>
              </div>
              {streak >= 3 && feedback === 'correct' && (
                <div style={styles.meaningStreakAlert}>
                  🔥 {streak} streak!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div style={styles.meaningActions}>
          {!feedback ? (
            <button 
              style={{
                ...styles.meaningSubmitBtn,
                opacity: userInput.trim() ? 1 : 0.5,
              }}
              onClick={checkMeaning}
              disabled={!userInput.trim()}
            >
              <span>Check Answer</span>
              <span>✓</span>
            </button>
          ) : (
            <button style={styles.meaningNextBtn} onClick={nextQuestion}>
              <span>Next Word</span>
              <span>→</span>
            </button>
          )}
        </div>

        {/* Helper */}
        <div style={styles.meaningHelper}>
          <span>🦉</span>
          <div style={styles.helperTip}>
            {!feedback 
              ? "Don't worry about exact words - just explain the meaning!" 
              : feedback === 'correct' 
                ? "You're doing great!" 
                : "Keep trying, you'll get better!"
            }
          </div>
        </div>
      </div>
    );
  };

  // ==================== RENDER ====================
  return (
    <div style={styles.appWrapper}>
      <style>{keyframes}</style>
      {currentScreen === 'landing' && <LandingScreen />}
      {currentScreen === 'spellChallenge' && <SpellChallengeScreen />}
      {currentScreen === 'meaning' && <MeaningScreen />}
    </div>
  );
}

// ============================================================
// KEYFRAMES
// ============================================================
const keyframes = `
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(5deg); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
  @keyframes ripple {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(2); opacity: 0; }
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(171, 71, 188, 0.3); }
    50% { box-shadow: 0 0 40px rgba(171, 71, 188, 0.6); }
  }
  @keyframes wave {
    0% { transform: scaleY(1); }
    50% { transform: scaleY(1.5); }
    100% { transform: scaleY(1); }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Comic+Neue:wght@400;700&display=swap');
`;

// ============================================================
// STYLES
// ============================================================
const styles = {
  appWrapper: {
    fontFamily: "'Nunito', 'Comic Neue', sans-serif",
    minHeight: '100vh',
    overflow: 'hidden',
  },

  // ========== LANDING SCREEN ==========
  container: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    minHeight: '100vh',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },

  bgPattern: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },

  floatingLetter: {
    position: 'absolute',
    color: 'rgba(255, 255, 255, 0.15)',
    fontWeight: '800',
    animation: 'float 8s ease-in-out infinite',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    position: 'relative',
    zIndex: 10,
  },

  backBtn: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  titleIcon: {
    fontSize: '36px',
    animation: 'bounce 2s ease-in-out infinite',
  },

  mainTitle: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#fff',
    margin: 0,
    textShadow: '2px 4px 8px rgba(0,0,0,0.2)',
  },

  streakBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    borderRadius: '30px',
    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    color: '#fff',
    fontWeight: '800',
    fontSize: '18px',
    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.4)',
  },

  statsBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    padding: '20px 30px',
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    marginBottom: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },

  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  statEmoji: {
    fontSize: '32px',
  },

  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },

  statValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#fff',
  },

  statLabel: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },

  statDivider: {
    width: '2px',
    height: '40px',
    background: 'rgba(255, 255, 255, 0.2)',
  },

  welcomeBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '18px 24px',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    marginBottom: '25px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },

  welcomeEmoji: {
    fontSize: '36px',
    animation: 'bounce 1s ease-in-out infinite',
  },

  welcomeText: {
    fontSize: '18px',
    color: '#333',
    margin: 0,
  },

  sectionTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: '20px',
    textShadow: '1px 2px 4px rgba(0,0,0,0.2)',
  },

  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '30px',
    position: 'relative',
    zIndex: 10,
  },

  activityCard: {
    background: '#fff',
    borderRadius: '24px',
    padding: '28px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    border: '3px solid transparent',
  },

  meaningCard: {
    borderColor: '#4caf50',
  },

  cardGlow: {
    position: 'absolute',
    top: '-50%',
    right: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(171, 71, 188, 0.2) 0%, transparent 60%)',
    pointerEvents: 'none',
  },

  cardIconWrapper: {
    position: 'relative',
    width: '80px',
    height: '80px',
    margin: '0 auto 15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardIcon: {
    fontSize: '50px',
    position: 'relative',
    zIndex: 2,
  },

  soundWaves: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px',
    paddingLeft: '50px',
  },

  wave1: {
    width: '4px',
    height: '20px',
    background: '#ab47bc',
    borderRadius: '2px',
    animation: 'wave 0.5s ease-in-out infinite',
  },

  wave2: {
    width: '4px',
    height: '30px',
    background: '#ab47bc',
    borderRadius: '2px',
    animation: 'wave 0.5s ease-in-out infinite 0.1s',
  },

  wave3: {
    width: '4px',
    height: '15px',
    background: '#ab47bc',
    borderRadius: '2px',
    animation: 'wave 0.5s ease-in-out infinite 0.2s',
  },

  sparkles: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    fontSize: '24px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },

  cardTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    margin: '0 0 10px 0',
  },

  cardDescription: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
    margin: '0 0 15px 0',
    lineHeight: 1.5,
  },

  cardFeatures: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '15px',
  },

  featureTag: {
    padding: '6px 12px',
    borderRadius: '20px',
    background: 'rgba(171, 71, 188, 0.1)',
    color: '#ab47bc',
    fontSize: '12px',
    fontWeight: '700',
  },

  difficultyBadges: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '18px',
  },

  diffBadge: {
    padding: '4px 10px',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
  },

  playButton: {
    width: '100%',
    padding: '14px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%)',
    border: 'none',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 6px 20px rgba(171, 71, 188, 0.4)',
    transition: 'all 0.3s ease',
  },

  mascotSection: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: '15px',
    position: 'relative',
    zIndex: 10,
  },

  mascot: {
    fontSize: '70px',
    animation: 'bounce 2s ease-in-out infinite',
  },

  mascotBubble: {
    background: '#fff',
    padding: '15px 20px',
    borderRadius: '20px',
    borderBottomLeftRadius: '5px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
    maxWidth: '250px',
  },

  // ========== SPELL CHALLENGE SCREEN ==========
  gameContainer: {
    background: 'linear-gradient(135deg, #1a1a3e 0%, #2d2d5a 50%, #4a1a6e 100%)',
    minHeight: '100vh',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },

  gameBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: 'none',
  },

  star: {
    position: 'absolute',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: '#fff',
    animation: 'twinkle 2s ease-in-out infinite',
  },

  gameTopBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    position: 'relative',
    zIndex: 10,
  },

  gameBackBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  progressPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '30px',
    background: 'rgba(255, 255, 255, 0.15)',
    color: '#fff',
    fontWeight: '700',
  },

  progressIcon: {
    fontSize: '18px',
  },

  gameStats: {
    display: 'flex',
    gap: '12px',
  },

  gameStatBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
    color: '#333',
    fontWeight: '800',
    fontSize: '16px',
  },

  streakBadgeSmall: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    color: '#fff',
    fontWeight: '800',
    fontSize: '16px',
  },

  modeToggle: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
    position: 'relative',
    zIndex: 10,
  },

  modeBtn: {
    padding: '10px 24px',
    borderRadius: '30px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  modeBtnActive: {
    background: 'linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%)',
    borderColor: '#ab47bc',
    color: '#fff',
    boxShadow: '0 4px 20px rgba(171, 71, 188, 0.4)',
  },

  gameCard: {
    background: '#fff',
    borderRadius: '28px',
    padding: '30px',
    position: 'relative',
    zIndex: 10,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    marginBottom: '20px',
  },

  categoryBadge: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 20px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #4dd0e1 0%, #26c6da 100%)',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '700',
    boxShadow: '0 4px 15px rgba(77, 208, 225, 0.4)',
  },

  speakerSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '25px',
    marginTop: '15px',
  },

  speakerButton: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%)',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 40px rgba(171, 71, 188, 0.4)',
    transition: 'all 0.3s ease',
    animation: 'glow 2s ease-in-out infinite',
  },

  speakerPlaying: {
    transform: 'scale(1.05)',
  },

  speakerIcon: {
    fontSize: '50px',
    position: 'relative',
    zIndex: 2,
  },

  speakerRings: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
  },

  ring: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: '50%',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    animation: 'ripple 1.5s ease-out infinite',
  },

  ring2: {
    animationDelay: '0.5s',
  },

  speakerText: {
    marginTop: '15px',
    fontSize: '16px',
    color: '#666',
    fontWeight: '600',
  },

  fillInDisplay: {
    textAlign: 'center',
    marginBottom: '20px',
  },

  fillInText: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#ab47bc',
    letterSpacing: '4px',
    fontFamily: 'monospace',
  },

  inputSection: {
    marginBottom: '20px',
  },

  inputLabel: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '12px',
  },

  inputWrapper: {
    position: 'relative',
  },

  gameInput: {
    width: '100%',
    padding: '18px 24px',
    fontSize: '22px',
    fontWeight: '700',
    borderRadius: '16px',
    border: '3px solid #e0e0e0',
    outline: 'none',
    textAlign: 'center',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
  },

  inputCorrect: {
    borderColor: '#4caf50',
    background: '#e8f5e9',
  },

  inputIncorrect: {
    borderColor: '#f44336',
    background: '#ffebee',
    animation: 'shake 0.5s ease',
  },

  feedbackIcon: {
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '28px',
  },

  hintBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    background: 'rgba(255, 193, 7, 0.1)',
    border: '2px dashed #ffc107',
    color: '#f57c00',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '15px',
  },

  hintBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '15px 20px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
    borderLeft: '4px solid #ffc107',
    marginBottom: '15px',
  },

  feedbackBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    borderRadius: '16px',
    border: '2px solid',
    animation: 'slideIn 0.3s ease',
  },

  feedbackEmoji: {
    fontSize: '40px',
  },

  feedbackText: {
    fontSize: '16px',
    fontWeight: '700',
    margin: 0,
  },

  streakAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    color: '#fff',
    fontWeight: '800',
    fontSize: '14px',
    marginLeft: 'auto',
  },

  gameActions: {
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },

  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '18px 50px',
    borderRadius: '30px',
    background: 'linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%)',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 8px 30px rgba(171, 71, 188, 0.4)',
    transition: 'all 0.3s ease',
  },

  nextBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '18px 50px',
    borderRadius: '30px',
    background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 8px 30px rgba(76, 175, 80, 0.4)',
  },

  helperMascot: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    fontSize: '50px',
    animation: 'bounce 2s ease-in-out infinite',
    zIndex: 100,
  },

  // ========== MEANING SCREEN ==========
  meaningContainer: {
    background: 'linear-gradient(135deg, #134e5e 0%, #71b280 50%, #2d5016 100%)',
    minHeight: '100vh',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },

  meaningBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },

  floatingBook: {
    position: 'absolute',
    fontSize: '28px',
    opacity: 0.2,
    animation: 'float 10s ease-in-out infinite',
  },

  meaningTopBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    position: 'relative',
    zIndex: 10,
  },

  meaningBackBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  meaningProgressPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '30px',
    background: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    fontWeight: '700',
  },

  meaningStatBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
    color: '#333',
    fontWeight: '800',
  },

  meaningStreakBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    color: '#fff',
    fontWeight: '800',
  },

  meaningCard: {
    background: '#fff',
    borderRadius: '28px',
    padding: '30px',
    position: 'relative',
    zIndex: 10,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    marginBottom: '20px',
  },

  meaningDiffBadge: {
    position: 'absolute',
    top: '-12px',
    right: '30px',
    padding: '8px 18px',
    borderRadius: '20px',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '700',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },

  wordDisplaySection: {
    textAlign: 'center',
    marginBottom: '25px',
  },

  wordLabel: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '15px',
  },

  wordDisplay: {
    padding: '30px',
    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    borderRadius: '20px',
    border: '3px solid #4caf50',
  },

  bigWord: {
    fontSize: '48px',
    fontWeight: '900',
    color: '#2e7d32',
    textShadow: '2px 4px 8px rgba(0,0,0,0.1)',
  },

  exampleBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '18px 20px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    marginBottom: '25px',
    borderLeft: '4px solid #2196f3',
  },

  exampleIcon: {
    fontSize: '24px',
  },

  exampleText: {
    fontSize: '16px',
    color: '#1565c0',
    margin: 0,
    lineHeight: 1.6,
  },

  meaningInputSection: {
    marginBottom: '20px',
  },

  meaningInputLabel: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '12px',
  },

  meaningTextarea: {
    width: '100%',
    padding: '18px',
    fontSize: '18px',
    fontWeight: '600',
    borderRadius: '16px',
    border: '3px solid #e0e0e0',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    resize: 'none',
    transition: 'all 0.3s ease',
  },

  textareaCorrect: {
    borderColor: '#4caf50',
    background: '#e8f5e9',
  },

  textareaIncorrect: {
    borderColor: '#ff9800',
    background: '#fff3e0',
  },

  synonymHintBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    background: 'rgba(76, 175, 80, 0.1)',
    border: '2px dashed #4caf50',
    color: '#2e7d32',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '15px',
  },

  synonymBox: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    padding: '15px 20px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    marginBottom: '15px',
  },

  synonymTags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },

  synonymTag: {
    padding: '6px 14px',
    borderRadius: '20px',
    background: '#4caf50',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '700',
  },

  meaningFeedback: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    borderRadius: '16px',
    border: '2px solid',
    animation: 'slideIn 0.3s ease',
  },

  feedbackContent: {
    flex: 1,
  },

  feedbackTitle: {
    fontSize: '18px',
    fontWeight: '800',
    margin: '0 0 8px 0',
  },

  feedbackMeaning: {
    fontSize: '14px',
    color: '#555',
    margin: 0,
  },

  meaningStreakAlert: {
    padding: '8px 14px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    color: '#fff',
    fontWeight: '800',
    fontSize: '13px',
  },

  meaningActions: {
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },

  meaningSubmitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '18px 50px',
    borderRadius: '30px',
    background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 8px 30px rgba(76, 175, 80, 0.4)',
  },

  meaningNextBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '18px 50px',
    borderRadius: '30px',
    background: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 8px 30px rgba(33, 150, 243, 0.4)',
  },

  meaningHelper: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    zIndex: 100,
  },

  helperTip: {
    background: '#fff',
    padding: '12px 18px',
    borderRadius: '16px',
    borderBottomLeftRadius: '4px',
    fontSize: '14px',
    color: '#333',
    fontWeight: '600',
    maxWidth: '220px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
};
