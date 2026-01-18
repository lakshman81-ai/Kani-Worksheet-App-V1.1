import React, { useState, useEffect } from 'react';

// Main App Component
export default function SuperQuizUI() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [playerName, setPlayerName] = useState('');
  const [selectedMascot, setSelectedMascot] = useState('unicorn');
  const [interfaceStyle, setInterfaceStyle] = useState('kid');
  const [randomize, setRandomize] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [xp, setXp] = useState(45);
  const [timeLeft, setTimeLeft] = useState(150);
  const [hoveredMascot, setHoveredMascot] = useState(null);

  const mascots = [
    { id: 'unicorn', emoji: '🦄', name: 'Sparkle', color: '#e91e63', bgGradient: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)' },
    { id: 'panda', emoji: '🐼', name: 'Bamboo', color: '#4caf50', bgGradient: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' },
    { id: 'rocket', emoji: '🚀', name: 'Blaze', color: '#ff5722', bgGradient: 'linear-gradient(135deg, #fbe9e7 0%, #ffccbc 100%)' },
    { id: 'tiger', emoji: '🐯', name: 'Stripe', color: '#ff9800', bgGradient: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)' },
    { id: 'koala', emoji: '🐨', name: 'Cuddles', color: '#607d8b', bgGradient: 'linear-gradient(135deg, #eceff1 0%, #cfd8dc 100%)' },
  ];

  const topics = [
    { id: 'space', name: 'Space', icon: '🚀', color: '#4dd0e1', difficulty: 'Easy', solved: 3, total: 10 },
    { id: 'geography', name: 'Geography', icon: '🌍', color: '#66bb6a', difficulty: 'Medium', solved: 0, total: 8 },
    { id: 'math', name: 'Math', icon: '🔢', color: '#ffa726', difficulty: 'Hard', solved: 5, total: 12 },
    { id: 'spell', name: 'Spell Check', icon: '✏️', color: '#ab47bc', difficulty: 'Medium', solved: 2, total: 7 },
  ];

  const answers = [
    { id: 'A', text: 'Captain Star' },
    { id: 'B', text: 'Emma' },
    { id: 'C', text: 'Jake' },
    { id: 'D', text: 'Columbus' },
  ];

  const progressSegments = [
    { status: 'correct' },
    { status: 'correct' },
    { status: 'wrong' },
    { status: 'correct' },
    { status: 'current' },
    { status: 'pending' },
    { status: 'pending' },
    { status: 'pending' },
    { status: 'pending' },
    { status: 'pending' },
  ];

  useEffect(() => {
    if (currentScreen === 'question' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [currentScreen, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentMascot = mascots.find(m => m.id === selectedMascot);

  // ==================== MODERN LOGIN SCREEN ====================
  const LoginScreen = () => (
    <div style={styles.loginContainer}>
      {/* Animated space background */}
      <div style={styles.spaceBackground}>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.star,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
            }}
          />
        ))}
        {/* Floating emojis */}
        {['⭐', '🌟', '✨', '🎯', '📚', '🏆', '💫', '🎨'].map((emoji, i) => (
          <div
            key={`emoji-${i}`}
            style={{
              ...styles.floatingEmoji,
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Glowing orbs */}
      <div style={styles.glowOrb1} />
      <div style={styles.glowOrb2} />
      <div style={styles.glowOrb3} />

      {/* Main content */}
      <div style={styles.loginContent}>
        {/* Logo section */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>🎮</div>
          <h1 style={styles.logoTitle}>Super Quiz!</h1>
          <p style={styles.logoTagline}>Learn. Play. Conquer.</p>
        </div>

        {/* Glass card */}
        <div style={styles.glassCard}>
          {/* Mascot showcase */}
          <div style={styles.mascotShowcase}>
            <div style={styles.mascotSpotlight}>
              <div style={styles.spotlightRing} />
              <div style={styles.spotlightRing2} />
              <span style={styles.bigMascot}>{currentMascot?.emoji}</span>
            </div>
            <div style={styles.mascotInfo}>
              <span style={styles.mascotLabel}>Your Buddy</span>
              <span style={styles.mascotNameBig}>{currentMascot?.name}</span>
            </div>
          </div>

          {/* Name input */}
          <div style={styles.inputGroup}>
            <label style={styles.modernLabel}>
              <span style={styles.labelIcon}>👤</span>
              What's your name, champion?
            </label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Enter your name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                style={styles.modernInput}
              />
              <div style={styles.inputGlow} />
            </div>
          </div>

          {/* Mascot selection */}
          <div style={styles.mascotSelection}>
            <label style={styles.modernLabel}>
              <span style={styles.labelIcon}>🎭</span>
              Choose your buddy
            </label>
            <div style={styles.mascotCarousel}>
              {mascots.map((mascot) => (
                <div
                  key={mascot.id}
                  style={{
                    ...styles.mascotCard,
                    ...(selectedMascot === mascot.id ? {
                      ...styles.mascotCardSelected,
                      background: mascot.bgGradient,
                      borderColor: mascot.color,
                      boxShadow: `0 8px 32px ${mascot.color}40`,
                    } : {}),
                    ...(hoveredMascot === mascot.id && selectedMascot !== mascot.id ? {
                      transform: 'translateY(-8px) scale(1.05)',
                      borderColor: mascot.color + '80',
                    } : {}),
                  }}
                  onClick={() => setSelectedMascot(mascot.id)}
                  onMouseEnter={() => setHoveredMascot(mascot.id)}
                  onMouseLeave={() => setHoveredMascot(null)}
                >
                  <span style={styles.mascotCardEmoji}>{mascot.emoji}</span>
                  <span style={{
                    ...styles.mascotCardName,
                    color: selectedMascot === mascot.id ? mascot.color : '#64748b',
                  }}>{mascot.name}</span>
                  {selectedMascot === mascot.id && (
                    <div style={{...styles.selectedCheck, backgroundColor: mascot.color}}>✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Settings row */}
          <div style={styles.settingsSection}>
            <div style={styles.settingChip} onClick={() => setInterfaceStyle(interfaceStyle === 'kid' ? 'minimal' : 'kid')}>
              <span>{interfaceStyle === 'kid' ? '🎨' : '✨'}</span>
              <span>{interfaceStyle === 'kid' ? 'Kid Mode' : 'Minimal'}</span>
            </div>
            <div 
              style={{
                ...styles.settingChip,
                ...(randomize ? styles.settingChipActive : {}),
              }} 
              onClick={() => setRandomize(!randomize)}
            >
              <span>🔀</span>
              <span>Shuffle</span>
            </div>
            <div style={styles.settingChip}>
              <span>⚙️</span>
              <span>Settings</span>
            </div>
          </div>
        </div>

        {/* Start button */}
        <button
          style={{
            ...styles.startButton,
            opacity: playerName.trim() ? 1 : 0.6,
            transform: playerName.trim() ? 'scale(1)' : 'scale(0.95)',
          }}
          onClick={() => playerName.trim() && setCurrentScreen('landing')}
        >
          <div style={styles.buttonShine} />
          <span style={styles.buttonIcon}>🚀</span>
          <span style={styles.buttonText}>Start Adventure</span>
          <span style={styles.buttonArrow}>→</span>
        </button>

        {/* Stats preview */}
        <div style={styles.statsPreview}>
          <div style={styles.statBox}>
            <span style={styles.statIcon}>🏆</span>
            <span style={styles.statValue}>0</span>
            <span style={styles.statLabel}>Quizzes</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statBox}>
            <span style={styles.statIcon}>⭐</span>
            <span style={styles.statValue}>0</span>
            <span style={styles.statLabel}>XP</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statBox}>
            <span style={styles.statIcon}>🔥</span>
            <span style={styles.statValue}>0</span>
            <span style={styles.statLabel}>Streak</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== LANDING SCREEN ====================
  const LandingScreen = () => (
    <div style={styles.landingContainer}>
      <div style={styles.particlesContainer}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
            }}
          />
        ))}
      </div>

      <div style={styles.landingHeader}>
        <button style={styles.backButton} onClick={() => setCurrentScreen('login')}>
          <span style={styles.backArrow}>←</span>
        </button>
        <h1 style={styles.mainTitle}>Super Quiz!</h1>
        <button style={styles.profileButton}>
          <span>{currentMascot?.emoji}</span>
        </button>
      </div>

      <div style={styles.statsBanner}>
        <div style={styles.statsLeft}>
          <span style={styles.statsIconLanding}>🎯</span>
          <div style={styles.statsContent}>
            <span style={styles.statsNumber}>85%</span>
            <span style={styles.statsLabel}>Best Score</span>
          </div>
        </div>
        <div style={styles.statsDivider} />
        <div style={styles.statsRight}>
          <span style={styles.statsIconLanding}>📋</span>
          <div style={styles.statsContent}>
            <span style={styles.statsNumber}>12</span>
            <span style={styles.statsLabel}>Quizzes Available</span>
          </div>
        </div>
        <div style={styles.streakBadge}>
          <span>🔥 5 day streak!</span>
        </div>
      </div>

      <div style={styles.welcomeMessage}>
        <span>Welcome back, <strong>{playerName || 'Student'}</strong>! Ready to learn?</span>
      </div>

      <h2 style={styles.sectionTitle}>Select a topic and start learning</h2>

      <div style={styles.topicsGrid}>
        {topics.map((topic, index) => (
          <div
            key={topic.id}
            style={{
              ...styles.topicCard,
              borderLeftColor: topic.color,
              animationDelay: `${index * 0.1}s`,
            }}
            onClick={() => {
              setSelectedTopic(topic);
              setCurrentScreen('question');
            }}
          >
            <div style={styles.topicHeader}>
              <span style={styles.topicIcon}>{topic.icon}</span>
              <button style={styles.infoButton}>ⓘ</button>
            </div>
            <h3 style={styles.topicName}>{topic.name}</h3>
            <div style={{
              ...styles.difficultyBadge,
              backgroundColor: topic.color + '20',
              color: topic.color,
            }}>
              {topic.difficulty}
            </div>
            <div style={styles.topicProgress}>
              <span>Solved: {topic.solved}</span>
              <span>Open: {topic.total - topic.solved}</span>
            </div>
            {topic.solved > 0 && (
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${(topic.solved / topic.total) * 100}%`,
                    backgroundColor: topic.color,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={styles.mascotContainer}>
        <span style={styles.mascotFloat}>{currentMascot?.emoji}</span>
        <div style={styles.speechBubble}>Pick a topic, {playerName || 'friend'}!</div>
      </div>
    </div>
  );

  // ==================== QUESTION SCREEN ====================
  const QuestionScreen = () => (
    <div style={styles.questionContainer}>
      {/* Animated stars background */}
      <div style={styles.particlesContainer}>
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.starParticle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.3 + Math.random() * 0.5,
            }}
          />
        ))}
      </div>

      {/* Top Navigation Bar */}
      <div style={styles.topNav}>
        <div style={{
          ...styles.topicBadge,
          background: selectedTopic ? `linear-gradient(135deg, ${selectedTopic.color} 0%, ${selectedTopic.color}cc 100%)` : styles.topicBadge.background,
        }}>
          <span style={styles.badgeIcon}>{selectedTopic?.icon || '🚀'}</span>
          <span>{selectedTopic?.name?.toUpperCase() || 'SPACE'} QUIZ</span>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressSegments}>
          {progressSegments.map((seg, i) => (
            <div
              key={i}
              style={{
                ...styles.segment,
                backgroundColor:
                  seg.status === 'correct' ? '#4caf50' :
                  seg.status === 'wrong' ? '#ef5350' :
                  seg.status === 'current' ? '#ffd700' : '#3a3a6e',
                boxShadow: seg.status === 'current' ? '0 0 10px #ffd700' : 'none',
              }}
            />
          ))}
        </div>

        <div style={styles.navRight}>
          <div style={styles.xpBadge}>
            <span>⭐</span>
            <span>XP {xp}</span>
          </div>
          <div style={styles.timerBadge}>
            <span>❤️</span>
            <span>{formatTime(timeLeft)}</span>
          </div>
          <button style={styles.navIcon}>🔊</button>
          <button style={styles.navIcon}>⚙️</button>
          <button style={{...styles.navIcon, ...styles.closeButton}} onClick={() => setCurrentScreen('landing')}>✕</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.questionContent}>
        {/* Question Panel */}
        <div style={styles.questionPanel}>
          <div style={styles.questionHeader}>
            <span style={styles.questionNumber}>5/10</span>
            <span style={styles.questionCategory}>{selectedTopic?.name || 'Space'}</span>
            <button style={styles.zoomButton}>🔍 Zoom</button>
          </div>

          <div style={styles.questionText}>
            {selectedTopic?.id === 'spell' 
              ? 'Which word is spelled correctly?'
              : 'Who took Lily and Max on their space trip?'
            }
          </div>

          <div style={styles.questionNote}>
            <strong>NOTE:</strong> <em>
              {selectedTopic?.id === 'spell'
                ? 'Look carefully at each spelling before choosing.'
                : 'Read the story carefully before answering.'
              }
            </em>
          </div>

          <div style={styles.questionImage}>
            <div style={styles.imagePlaceholder}>
              <span style={styles.rocketImage}>{selectedTopic?.icon || '🚀'}</span>
              <span style={styles.starsDecor}>✨ 🌟 ⭐</span>
            </div>
          </div>
        </div>

        {/* Answers Panel */}
        <div style={styles.answersPanel}>
          {(selectedTopic?.id === 'spell' 
            ? [
                { id: 'A', text: 'Beatiful' },
                { id: 'B', text: 'Beautiful' },
                { id: 'C', text: 'Beutiful' },
                { id: 'D', text: 'Beautifull' },
              ]
            : answers
          ).map((answer) => (
            <div
              key={answer.id}
              style={{
                ...styles.answerCard,
                ...(selectedAnswer === answer.id ? styles.answerSelected : {}),
              }}
              onClick={() => setSelectedAnswer(answer.id)}
            >
              <span style={{
                ...styles.answerBadge,
                ...(selectedAnswer === answer.id ? styles.answerBadgeSelected : {}),
              }}>
                {answer.id}
              </span>
              <span style={{
                ...styles.answerText,
                ...(selectedAnswer === answer.id ? { color: '#fff' } : {}),
              }}>{answer.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div style={styles.bottomActions}>
        {/* Left side - Helper buttons */}
        <div style={styles.helperButtons}>
          <button style={styles.hintButton}>
            <span style={styles.hintIconSmall}>💡</span>
            <span style={styles.helperText}>Hint</span>
            <span style={styles.hintCount}>2</span>
          </button>
          <button style={styles.knowMoreButton}>
            <span style={styles.knowMoreIcon}>📖</span>
            <span style={styles.helperText}>Know More</span>
          </button>
          <button style={styles.skipButton}>
            <span style={styles.skipIcon}>⏭️</span>
            <span style={styles.helperText}>Skip</span>
          </button>
        </div>

        {/* Right side - Submit */}
        <button
          style={{
            ...styles.submitButton,
            opacity: selectedAnswer ? 1 : 0.5,
          }}
        >
          <span>SUBMIT</span>
          <span style={styles.submitArrow}>→</span>
        </button>
      </div>

      {/* Player badge */}
      <div style={styles.playerMini}>
        <span>{currentMascot?.emoji}</span>
        <span>{playerName || 'Student'}</span>
      </div>
    </div>
  );

  return (
    <div style={styles.appContainer}>
      <style>{keyframes}</style>
      {currentScreen === 'login' && <LoginScreen />}
      {currentScreen === 'landing' && <LandingScreen />}
      {currentScreen === 'question' && <QuestionScreen />}
    </div>
  );
}

const keyframes = `
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
    50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
  }
  @keyframes floatSlow {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-30px) rotate(10deg); }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.5); }
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(236, 64, 122, 0.4); }
    50% { box-shadow: 0 0 40px rgba(236, 64, 122, 0.8); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pulseRing {
    0% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(1.5); opacity: 0; }
  }
  @keyframes floatEmoji {
    0%, 100% { transform: translateY(0) rotate(-5deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }
  @keyframes gradientFlow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Quicksand:wght@500;600;700&display=swap');
`;

const styles = {
  appContainer: {
    fontFamily: "'Nunito', 'Quicksand', sans-serif",
    minHeight: '100vh',
    overflow: 'hidden',
  },

  // ==================== MODERN LOGIN SCREEN ====================
  loginContainer: {
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },

  spaceBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },

  star: {
    position: 'absolute',
    borderRadius: '50%',
    background: '#fff',
    animation: 'twinkle 2s ease-in-out infinite',
  },

  floatingEmoji: {
    position: 'absolute',
    fontSize: '32px',
    opacity: 0.15,
    animation: 'floatEmoji 8s ease-in-out infinite',
  },

  glowOrb1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236, 64, 122, 0.3) 0%, transparent 70%)',
    top: '-100px',
    right: '-100px',
    filter: 'blur(60px)',
  },

  glowOrb2: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124, 77, 255, 0.3) 0%, transparent 70%)',
    bottom: '-50px',
    left: '-50px',
    filter: 'blur(60px)',
  },

  glowOrb3: {
    position: 'absolute',
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(77, 208, 225, 0.2) 0%, transparent 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    filter: 'blur(80px)',
  },

  loginContent: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '600px',
    width: '100%',
  },

  logoSection: {
    textAlign: 'center',
    marginBottom: '30px',
  },

  logoIcon: {
    fontSize: '60px',
    marginBottom: '10px',
    animation: 'bounce 2s ease-in-out infinite',
  },

  logoTitle: {
    fontSize: '56px',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #ff6b9d 0%, #c44df7 40%, #6b8bff 100%)',
    backgroundSize: '200% 200%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0 0 8px 0',
    animation: 'gradientFlow 4s ease infinite',
    textShadow: '0 0 60px rgba(196, 77, 247, 0.5)',
  },

  logoTagline: {
    fontSize: '18px',
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0,
    letterSpacing: '4px',
    textTransform: 'uppercase',
  },

  glassCard: {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    borderRadius: '32px',
    padding: '35px',
    width: '100%',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
  },

  mascotShowcase: {
    display: 'flex',
    alignItems: 'center',
    gap: '25px',
    marginBottom: '30px',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '20px',
  },

  mascotSpotlight: {
    position: 'relative',
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  spotlightRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    animation: 'pulseRing 2s ease-out infinite',
  },

  spotlightRing2: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    animation: 'pulseRing 2s ease-out infinite 0.5s',
  },

  bigMascot: {
    fontSize: '60px',
    animation: 'bounce 2s ease-in-out infinite',
    filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))',
  },

  mascotInfo: {
    display: 'flex',
    flexDirection: 'column',
  },

  mascotLabel: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },

  mascotNameBig: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#fff',
  },

  inputGroup: {
    marginBottom: '25px',
  },

  modernLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '12px',
  },

  labelIcon: {
    fontSize: '18px',
  },

  inputWrapper: {
    position: 'relative',
  },

  modernInput: {
    width: '100%',
    padding: '18px 24px',
    fontSize: '18px',
    fontWeight: '600',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    transition: 'all 0.3s ease',
  },

  inputGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '16px',
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },

  mascotSelection: {
    marginBottom: '25px',
  },

  mascotCarousel: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },

  mascotCard: {
    width: '90px',
    height: '100px',
    borderRadius: '20px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.3s ease',
    background: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
  },

  mascotCardSelected: {
    transform: 'translateY(-8px) scale(1.05)',
  },

  mascotCardEmoji: {
    fontSize: '36px',
    transition: 'transform 0.3s ease',
  },

  mascotCardName: {
    fontSize: '12px',
    fontWeight: '700',
    transition: 'color 0.3s ease',
  },

  selectedCheck: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },

  settingsSection: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  settingChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '30px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  settingChipActive: {
    background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
    color: '#1a1a3e',
    border: '1px solid transparent',
    boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
  },

  startButton: {
    width: '100%',
    maxWidth: '400px',
    padding: '22px 40px',
    marginTop: '30px',
    fontSize: '20px',
    fontWeight: '800',
    border: 'none',
    borderRadius: '60px',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #ec407a 0%, #ab47bc 50%, #7c4dff 100%)',
    backgroundSize: '200% 200%',
    color: '#fff',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    boxShadow: '0 15px 40px rgba(124, 77, 255, 0.5)',
    transition: 'all 0.4s ease',
    position: 'relative',
    overflow: 'hidden',
    animation: 'gradientFlow 3s ease infinite',
  },

  buttonShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    animation: 'shimmer 2s infinite',
  },

  buttonIcon: {
    fontSize: '24px',
    position: 'relative',
    zIndex: 1,
  },

  buttonText: {
    position: 'relative',
    zIndex: 1,
    letterSpacing: '1px',
  },

  buttonArrow: {
    fontSize: '24px',
    position: 'relative',
    zIndex: 1,
    transition: 'transform 0.3s ease',
  },

  statsPreview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '30px',
    marginTop: '30px',
    padding: '20px 40px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
  },

  statBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },

  statIcon: {
    fontSize: '28px',
  },

  statValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#fff',
  },

  statLabel: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },

  statDivider: {
    width: '1px',
    height: '50px',
    background: 'rgba(255, 255, 255, 0.1)',
  },

  // ==================== LANDING SCREEN STYLES ====================
  landingContainer: {
    background: 'linear-gradient(135deg, #c4b5e0 0%, #a8d5e5 50%, #d4c5f0 100%)',
    minHeight: '100vh',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },

  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },

  particle: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.6)',
    animation: 'float 6s ease-in-out infinite',
  },

  landingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    position: 'relative',
    zIndex: 10,
  },

  backButton: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#ffc107',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    boxShadow: '0 4px 15px rgba(255, 193, 7, 0.4)',
  },

  backArrow: {
    color: '#fff',
    fontWeight: 'bold',
  },

  mainTitle: {
    fontSize: '42px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #ec407a 0%, #ab47bc 50%, #7c4dff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
  },

  profileButton: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#4caf50',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
  },

  statsBanner: {
    background: 'linear-gradient(135deg, #2d2d5a 0%, #3a3a6e 100%)',
    borderRadius: '20px',
    padding: '25px 30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '30px',
    marginBottom: '15px',
    position: 'relative',
    boxShadow: '0 10px 40px rgba(45, 45, 90, 0.3)',
  },

  statsLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },

  statsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },

  statsIconLanding: {
    fontSize: '36px',
  },

  statsContent: {
    display: 'flex',
    flexDirection: 'column',
  },

  statsNumber: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#ffc107',
  },

  statsLabel: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
  },

  statsDivider: {
    width: '2px',
    height: '60px',
    background: 'rgba(255, 255, 255, 0.2)',
  },

  streakBadge: {
    position: 'absolute',
    top: '-10px',
    right: '20px',
    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#fff',
    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.4)',
  },

  welcomeMessage: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#2d2d5a',
    marginBottom: '10px',
    padding: '12px 24px',
    background: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '30px',
    display: 'inline-block',
    margin: '0 auto 15px',
    left: '50%',
    position: 'relative',
    transform: 'translateX(-50%)',
  },

  sectionTitle: {
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: '700',
    color: '#2d2d5a',
    marginBottom: '25px',
  },

  topicsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    position: 'relative',
    zIndex: 10,
  },

  topicCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    borderLeft: '5px solid',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    animation: 'slideUp 0.5s ease forwards',
  },

  topicHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },

  topicIcon: {
    fontSize: '40px',
  },

  infoButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#9e9e9e',
    cursor: 'pointer',
  },

  topicName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2d2d5a',
    margin: '0 0 10px 0',
  },

  difficultyBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '15px',
  },

  topicProgress: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#757575',
    marginBottom: '10px',
  },

  progressBar: {
    height: '6px',
    background: '#e0e0e0',
    borderRadius: '3px',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },

  mascotContainer: {
    position: 'fixed',
    bottom: '20px',
    right: '30px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
    zIndex: 100,
  },

  mascotFloat: {
    fontSize: '60px',
    animation: 'bounce 2s ease-in-out infinite',
  },

  speechBubble: {
    background: '#fff',
    padding: '10px 18px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d2d5a',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  },

  // ==================== QUESTION SCREEN ====================
  questionContainer: {
    background: 'linear-gradient(135deg, #1a1a3e 0%, #2d2d5a 50%, #1a1a3e 100%)',
    minHeight: '100vh',
    padding: '15px',
    position: 'relative',
    overflow: 'hidden',
  },

  starParticle: {
    position: 'absolute',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: '#fff',
    animation: 'twinkle 2s ease-in-out infinite',
  },

  topNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
    position: 'relative',
    zIndex: 10,
  },

  topicBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #4dd0e1 0%, #26c6da 100%)',
    padding: '10px 18px',
    borderRadius: '25px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#fff',
    boxShadow: '0 4px 15px rgba(77, 208, 225, 0.4)',
    letterSpacing: '0.5px',
  },

  badgeIcon: {
    fontSize: '16px',
  },

  progressSegments: {
    flex: 1,
    display: 'flex',
    gap: '4px',
    padding: '0 16px',
  },

  segment: {
    flex: 1,
    height: '10px',
    borderRadius: '5px',
    transition: 'all 0.3s ease',
  },

  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  xpBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
    padding: '8px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#2d2d5a',
  },

  timerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '8px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
  },

  navIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#fff',
    transition: 'all 0.2s ease',
  },

  closeButton: {
    background: 'rgba(239, 83, 80, 0.3)',
  },

  questionContent: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '20px',
    height: 'calc(100vh - 175px)',
    position: 'relative',
    zIndex: 10,
    marginBottom: '75px',
  },

  questionPanel: {
    background: '#fff',
    borderRadius: '24px',
    padding: '28px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
  },

  questionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '18px',
  },

  questionNumber: {
    background: 'linear-gradient(135deg, #2d2d5a 0%, #3a3a6e 100%)',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
  },

  questionCategory: {
    color: '#9e9e9e',
    fontSize: '14px',
    fontWeight: '500',
  },

  zoomButton: {
    marginLeft: 'auto',
    background: 'rgba(77, 208, 225, 0.1)',
    border: '1px solid #4dd0e1',
    color: '#4dd0e1',
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },

  questionText: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2d2d5a',
    lineHeight: 1.5,
    marginBottom: '18px',
  },

  questionNote: {
    background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
    padding: '14px 18px',
    borderRadius: '14px',
    fontSize: '14px',
    color: '#e65100',
    marginBottom: '18px',
    borderLeft: '4px solid #ffc107',
  },

  questionImage: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '140px',
  },

  imagePlaceholder: {
    width: '100%',
    height: '100%',
    minHeight: '140px',
    background: 'linear-gradient(135deg, #1a1a3e 0%, #2d2d5a 100%)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },

  rocketImage: {
    fontSize: '48px',
    animation: 'bounce 2s ease-in-out infinite',
  },

  starsDecor: {
    fontSize: '18px',
  },

  answersPanel: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '14px',
    alignContent: 'center',
  },

  answerCard: {
    background: '#fff',
    borderRadius: '18px',
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
    minHeight: '70px',
  },

  answerSelected: {
    background: 'linear-gradient(135deg, #7c4dff 0%, #ab47bc 100%)',
    border: '2px solid #ffd700',
    transform: 'scale(1.02)',
    boxShadow: '0 8px 30px rgba(124, 77, 255, 0.4)',
  },

  answerBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2d2d5a 0%, #3a3a6e 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '800',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(45, 45, 90, 0.3)',
  },

  answerBadgeSelected: {
    background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
    color: '#2d2d5a',
    boxShadow: '0 2px 12px rgba(255, 215, 0, 0.5)',
  },

  answerText: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#2d2d5a',
    lineHeight: 1.3,
  },

  bottomActions: {
    position: 'fixed',
    bottom: '16px',
    left: '16px',
    right: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
    padding: '14px 22px',
    background: 'rgba(26, 26, 62, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '18px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },

  helperButtons: {
    display: 'flex',
    gap: '10px',
  },

  hintButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)',
    transition: 'all 0.3s ease',
    position: 'relative',
  },

  hintIconSmall: {
    fontSize: '16px',
  },

  helperText: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#fff',
  },

  hintCount: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#fff',
    color: '#ff5722',
    fontSize: '11px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },

  knowMoreButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #4dd0e1 0%, #26c6da 100%)',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(77, 208, 225, 0.4)',
    transition: 'all 0.3s ease',
  },

  knowMoreIcon: {
    fontSize: '16px',
  },

  skipButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  skipIcon: {
    fontSize: '16px',
  },

  submitButton: {
    background: 'linear-gradient(135deg, #ec407a 0%, #7c4dff 100%)',
    border: 'none',
    color: '#fff',
    padding: '12px 32px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 6px 25px rgba(124, 77, 255, 0.5)',
    transition: 'all 0.3s ease',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  submitArrow: {
    fontSize: '16px',
    transition: 'transform 0.3s ease',
  },

  playerMini: {
    position: 'fixed',
    top: '80px',
    left: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    padding: '6px 14px',
    borderRadius: '20px',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '600',
    zIndex: 100,
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
};
