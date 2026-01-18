import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// TYPES
// ============================================================
interface SpellWord {
  id: number;
  word: string;
  difficulty: string;
  category: string;
  hint: string;
  fillInBlank: string;
}

interface MeaningWord {
  id: number;
  word: string;
  meaning: string;
  keywords: string[];
  synonyms: string[];
  example: string;
  difficulty: string;
}

interface SpellCheckScreenProps {
  onBack: () => void;
  playerName: string;
  mascotEmoji: string;
}

interface Feedback {
  type: 'correct' | 'close' | 'incorrect' | 'partial';
  message: string;
  correctAnswer?: string;
  correctMeaning?: string;
  userAnswer?: string;
  matchedConcepts?: string[];
}

// ============================================================
// SAMPLE DATA
// ============================================================
const SAMPLE_SPELL_WORDS: SpellWord[] = [
  { id: 1, word: 'elephant', difficulty: 'easy', category: 'Animals', hint: 'Large grey animal with a long trunk', fillInBlank: 'ele____t' },
  { id: 2, word: 'beautiful', difficulty: 'medium', category: 'Adjectives', hint: 'Very pretty or attractive', fillInBlank: 'beau____ul' },
  { id: 3, word: 'butterfly', difficulty: 'easy', category: 'Animals', hint: 'Colorful insect with wings', fillInBlank: 'butt____ly' },
  { id: 4, word: 'chocolate', difficulty: 'easy', category: 'Food', hint: 'Sweet brown candy', fillInBlank: 'choc____te' },
  { id: 5, word: 'favourite', difficulty: 'medium', category: 'Adjectives', hint: 'The one you like the most', fillInBlank: 'favo____te' },
  { id: 6, word: 'knowledge', difficulty: 'hard', category: 'Nouns', hint: 'What you learn and know', fillInBlank: 'know____ge' },
  { id: 7, word: 'difficult', difficulty: 'medium', category: 'Adjectives', hint: 'Not easy to do', fillInBlank: 'diffi____t' },
  { id: 8, word: 'adventure', difficulty: 'medium', category: 'Nouns', hint: 'An exciting journey', fillInBlank: 'adven____e' },
];

const SAMPLE_MEANINGS: MeaningWord[] = [
  { id: 1, word: 'Happy', meaning: 'feeling joy or pleasure', keywords: ['joy', 'pleasure', 'good', 'smile', 'glad'], synonyms: ['joyful', 'glad', 'cheerful'], example: 'I am happy to see you!', difficulty: 'easy' },
  { id: 2, word: 'Brave', meaning: 'not afraid of danger', keywords: ['courage', 'fear', 'strong', 'bold'], synonyms: ['courageous', 'fearless', 'bold'], example: 'The brave firefighter saved the cat.', difficulty: 'easy' },
  { id: 3, word: 'Curious', meaning: 'wanting to know or learn something', keywords: ['know', 'learn', 'question', 'wonder'], synonyms: ['inquisitive', 'interested', 'eager'], example: 'The curious child asked many questions.', difficulty: 'medium' },
  { id: 4, word: 'Enormous', meaning: 'very large in size', keywords: ['big', 'large', 'huge', 'giant'], synonyms: ['huge', 'massive', 'gigantic'], example: 'The elephant was enormous!', difficulty: 'easy' },
  { id: 5, word: 'Generous', meaning: 'willing to give and share with others', keywords: ['give', 'share', 'kind', 'help'], synonyms: ['kind', 'giving', 'charitable'], example: 'She was generous with her toys.', difficulty: 'medium' },
  { id: 6, word: 'Peaceful', meaning: 'calm and quiet without worry', keywords: ['calm', 'quiet', 'relax', 'gentle'], synonyms: ['calm', 'tranquil', 'serene'], example: 'The garden was peaceful.', difficulty: 'easy' },
];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const matrix: number[][] = [];
  for (let i = 0; i <= s1.length; i++) matrix[i] = [i];
  for (let j = 0; j <= s2.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }
  return (Math.max(s1.length, s2.length) - matrix[s1.length][s2.length]) / Math.max(s1.length, s2.length);
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function SpellCheckScreen({ onBack, playerName, mascotEmoji }: SpellCheckScreenProps) {
  const [currentPage, setCurrentPage] = useState<'landing' | 'spellChallenge' | 'meaning'>('landing');
  const [spellMode, setSpellMode] = useState<'full' | 'fillIn'>('full');
  const [wordList, setWordList] = useState<(SpellWord | MeaningWord)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (currentPage === 'spellChallenge') setWordList(SAMPLE_SPELL_WORDS);
    else if (currentPage === 'meaning') setWordList(SAMPLE_MEANINGS);
    resetGame();
  }, [currentPage]);

  useEffect(() => {
    if (inputRef.current && !feedback) inputRef.current.focus();
  }, [currentIndex, feedback]);

  const resetGame = () => {
    setCurrentIndex(0);
    setUserInput('');
    setFeedback(null);
    setShowHint(false);
  };

  const speakWord = useCallback((word: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(word);
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang === 'en-IN' || v.name.toLowerCase().includes('india'));
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    utterance.voice = indianVoice || englishVoice || null;
    utterance.rate = 0.7;
    utterance.pitch = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const getCorrectMessage = () => {
    const messages = ["🎉 Awesome!", "⭐ Wonderful!", "🌟 Brilliant!", "🏆 Amazing!", "✨ Fantastic!"];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const checkSpelling = () => {
    const currentWord = wordList[currentIndex] as SpellWord;
    const userAnswer = userInput.trim().toLowerCase();
    const correctAnswer = currentWord.word.toLowerCase();
    const isExactMatch = userAnswer === correctAnswer;
    const similarity = calculateSimilarity(userAnswer, correctAnswer);
    setTotalAnswered(prev => prev + 1);

    if (isExactMatch) {
      setCorrectCount(prev => prev + 1);
      setScore(prev => prev + 10);
      setStreak(prev => { const n = prev + 1; setMaxStreak(m => Math.max(m, n)); return n; });
      setFeedback({ type: 'correct', message: getCorrectMessage(), correctAnswer: currentWord.word });
    } else if (similarity > 0.7) {
      setStreak(0);
      setFeedback({ type: 'close', message: "So close! Check your spelling.", correctAnswer: currentWord.word, userAnswer });
    } else {
      setStreak(0);
      setFeedback({ type: 'incorrect', message: "Let's learn this word!", correctAnswer: currentWord.word });
    }
  };

  const checkMeaning = () => {
    const currentWord = wordList[currentIndex] as MeaningWord;
    const userAnswer = userInput.trim().toLowerCase();
    const userWords = userAnswer.replace(/[.,!?'"]/g, '').split(/\s+/).filter(w => w.length > 2);
    const keywordMatches = currentWord.keywords.filter(kw => userAnswer.includes(kw.toLowerCase()));
    const synonymMatch = currentWord.synonyms.some(syn => userAnswer.includes(syn.toLowerCase()));
    const meaningWords = currentWord.meaning.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const meaningOverlap = meaningWords.filter(mw => userWords.some(uw => uw.includes(mw) || mw.includes(uw)));
    const keywordScore = keywordMatches.length / Math.max(currentWord.keywords.length, 1);
    const overlapScore = meaningOverlap.length / Math.max(meaningWords.length, 1);
    setTotalAnswered(prev => prev + 1);

    if (synonymMatch || keywordScore >= 0.4 || overlapScore >= 0.4) {
      setCorrectCount(prev => prev + 1);
      setScore(prev => prev + 10);
      setStreak(prev => { const n = prev + 1; setMaxStreak(m => Math.max(m, n)); return n; });
      setFeedback({ type: 'correct', message: "Excellent! You understood!", correctMeaning: currentWord.meaning, matchedConcepts: [...keywordMatches, ...meaningOverlap] });
    } else if (keywordScore >= 0.2 || overlapScore >= 0.2 || userWords.length >= 3) {
      setScore(prev => prev + 5);
      setStreak(0);
      setFeedback({ type: 'partial', message: "You're on the right track!", correctMeaning: currentWord.meaning, matchedConcepts: [...keywordMatches, ...meaningOverlap] });
    } else {
      setStreak(0);
      setFeedback({ type: 'incorrect', message: "Let's learn this word!", correctMeaning: currentWord.meaning });
    }
  };

  const nextWord = () => {
    setFeedback(null);
    setUserInput('');
    setShowHint(false);
    if (currentIndex < wordList.length - 1) setCurrentIndex(prev => prev + 1);
    else setCurrentIndex(0);
  };

  const useHint = () => setShowHint(true);

  // Landing Page
  const LandingPage = () => (
    <div style={styles.landingContainer}>
      <div style={styles.bgOverlay}>
        {[...Array(25)].map((_, i) => (
          <div key={i} style={{ ...styles.floatingElement, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 6}s`, fontSize: `${18 + Math.random() * 20}px` }}>
            {['A', 'B', 'C', '✏️', '📚', '🔤', '✨'][Math.floor(Math.random() * 7)]}
          </div>
        ))}
      </div>
      <header style={styles.landingHeader}>
        <button style={styles.backButton} onClick={onBack}><span style={styles.backIcon}>←</span></button>
        <div style={styles.titleGroup}><span style={styles.titleEmoji}>✏️</span><h1 style={styles.mainTitle}>Spell Check</h1></div>
        <div style={styles.headerStreak}><span>🔥</span><span>{maxStreak}</span></div>
      </header>
      <div style={styles.statsCard}>
        <div style={styles.statBlock}><span style={styles.statIcon}>⭐</span><span style={styles.statNumber}>{score}</span><span style={styles.statTitle}>Points</span></div>
        <div style={styles.statSeparator} />
        <div style={styles.statBlock}><span style={styles.statIcon}>✅</span><span style={styles.statNumber}>{correctCount}</span><span style={styles.statTitle}>Correct</span></div>
        <div style={styles.statSeparator} />
        <div style={styles.statBlock}><span style={styles.statIcon}>🎯</span><span style={styles.statNumber}>{totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0}%</span><span style={styles.statTitle}>Accuracy</span></div>
      </div>
      <div style={styles.welcomeSection}>
        <div style={styles.welcomeEmoji}>👋</div>
        <div style={styles.welcomeContent}><p style={styles.welcomeText}>Hey {playerName || 'Champion'}! Ready to become a <strong>Spelling Superstar</strong>? 🌟</p></div>
      </div>
      <h2 style={styles.sectionHeading}>Choose Your Challenge</h2>
      <div style={styles.activityCards}>
        <div style={styles.activityCard} onClick={() => setCurrentPage('spellChallenge')}>
          <div style={styles.cardBadge}>🎧 Audio</div>
          <div style={styles.cardIconBox}><span style={styles.cardMainIcon}>🔊</span></div>
          <h3 style={styles.cardTitle}>Spell Challenge</h3>
          <p style={styles.cardDesc}>Listen carefully and type the correct spelling!</p>
          <div style={styles.cardTags}><span style={styles.tag}>🎧 Listen</span><span style={styles.tag}>✍️ Type</span></div>
          <button style={styles.playBtn}><span>▶</span><span>Play Now</span></button>
        </div>
        <div style={{ ...styles.activityCard, borderColor: '#4caf50' }} onClick={() => setCurrentPage('meaning')}>
          <div style={{ ...styles.cardBadge, background: '#4caf50' }}>📖 Read</div>
          <div style={styles.cardIconBox}><span style={styles.cardMainIcon}>📖</span></div>
          <h3 style={styles.cardTitle}>Word Meaning</h3>
          <p style={styles.cardDesc}>Read the word and explain what it means!</p>
          <div style={styles.cardTags}><span style={{ ...styles.tag, background: 'rgba(76,175,80,0.15)', color: '#2e7d32' }}>👀 Read</span><span style={{ ...styles.tag, background: 'rgba(76,175,80,0.15)', color: '#2e7d32' }}>💭 Think</span></div>
          <button style={{ ...styles.playBtn, background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)' }}><span>▶</span><span>Play Now</span></button>
        </div>
      </div>
      <div style={styles.mascotArea}><span style={styles.mascotOwl}>{mascotEmoji}</span><div style={styles.mascotSpeech}><p>Let's learn together! 🌟</p></div></div>
    </div>
  );

  // Spell Challenge Page
  const SpellChallengePage = () => {
    const currentWord = wordList[currentIndex] as SpellWord || SAMPLE_SPELL_WORDS[0];
    return (
      <div style={styles.spellContainer}>
        <div style={styles.starryBg}>{[...Array(30)].map((_, i) => (<div key={i} style={{ ...styles.star, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 4}s`, width: `${2 + Math.random() * 4}px`, height: `${2 + Math.random() * 4}px` }} />))}</div>
        <nav style={styles.topNav}>
          <button style={styles.navBackBtn} onClick={() => setCurrentPage('landing')}><span>←</span><span>Back</span></button>
          <div style={styles.progressChip}><span>📝</span><span>{currentIndex + 1} / {wordList.length}</span></div>
          <div style={styles.scoreArea}><div style={styles.scoreBadge}><span>⭐</span><span>{score}</span></div><div style={styles.streakChip}><span>🔥</span><span>{streak}</span></div></div>
        </nav>
        <div style={styles.modeSelector}>
          <button style={{ ...styles.modeOption, ...(spellMode === 'full' ? styles.modeActive : {}) }} onClick={() => setSpellMode('full')}>✍️ Full Word</button>
          <button style={{ ...styles.modeOption, ...(spellMode === 'fillIn' ? styles.modeActive : {}) }} onClick={() => setSpellMode('fillIn')}>🔤 Fill Blanks</button>
        </div>
        <div style={styles.gameCard}>
          <div style={styles.categoryChip}><span>📂</span><span>{currentWord.category}</span></div>
          <div style={{ ...styles.difficultyChip, background: currentWord.difficulty === 'easy' ? '#4caf50' : currentWord.difficulty === 'medium' ? '#ff9800' : '#f44336' }}>{currentWord.difficulty === 'easy' ? '🌟 Easy' : currentWord.difficulty === 'medium' ? '⭐ Medium' : '💪 Hard'}</div>
          <div style={styles.speakerSection}>
            <button style={{ ...styles.speakerBtn, ...(isSpeaking ? styles.speakerActive : {}) }} onClick={() => speakWord(currentWord.word)} disabled={isSpeaking}><span style={styles.speakerEmoji}>{isSpeaking ? '🔊' : '🔈'}</span></button>
            <p style={styles.speakerHint}>{isSpeaking ? '🎵 Speaking...' : '👆 Tap to hear the word'}</p>
          </div>
          {spellMode === 'fillIn' && <div style={styles.fillInBox}><span style={styles.fillInPattern}>{currentWord.fillInBlank}</span><p style={styles.fillInHint}>Fill in the missing letters</p></div>}
          <div style={styles.inputSection}>
            <label style={styles.inputLabel}>{spellMode === 'full' ? '✍️ Type the word you heard:' : '✍️ Complete the word:'}</label>
            <div style={styles.inputWrapper}>
              <input ref={inputRef as React.RefObject<HTMLInputElement>} type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !feedback && userInput.trim() && checkSpelling()} placeholder={spellMode === 'full' ? 'Type here...' : 'Type the full word...'} disabled={!!feedback} style={{ ...styles.textInput, ...(feedback?.type === 'correct' ? styles.inputCorrect : {}), ...(feedback?.type === 'incorrect' || feedback?.type === 'close' ? styles.inputWrong : {}) }} />
              {feedback && <span style={styles.inputIcon}>{feedback.type === 'correct' ? '✅' : feedback.type === 'close' ? '🤏' : '❌'}</span>}
            </div>
          </div>
          {!showHint && !feedback && <button style={styles.hintBtn} onClick={useHint}><span>💡</span><span>Need a Hint?</span></button>}
          {showHint && !feedback && <div style={styles.hintBox}><span style={styles.hintIcon}>💡</span><p style={styles.hintText}>{currentWord.hint}</p></div>}
          {feedback && <div style={{ ...styles.feedbackBox, background: feedback.type === 'correct' ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' : feedback.type === 'close' ? 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)' : 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)', borderColor: feedback.type === 'correct' ? '#4caf50' : feedback.type === 'close' ? '#ff9800' : '#f44336' }}><span style={styles.feedbackEmoji}>{feedback.type === 'correct' ? '🎉' : feedback.type === 'close' ? '🤔' : '💪'}</span><div style={styles.feedbackContent}><p style={{ ...styles.feedbackMsg, color: feedback.type === 'correct' ? '#2e7d32' : feedback.type === 'close' ? '#e65100' : '#c62828' }}>{feedback.message}</p>{(feedback.type === 'incorrect' || feedback.type === 'close') && <p style={styles.correctSpelling}>Correct spelling: <strong>{feedback.correctAnswer}</strong></p>}</div>{streak >= 3 && feedback.type === 'correct' && <div style={styles.streakAlert}><span>🔥</span><span>{streak} in a row!</span></div>}</div>}
        </div>
        <div style={styles.bottomBar}>
          <div style={styles.leftActions}><button style={styles.repeatBtn} onClick={() => speakWord(currentWord.word)} disabled={isSpeaking}><span>🔄</span><span>Repeat</span></button></div>
          {!feedback ? <button style={{ ...styles.submitBtn, opacity: userInput.trim() ? 1 : 0.5 }} onClick={checkSpelling} disabled={!userInput.trim()}><span>Check Answer</span><span>✓</span></button> : <button style={styles.nextBtn} onClick={nextWord}><span>Next Word</span><span>→</span></button>}
        </div>
        <div style={styles.mascotHelper}><span style={styles.helperOwl}>{mascotEmoji}</span><div style={styles.helperBubble}>{!feedback ? "Listen carefully! 🎧" : feedback.type === 'correct' ? "Amazing! ⭐" : "Keep trying! 💪"}</div></div>
      </div>
    );
  };

  // Word Meaning Page  
  const WordMeaningPage = () => {
    const currentWord = wordList[currentIndex] as MeaningWord || SAMPLE_MEANINGS[0];
    return (
      <div style={styles.meaningContainer}>
        <div style={styles.natureBg}>{[...Array(15)].map((_, i) => (<div key={i} style={{ ...styles.floatingBook, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 7}s` }}>{['📚', '📖', '📕', '✨', '💫'][Math.floor(Math.random() * 5)]}</div>))}</div>
        <nav style={styles.meaningTopNav}>
          <button style={styles.meaningBackBtn} onClick={() => setCurrentPage('landing')}><span>←</span><span>Back</span></button>
          <div style={styles.meaningProgress}><span>📖</span><span>{currentIndex + 1} / {wordList.length}</span></div>
          <div style={styles.scoreArea}><div style={styles.meaningScoreBadge}><span>⭐</span><span>{score}</span></div><div style={styles.meaningStreakBadge}><span>🔥</span><span>{streak}</span></div></div>
        </nav>
        <div style={styles.meaningCard}>
          <div style={{ ...styles.meaningDiffBadge, background: currentWord.difficulty === 'easy' ? '#4caf50' : currentWord.difficulty === 'medium' ? '#ff9800' : '#f44336' }}>{currentWord.difficulty === 'easy' ? '🌟 Easy' : currentWord.difficulty === 'medium' ? '⭐ Medium' : '💪 Hard'}</div>
          <div style={styles.wordSection}><p style={styles.wordPrompt}>What does this word mean?</p><div style={styles.wordBox}><span style={styles.bigWord}>{currentWord.word}</span></div></div>
          <div style={styles.exampleSection}><span style={styles.exampleIcon}>💬</span><p style={styles.exampleText}><strong>Example:</strong> {currentWord.example}</p></div>
          <div style={styles.meaningInputSection}>
            <label style={styles.meaningInputLabel}>💭 Write the meaning in your own words:</label>
            <textarea ref={inputRef as React.RefObject<HTMLTextAreaElement>} value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="What do you think this word means?" disabled={!!feedback} rows={3} style={{ ...styles.meaningTextarea, ...(feedback?.type === 'correct' ? styles.textareaCorrect : {}), ...(feedback?.type === 'partial' ? styles.textareaPartial : {}), ...(feedback?.type === 'incorrect' ? styles.textareaWrong : {}) }} />
          </div>
          {!showHint && !feedback && <button style={styles.synonymBtn} onClick={useHint}><span>💡</span><span>Show Similar Words</span></button>}
          {showHint && !feedback && <div style={styles.synonymBox}><span style={styles.synonymLabel}>💡 Similar words:</span><div style={styles.synonymTags}>{currentWord.synonyms.map((syn, i) => (<span key={i} style={styles.synonymTag}>{syn}</span>))}</div></div>}
          {feedback && <div style={{ ...styles.meaningFeedback, background: feedback.type === 'correct' ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' : feedback.type === 'partial' ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' : 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', borderColor: feedback.type === 'correct' ? '#4caf50' : feedback.type === 'partial' ? '#2196f3' : '#ff9800' }}><span style={styles.meaningFeedbackEmoji}>{feedback.type === 'correct' ? '🎉' : feedback.type === 'partial' ? '👍' : '💪'}</span><div style={styles.meaningFeedbackContent}><p style={{ ...styles.meaningFeedbackTitle, color: feedback.type === 'correct' ? '#2e7d32' : feedback.type === 'partial' ? '#1565c0' : '#e65100' }}>{feedback.message}</p><p style={styles.correctMeaning}><strong>Meaning:</strong> {feedback.correctMeaning}</p>{feedback.matchedConcepts && feedback.matchedConcepts.length > 0 && <p style={styles.matchedNote}>✓ You mentioned: {feedback.matchedConcepts.slice(0, 3).join(', ')}</p>}</div>{streak >= 3 && feedback.type === 'correct' && <div style={styles.meaningStreakAlert}>🔥 {streak} streak!</div>}</div>}
        </div>
        <div style={styles.meaningBottomBar}>
          {!feedback ? <button style={{ ...styles.meaningSubmitBtn, opacity: userInput.trim() ? 1 : 0.5 }} onClick={checkMeaning} disabled={!userInput.trim()}><span>Check Answer</span><span>✓</span></button> : <button style={styles.meaningNextBtn} onClick={nextWord}><span>Next Word</span><span>→</span></button>}
        </div>
        <div style={styles.meaningMascotArea}><span style={styles.meaningOwl}>{mascotEmoji}</span><div style={styles.meaningOwlBubble}>{!feedback ? "Just explain it! 📝" : feedback.type === 'correct' ? "Brilliant! 🌟" : "Great effort! 🚀"}</div></div>
      </div>
    );
  };

  return (
    <div style={styles.appRoot}>
      <style>{keyframes}</style>
      {currentPage === 'landing' && <LandingPage />}
      {currentPage === 'spellChallenge' && <SpellChallengePage />}
      {currentPage === 'meaning' && <WordMeaningPage />}
    </div>
  );
}

const keyframes = `
  @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(8deg); } }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
  @keyframes twinkle { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
  @keyframes ripple { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(2.5); opacity: 0; } }
  @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
  @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes glow { 0%, 100% { box-shadow: 0 0 30px rgba(171, 71, 188, 0.4); } 50% { box-shadow: 0 0 50px rgba(171, 71, 188, 0.7); } }
  @keyframes wave { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.8); } }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-8px); } 80% { transform: translateX(8px); } }
  @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
`;

const styles: Record<string, React.CSSProperties> = {
  appRoot: { fontFamily: "'Nunito', sans-serif", minHeight: '100vh', overflow: 'hidden' },
  // Landing
  landingContainer: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', minHeight: '100vh', padding: '20px', position: 'relative', overflow: 'hidden' },
  bgOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' },
  floatingElement: { position: 'absolute', color: 'rgba(255,255,255,0.12)', fontWeight: 800, animation: 'float 10s ease-in-out infinite' },
  landingHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', zIndex: 10 },
  backButton: { width: '50px', height: '50px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: '24px', color: '#fff', fontWeight: 700 },
  titleGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  titleEmoji: { fontSize: '38px', animation: 'bounce 2s ease-in-out infinite' },
  mainTitle: { fontSize: '34px', fontWeight: 900, color: '#fff', margin: 0, textShadow: '2px 4px 10px rgba(0,0,0,0.2)' },
  headerStreak: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '30px', background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: '#fff', fontWeight: 800, fontSize: '18px', boxShadow: '0 4px 20px rgba(255,107,53,0.4)' },
  statsCard: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', padding: '22px 35px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', borderRadius: '22px', marginBottom: '22px', border: '1px solid rgba(255,255,255,0.25)', position: 'relative', zIndex: 10 },
  statBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  statIcon: { fontSize: '32px' },
  statNumber: { fontSize: '26px', fontWeight: 900, color: '#fff' },
  statTitle: { fontSize: '12px', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 },
  statSeparator: { width: '2px', height: '50px', background: 'rgba(255,255,255,0.25)', borderRadius: '1px' },
  welcomeSection: { display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 24px', background: 'rgba(255,255,255,0.95)', borderRadius: '18px', marginBottom: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10 },
  welcomeEmoji: { fontSize: '42px', animation: 'bounce 1.5s ease-in-out infinite' },
  welcomeContent: { flex: 1 },
  welcomeText: { fontSize: '17px', color: '#333', margin: 0, lineHeight: 1.5 },
  sectionHeading: { fontSize: '24px', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: '22px', textShadow: '1px 3px 6px rgba(0,0,0,0.2)', position: 'relative', zIndex: 10 },
  activityCards: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px', marginBottom: '30px', position: 'relative', zIndex: 10 },
  activityCard: { background: '#fff', borderRadius: '26px', padding: '28px 24px', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden', boxShadow: '0 12px 45px rgba(0,0,0,0.15)', border: '3px solid #ab47bc' },
  cardBadge: { position: 'absolute', top: '16px', right: '16px', padding: '6px 14px', borderRadius: '20px', background: '#ab47bc', color: '#fff', fontSize: '12px', fontWeight: 700 },
  cardIconBox: { position: 'relative', width: '90px', height: '90px', margin: '10px auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardMainIcon: { fontSize: '55px', position: 'relative', zIndex: 2 },
  cardTitle: { fontSize: '22px', fontWeight: 800, color: '#333', textAlign: 'center', margin: '0 0 10px 0' },
  cardDesc: { fontSize: '14px', color: '#666', textAlign: 'center', margin: '0 0 16px 0', lineHeight: 1.5 },
  cardTags: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '14px' },
  tag: { padding: '6px 14px', borderRadius: '20px', background: 'rgba(171,71,188,0.12)', color: '#ab47bc', fontSize: '12px', fontWeight: 700 },
  playBtn: { width: '100%', padding: '15px', borderRadius: '16px', background: 'linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%)', border: 'none', color: '#fff', fontSize: '17px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 25px rgba(171,71,188,0.4)', transition: 'all 0.3s ease' },
  mascotArea: { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '16px', position: 'relative', zIndex: 10 },
  mascotOwl: { fontSize: '75px', animation: 'bounce 2.5s ease-in-out infinite' },
  mascotSpeech: { background: '#fff', padding: '16px 22px', borderRadius: '22px', borderBottomLeftRadius: '6px', boxShadow: '0 6px 25px rgba(0,0,0,0.12)', maxWidth: '280px' },
  // Spell Challenge
  spellContainer: { background: 'linear-gradient(135deg, #1a1a3e 0%, #2d2d5a 50%, #4a1a6e 100%)', minHeight: '100vh', padding: '20px', position: 'relative', overflow: 'hidden' },
  starryBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' },
  star: { position: 'absolute', borderRadius: '50%', background: '#fff', animation: 'twinkle 3s ease-in-out infinite' },
  topNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', position: 'relative', zIndex: 10 },
  navBackBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer' },
  progressChip: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '30px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: '#fff', fontWeight: 700, fontSize: '15px' },
  scoreArea: { display: 'flex', gap: '12px' },
  scoreBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 18px', borderRadius: '16px', background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)', color: '#333', fontWeight: 800, fontSize: '16px', boxShadow: '0 4px 15px rgba(255,215,0,0.4)' },
  streakChip: { display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 18px', borderRadius: '16px', background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: '#fff', fontWeight: 800, fontSize: '16px', boxShadow: '0 4px 15px rgba(255,107,53,0.4)' },
  modeSelector: { display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px', position: 'relative', zIndex: 10 },
  modeOption: { padding: '12px 28px', borderRadius: '30px', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s ease' },
  modeActive: { background: 'linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%)', borderColor: '#ab47bc', color: '#fff', boxShadow: '0 6px 25px rgba(171,71,188,0.5)' },
  gameCard: { background: '#fff', borderRadius: '30px', padding: '32px 28px', position: 'relative', zIndex: 10, boxShadow: '0 25px 70px rgba(0,0,0,0.35)', marginBottom: '20px' },
  categoryChip: { position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '25px', background: 'linear-gradient(135deg, #4dd0e1 0%, #26c6da 100%)', color: '#fff', fontSize: '14px', fontWeight: 700, boxShadow: '0 6px 20px rgba(77,208,225,0.4)' },
  difficultyChip: { position: 'absolute', top: '20px', right: '20px', padding: '8px 16px', borderRadius: '20px', color: '#fff', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
  speakerSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', marginBottom: '28px' },
  speakerBtn: { width: '130px', height: '130px', borderRadius: '50%', background: 'linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%)', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 45px rgba(171,71,188,0.5)', transition: 'all 0.3s ease', animation: 'glow 2.5s ease-in-out infinite' },
  speakerActive: { transform: 'scale(1.08)', animation: 'pulse 0.5s ease-in-out infinite' },
  speakerEmoji: { fontSize: '55px', position: 'relative', zIndex: 2 },
  speakerHint: { marginTop: '16px', fontSize: '16px', color: '#666', fontWeight: 600 },
  fillInBox: { textAlign: 'center', marginBottom: '24px', padding: '20px', background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', borderRadius: '18px' },
  fillInPattern: { fontSize: '42px', fontWeight: 900, color: '#7b1fa2', letterSpacing: '6px', fontFamily: 'monospace' },
  fillInHint: { marginTop: '10px', fontSize: '14px', color: '#9c27b0', fontWeight: 600 },
  inputSection: { marginBottom: '22px' },
  inputLabel: { display: 'block', fontSize: '17px', fontWeight: 700, color: '#333', marginBottom: '14px' },
  inputWrapper: { position: 'relative' },
  textInput: { width: '100%', padding: '20px 26px', fontSize: '24px', fontWeight: 700, borderRadius: '18px', border: '3px solid #e0e0e0', outline: 'none', textAlign: 'center', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'all 0.3s ease' },
  inputCorrect: { borderColor: '#4caf50', background: '#e8f5e9' },
  inputWrong: { borderColor: '#f44336', background: '#ffebee', animation: 'shake 0.5s ease' },
  inputIcon: { position: 'absolute', right: '22px', top: '50%', transform: 'translateY(-50%)', fontSize: '32px' },
  hintBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '14px', borderRadius: '14px', background: 'rgba(255,193,7,0.12)', border: '2px dashed #ffc107', color: '#f57c00', fontSize: '16px', fontWeight: 700, cursor: 'pointer', marginBottom: '18px' },
  hintBox: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '18px 22px', borderRadius: '16px', background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)', borderLeft: '5px solid #ffc107', marginBottom: '18px', animation: 'slideUp 0.3s ease' },
  hintIcon: { fontSize: '26px' },
  hintText: { fontSize: '16px', color: '#e65100', margin: 0, fontWeight: 600, lineHeight: 1.5 },
  feedbackBox: { display: 'flex', alignItems: 'center', gap: '18px', padding: '22px', borderRadius: '18px', border: '3px solid', animation: 'popIn 0.4s ease' },
  feedbackEmoji: { fontSize: '48px', flexShrink: 0 },
  feedbackContent: { flex: 1 },
  feedbackMsg: { fontSize: '18px', fontWeight: 800, margin: '0 0 8px 0' },
  correctSpelling: { fontSize: '15px', color: '#555', margin: 0 },
  streakAlert: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '25px', background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: '#fff', fontWeight: 800, fontSize: '15px', animation: 'popIn 0.5s ease 0.2s both' },
  bottomBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10, padding: '16px 24px', background: 'rgba(26,26,62,0.95)', backdropFilter: 'blur(20px)', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.1)' },
  leftActions: { display: 'flex', gap: '12px' },
  repeatBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 22px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer' },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px 45px', borderRadius: '30px', background: 'linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%)', border: 'none', color: '#fff', fontSize: '18px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 30px rgba(171,71,188,0.5)', transition: 'all 0.3s ease' },
  nextBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px 45px', borderRadius: '30px', background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', border: 'none', color: '#fff', fontSize: '18px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 30px rgba(76,175,80,0.5)' },
  mascotHelper: { position: 'fixed', bottom: '100px', left: '20px', display: 'flex', alignItems: 'flex-end', gap: '12px', zIndex: 100 },
  helperOwl: { fontSize: '55px', animation: 'bounce 2.5s ease-in-out infinite' },
  helperBubble: { background: '#fff', padding: '14px 20px', borderRadius: '18px', borderBottomLeftRadius: '5px', fontSize: '14px', color: '#333', fontWeight: 600, maxWidth: '200px', boxShadow: '0 5px 20px rgba(0,0,0,0.15)' },
  // Word Meaning
  meaningContainer: { background: 'linear-gradient(135deg, #134e5e 0%, #71b280 50%, #2d5016 100%)', minHeight: '100vh', padding: '20px', position: 'relative', overflow: 'hidden' },
  natureBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' },
  floatingBook: { position: 'absolute', fontSize: '30px', opacity: 0.2, animation: 'float 12s ease-in-out infinite' },
  meaningTopNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', zIndex: 10 },
  meaningBackBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer' },
  meaningProgress: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '30px', background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700 },
  meaningScoreBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 18px', borderRadius: '16px', background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)', color: '#333', fontWeight: 800 },
  meaningStreakBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 18px', borderRadius: '16px', background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: '#fff', fontWeight: 800 },
  meaningCard: { background: '#fff', borderRadius: '30px', padding: '32px 28px', position: 'relative', zIndex: 10, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', marginBottom: '20px' },
  meaningDiffBadge: { position: 'absolute', top: '20px', right: '20px', padding: '10px 18px', borderRadius: '22px', color: '#fff', fontSize: '14px', fontWeight: 700, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
  wordSection: { textAlign: 'center', marginBottom: '28px' },
  wordPrompt: { fontSize: '17px', color: '#666', marginBottom: '18px', fontWeight: 600 },
  wordBox: { padding: '35px 40px', background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', borderRadius: '22px', border: '4px solid #4caf50', boxShadow: 'inset 0 4px 15px rgba(76,175,80,0.2)' },
  bigWord: { fontSize: '52px', fontWeight: 900, color: '#2e7d32', textShadow: '2px 4px 8px rgba(0,0,0,0.1)', letterSpacing: '2px' },
  exampleSection: { display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '20px 22px', borderRadius: '18px', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', marginBottom: '26px', borderLeft: '5px solid #2196f3' },
  exampleIcon: { fontSize: '28px', flexShrink: 0 },
  exampleText: { fontSize: '16px', color: '#1565c0', margin: 0, lineHeight: 1.6 },
  meaningInputSection: { marginBottom: '22px' },
  meaningInputLabel: { display: 'block', fontSize: '17px', fontWeight: 700, color: '#333', marginBottom: '14px' },
  meaningTextarea: { width: '100%', padding: '20px', fontSize: '18px', fontWeight: 600, borderRadius: '18px', border: '3px solid #e0e0e0', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'none', transition: 'all 0.3s ease', lineHeight: 1.6 },
  textareaCorrect: { borderColor: '#4caf50', background: '#e8f5e9' },
  textareaPartial: { borderColor: '#2196f3', background: '#e3f2fd' },
  textareaWrong: { borderColor: '#ff9800', background: '#fff3e0' },
  synonymBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '14px', borderRadius: '14px', background: 'rgba(76,175,80,0.1)', border: '2px dashed #4caf50', color: '#2e7d32', fontSize: '16px', fontWeight: 700, cursor: 'pointer', marginBottom: '18px' },
  synonymBox: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '18px 22px', borderRadius: '16px', background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', marginBottom: '18px', animation: 'slideUp 0.3s ease' },
  synonymLabel: { fontSize: '15px', fontWeight: 700, color: '#2e7d32' },
  synonymTags: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  synonymTag: { padding: '8px 16px', borderRadius: '22px', background: '#4caf50', color: '#fff', fontSize: '14px', fontWeight: 700, boxShadow: '0 3px 10px rgba(76,175,80,0.3)' },
  meaningFeedback: { display: 'flex', alignItems: 'flex-start', gap: '18px', padding: '22px', borderRadius: '18px', border: '3px solid', animation: 'popIn 0.4s ease' },
  meaningFeedbackEmoji: { fontSize: '48px', flexShrink: 0 },
  meaningFeedbackContent: { flex: 1 },
  meaningFeedbackTitle: { fontSize: '20px', fontWeight: 800, margin: '0 0 10px 0' },
  correctMeaning: { fontSize: '15px', color: '#555', margin: '0 0 8px 0', lineHeight: 1.5 },
  matchedNote: { fontSize: '13px', color: '#4caf50', margin: 0, fontWeight: 600 },
  meaningStreakAlert: { padding: '10px 18px', borderRadius: '25px', background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: '#fff', fontWeight: 800, fontSize: '14px', alignSelf: 'flex-start' },
  meaningBottomBar: { display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 10 },
  meaningSubmitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '18px 55px', borderRadius: '35px', background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', border: 'none', color: '#fff', fontSize: '19px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 35px rgba(76,175,80,0.5)', transition: 'all 0.3s ease' },
  meaningNextBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '18px 55px', borderRadius: '35px', background: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)', border: 'none', color: '#fff', fontSize: '19px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 35px rgba(33,150,243,0.5)' },
  meaningMascotArea: { position: 'fixed', bottom: '100px', left: '20px', display: 'flex', alignItems: 'flex-end', gap: '14px', zIndex: 100 },
  meaningOwl: { fontSize: '55px', animation: 'bounce 2.5s ease-in-out infinite' },
  meaningOwlBubble: { background: '#fff', padding: '14px 20px', borderRadius: '18px', borderBottomLeftRadius: '5px', fontSize: '14px', color: '#333', fontWeight: 600, maxWidth: '220px', boxShadow: '0 5px 20px rgba(0,0,0,0.15)' },
};
