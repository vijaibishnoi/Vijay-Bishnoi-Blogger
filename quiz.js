// Quiz Application
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        QUIZ_DATA_ID: 'quizData',
        QUIZ_CONTAINER_ID: 'quiz-container',
        STORAGE_KEY: 'quiz_progress',
        COLORS: {
            primary: '#3498db',
            secondary: '#2ecc71',
            accent: '#e74c3c',
            neutral: '#95a5a6',
            background: '#f8f9fa',
            text: '#2c3e50',
            lightText: '#7f8c8d',
            border: '#dfe6e9',
            answered: '#3498db',
            current: '#e74c3c',
            correct: '#27ae60',
            incorrect: '#e74c3c',
            warning: '#f39c12'
        }
    };
    
    // Quiz State
    let quizState = {
        questions: [],
        currentIndex: 0,
        userAnswers: {},
        startTime: null,
        timerInterval: null,
        elapsedSeconds: 0,
        isSubmitted: false,
        isStarted: false
    };
    
    // DOM Elements Cache
    const elements = {};
    
    // Main Initialization
    function init() {
        // Load quiz data
        const quizData = loadQuizData();
        if (!quizData || !Array.isArray(quizData)) {
            showError('Quiz data not found or invalid format');
            return;
        }
        
        // Decode HTML entities in quiz data
        quizState.questions = decodeQuizData(quizData);
        
        // Create container if not exists
        createContainer();
        
        // Inject styles
        injectStyles();
        
        // Show start screen
        showStartScreen();
        
        // Add window resize handler
        window.addEventListener('resize', handleResize);
    }
    
    // Load quiz data from various sources
    function loadQuizData() {
        // Try script tag with specific ID first
        const scriptElement = document.getElementById(CONFIG.QUIZ_DATA_ID);
        if (scriptElement && scriptElement.type === 'application/json') {
            try {
                return JSON.parse(scriptElement.textContent);
            } catch (e) {
                console.error('Failed to parse JSON from script tag:', e);
            }
        }
        
        // Try global variable
        if (window.quizData && Array.isArray(window.quizData)) {
            return window.quizData;
        }
        
        // Try textarea or hidden div
        const textarea = document.querySelector(`textarea#${CONFIG.QUIZ_DATA_ID}`);
        if (textarea) {
            try {
                return JSON.parse(textarea.value);
            } catch (e) {
                console.error('Failed to parse JSON from textarea:', e);
            }
        }
        
        // Try any element with quiz data
        const dataElement = document.getElementById(CONFIG.QUIZ_DATA_ID);
        if (dataElement) {
            try {
                const text = dataElement.textContent || dataElement.value;
                if (text) {
                    return JSON.parse(text);
                }
            } catch (e) {
                console.error('Failed to parse JSON from element:', e);
            }
        }
        
        return null;
    }
    
    // Decode HTML entities in quiz data
    function decodeQuizData(quizData) {
        if (!quizData || !Array.isArray(quizData)) return quizData;
        
        return quizData.map(question => {
            const decodedQuestion = {
                ...question,
                question: decodeHTMLEntities(question.question),
                options: question.options ? question.options.map(opt => decodeHTMLEntities(opt)) : [],
                explanation: question.explanation ? decodeHTMLEntities(question.explanation) : undefined
            };
            return decodedQuestion;
        });
    }
    
    // Decode HTML entities function
    function decodeHTMLEntities(text) {
        if (!text) return '';
        
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
    }
    
    // Create main container
    function createContainer() {
        let container = document.getElementById(CONFIG.QUIZ_CONTAINER_ID);
        if (!container) {
            container = document.createElement('div');
            container.id = CONFIG.QUIZ_CONTAINER_ID;
            document.body.appendChild(container);
        }
        elements.container = container;
    }
    
    // Show start screen
    function showStartScreen() {
        elements.container.innerHTML = `
            <div class="start-screen">
                <div class="start-card">
                    <h2>Quiz Challenge</h2>
                    <div class="quiz-info">
                        <div class="info-item">
                            <span class="info-icon">📝</span>
                            <span>${quizState.questions.length} Questions</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">⏱️</span>
                            <span>Unlimited Time</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🎯</span>
                            <span>Multiple Choice</span>
                        </div>
                    </div>
                    
                    <div class="instructions">
                        <h3>Instructions:</h3>
                        <ul>
                            <li>Select one answer for each question</li>
                            <li>You can navigate between questions</li>
                            <li>Answers are auto-saved</li>
                            <li>You can skip questions and submit anytime</li>
                            <li>Click Submit when finished</li>
                        </ul>
                    </div>
                    
                    <button class="start-btn" id="start-quiz-btn">Start Quiz</button>
                    
                    ${hasSavedProgress() ? `
                        <button class="continue-btn" id="continue-quiz-btn">
                            Continue Previous Quiz
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
        
        const continueBtn = document.getElementById('continue-quiz-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', continueQuiz);
        }
    }
    
    // Start new quiz
    function startQuiz() {
        // Clear any saved progress
        if (typeof Storage !== 'undefined') {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
        }
        
        quizState = {
            questions: quizState.questions,
            currentIndex: 0,
            userAnswers: {},
            startTime: null,
            timerInterval: null,
            elapsedSeconds: 0,
            isSubmitted: false,
            isStarted: true
        };
        
        initTimer();
        renderQuiz();
    }
    
    // Continue previous quiz
    function continueQuiz() {
        loadProgress();
        quizState.isStarted = true;
        initTimer();
        renderQuiz();
    }
    
    // Check for saved progress
    function hasSavedProgress() {
        if (typeof Storage !== 'undefined') {
            return localStorage.getItem(CONFIG.STORAGE_KEY) !== null;
        }
        return false;
    }
    
    // Inject CSS styles
    function injectStyles() {
        const styles = `
            #${CONFIG.QUIZ_CONTAINER_ID} {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                max-width: 800px;
                margin: 20px auto;
                padding: 20px;
                background: ${CONFIG.COLORS.background};
                border-radius: 12px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                color: ${CONFIG.COLORS.text};
                line-height: 1.6;
                box-sizing: border-box;
            }
            
            /* Start Screen */
            .start-screen {
                text-align: center;
                padding: 30px 15px;
            }
            
            .start-card {
                background: white;
                padding: 30px 20px;
                border-radius: 12px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            }
            
            .start-card h2 {
                color: ${CONFIG.COLORS.primary};
                margin-bottom: 20px;
                font-size: 1.8em;
            }
            
            .quiz-info {
                display: flex;
                justify-content: center;
                flex-wrap: wrap;
                gap: 12px;
                margin: 20px 0;
            }
            
            .info-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 12px;
                min-width: 100px;
                background: ${CONFIG.COLORS.background};
                border-radius: 8px;
                transition: transform 0.3s ease;
                font-size: 0.9em;
            }
            
            .info-item:hover {
                transform: translateY(-3px);
            }
            
            .info-icon {
                font-size: 1.5em;
                margin-bottom: 6px;
            }
            
            .instructions {
                text-align: left;
                background: ${CONFIG.COLORS.background};
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                font-size: 0.95em;
            }
            
            .instructions h3 {
                color: ${CONFIG.COLORS.primary};
                margin-bottom: 10px;
                font-size: 1.1em;
            }
            
            .instructions ul {
                padding-left: 18px;
                margin: 0;
            }
            
            .instructions li {
                margin-bottom: 6px;
                color: ${CONFIG.COLORS.lightText};
                font-size: 0.9em;
            }
            
            .start-btn, .continue-btn {
                width: 100%;
                padding: 14px;
                border: none;
                border-radius: 8px;
                font-size: 1em;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 10px;
            }
            
            .start-btn {
                background: linear-gradient(135deg, ${CONFIG.COLORS.primary}, ${CONFIG.COLORS.secondary});
                color: white;
            }
            
            .start-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 15px rgba(52, 152, 219, 0.3);
            }
            
            .continue-btn {
                background: ${CONFIG.COLORS.background};
                color: ${CONFIG.COLORS.primary};
                border: 2px solid ${CONFIG.COLORS.primary};
                font-size: 0.95em;
            }
            
            .continue-btn:hover {
                background: ${CONFIG.COLORS.primary};
                color: white;
            }
            
            /* Quiz Header */
            .quiz-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid ${CONFIG.COLORS.border};
                flex-wrap: wrap;
                gap: 12px;
            }
            
            .timer {
                font-size: 1.1em;
                font-weight: bold;
                color: white;
                background: linear-gradient(135deg, ${CONFIG.COLORS.primary}, ${CONFIG.COLORS.secondary});
                padding: 8px 16px;
                border-radius: 20px;
                box-shadow: 0 3px 10px rgba(52, 152, 219, 0.2);
                min-width: 90px;
                text-align: center;
            }
            
            .question-counter {
                font-size: 1em;
                color: ${CONFIG.COLORS.primary};
                font-weight: 600;
                background: white;
                padding: 8px 16px;
                border-radius: 20px;
                border: 2px solid ${CONFIG.COLORS.border};
            }
            
            .submit-status {
                font-size: 0.9em;
                color: ${CONFIG.COLORS.lightText};
                background: white;
                padding: 8px 16px;
                border-radius: 20px;
                border: 2px solid ${CONFIG.COLORS.border};
            }
            
            /* Question Area */
            .question-area {
                margin-bottom: 20px;
            }
            
            .question-text {
                font-size: 1.3em;
                margin-bottom: 20px;
                font-weight: 600;
                color: ${CONFIG.COLORS.text};
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.05);
                line-height: 1.7;
            }
            
            .options-container {
                display: grid;
                gap: 10px;
            }
            
            .option {
                padding: 16px;
                border: 2px solid ${CONFIG.COLORS.border};
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                background: white;
                user-select: none;
                font-size: 1em;
                position: relative;
                overflow: hidden;
            }
            
            .option:hover {
                border-color: ${CONFIG.COLORS.primary};
                transform: translateX(3px);
                box-shadow: 0 3px 10px rgba(0,0,0,0.1);
            }
            
            .option.selected {
                background: ${CONFIG.COLORS.primary};
                color: white;
                border-color: ${CONFIG.COLORS.primary};
                transform: translateX(3px);
                box-shadow: 0 3px 15px rgba(52, 152, 219, 0.3);
            }
            
            .option-label {
                display: inline-block;
                width: 28px;
                height: 28px;
                line-height: 28px;
                text-align: center;
                background: ${CONFIG.COLORS.background};
                border-radius: 50%;
                margin-right: 12px;
                font-weight: bold;
                font-size: 0.9em;
                transition: all 0.3s ease;
            }
            
            .option.selected .option-label {
                background: rgba(255,255,255,0.3);
                color: white;
            }
            
            /* Question Scroller */
            .question-scroller-container {
                margin: 20px 0;
                position: relative;
            }
            
            .question-scroller {
                display: flex;
                gap: 6px;
                overflow-x: auto;
                padding: 15px 8px;
                margin: 0;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: thin;
                scroll-behavior: smooth;
            }
            
            .question-scroller::-webkit-scrollbar {
                height: 6px;
            }
            
            .question-scroller::-webkit-scrollbar-track {
                background: ${CONFIG.COLORS.background};
                border-radius: 3px;
            }
            
            .question-scroller::-webkit-scrollbar-thumb {
                background: ${CONFIG.COLORS.neutral};
                border-radius: 3px;
            }
            
            .question-scroller::-webkit-scrollbar-thumb:hover {
                background: ${CONFIG.COLORS.primary};
            }
            
            .scroller-btn {
                min-width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 3px solid ${CONFIG.COLORS.border};
                background: white;
                color: ${CONFIG.COLORS.primary};
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.9em;
                font-weight: 600;
                flex-shrink: 0;
                transition: all 0.3s ease;
                position: relative;
            }
            
            .scroller-btn:hover {
                transform: scale(1.05);
                border-color: ${CONFIG.COLORS.primary};
                color: ${CONFIG.COLORS.primary};
            }
            
            .scroller-btn.answered {
                background: ${CONFIG.COLORS.answered};
                color: white;
                border-color: ${CONFIG.COLORS.answered};
            }
            
            .scroller-btn.current {
                border-color: ${CONFIG.COLORS.current};
                background: white;
                color: ${CONFIG.COLORS.current};
                transform: scale(1.1);
                box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
                font-weight: bold;
            }
            
            .scroller-btn.current.answered {
                background: ${CONFIG.COLORS.answered};
                color: white;
                border-color: ${CONFIG.COLORS.current};
            }
            
            .scroller-progress {
                height: 3px;
                background: ${CONFIG.COLORS.background};
                border-radius: 1.5px;
                margin-top: 8px;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, ${CONFIG.COLORS.primary}, ${CONFIG.COLORS.secondary});
                width: 0%;
                transition: width 0.5s ease;
            }
            
            /* Navigation */
            .navigation {
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
                gap: 10px;
            }
            
            .nav-btn {
                padding: 12px 20px;
                border: none;
                border-radius: 8px;
                background: ${CONFIG.COLORS.primary};
                color: white;
                cursor: pointer;
                font-size: 0.95em;
                font-weight: 600;
                transition: all 0.3s ease;
                min-width: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                flex: 1;
            }
            
            .nav-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
            }
            
            .nav-btn:disabled {
                background: ${CONFIG.COLORS.neutral};
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            .submit-btn {
                background: linear-gradient(135deg, ${CONFIG.COLORS.correct}, #2ecc71);
            }
            
            .submit-btn:hover {
                box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);
            }
            
            /* Results Screen */
            .results-screen {
                animation: fadeIn 0.5s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(15px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .results-header {
                text-align: center;
                margin-bottom: 25px;
            }
            
            .results-header h2 {
                color: ${CONFIG.COLORS.primary};
                font-size: 1.8em;
                margin-bottom: 8px;
            }
            
            .summary {
                background: white;
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 25px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            }
            
            .summary h3 {
                color: ${CONFIG.COLORS.primary};
                margin-bottom: 15px;
                font-size: 1.3em;
            }
            
            .summary-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 12px;
                margin-top: 15px;
            }
            
            .stat {
                text-align: center;
                padding: 15px 10px;
                border-radius: 8px;
                background: ${CONFIG.COLORS.background};
                transition: transform 0.3s ease;
            }
            
            .stat:hover {
                transform: translateY(-3px);
            }
            
            .stat-value {
                font-size: 1.8em;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .stat-label {
                font-size: 0.85em;
                color: ${CONFIG.COLORS.lightText};
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .correct-stat {
                background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(46, 204, 113, 0.1));
                border: 2px solid ${CONFIG.COLORS.correct};
            }
            
            .correct-stat .stat-value {
                color: ${CONFIG.COLORS.correct};
            }
            
            .incorrect-stat {
                background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(230, 126, 34, 0.1));
                border: 2px solid ${CONFIG.COLORS.incorrect};
            }
            
            .incorrect-stat .stat-value {
                color: ${CONFIG.COLORS.incorrect};
            }
            
            .unanswered-stat {
                background: linear-gradient(135deg, rgba(149, 165, 166, 0.1), rgba(189, 195, 199, 0.1));
                border: 2px solid ${CONFIG.COLORS.neutral};
            }
            
            .unanswered-stat .stat-value {
                color: ${CONFIG.COLORS.neutral};
            }
            
            .time-stat {
                background: linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(155, 89, 182, 0.1));
                border: 2px solid ${CONFIG.COLORS.primary};
            }
            
            .time-stat .stat-value {
                color: ${CONFIG.COLORS.primary};
            }
            
            .score-summary {
                text-align: center;
                margin-top: 20px;
                padding: 15px;
                background: rgba(52, 152, 219, 0.08);
                border-radius: 8px;
            }
            
            .score-summary h4 {
                color: ${CONFIG.COLORS.primary};
                margin-bottom: 8px;
                font-size: 1.1em;
            }
            
            .review-question {
                background: white;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 15px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.04);
                border-left: 4px solid transparent;
            }
            
            .review-question.correct {
                border-left-color: ${CONFIG.COLORS.correct};
            }
            
            .review-question.incorrect {
                border-left-color: ${CONFIG.COLORS.incorrect};
            }
            
            .review-question.unanswered {
                border-left-color: ${CONFIG.COLORS.neutral};
            }
            
            .review-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid ${CONFIG.COLORS.background};
            }
            
            .question-number {
                font-weight: bold;
                color: ${CONFIG.COLORS.primary};
                font-size: 1em;
            }
            
            .question-status {
                padding: 4px 10px;
                border-radius: 15px;
                font-size: 0.8em;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }
            
            .status-correct {
                background: rgba(39, 174, 96, 0.1);
                color: ${CONFIG.COLORS.correct};
            }
            
            .status-incorrect {
                background: rgba(231, 76, 60, 0.1);
                color: ${CONFIG.COLORS.incorrect};
            }
            
            .status-unanswered {
                background: rgba(149, 165, 166, 0.1);
                color: ${CONFIG.COLORS.neutral};
            }
            
            .user-answer.correct {
                color: ${CONFIG.COLORS.correct};
                font-weight: bold;
                padding: 10px;
                background: rgba(39, 174, 96, 0.08);
                border-radius: 6px;
                margin: 8px 0;
                border: 1px solid rgba(39, 174, 96, 0.2);
                font-size: 0.95em;
            }
            
            .user-answer.incorrect {
                color: ${CONFIG.COLORS.incorrect};
                font-weight: bold;
                padding: 10px;
                background: rgba(231, 76, 60, 0.08);
                border-radius: 6px;
                margin: 8px 0;
                border: 1px solid rgba(231, 76, 60, 0.2);
                font-size: 0.95em;
            }
            
            .correct-answer {
                color: ${CONFIG.COLORS.correct};
                font-weight: bold;
                padding: 10px;
                background: rgba(39, 174, 96, 0.08);
                border-radius: 6px;
                margin: 8px 0;
                border: 1px solid rgba(39, 174, 96, 0.2);
                font-size: 0.95em;
            }
            
            .unanswered-text {
                color: ${CONFIG.COLORS.neutral};
                font-style: italic;
                padding: 10px;
                background: rgba(149, 165, 166, 0.08);
                border-radius: 6px;
                margin: 8px 0;
                border: 1px solid rgba(149, 165, 166, 0.2);
                font-size: 0.95em;
            }
            
            .explanation {
                margin-top: 15px;
                padding: 12px;
                background: rgba(52, 152, 219, 0.05);
                border-left: 3px solid ${CONFIG.COLORS.primary};
                border-radius: 6px;
                font-size: 0.95em;
            }
            
            .explanation-title {
                font-weight: bold;
                color: ${CONFIG.COLORS.primary};
                margin-bottom: 5px;
                display: block;
                font-size: 0.9em;
            }
            
            .restart-btn {
                display: block;
                margin: 25px auto 15px;
                padding: 14px 30px;
                font-size: 1em;
                background: linear-gradient(135deg, ${CONFIG.COLORS.primary}, ${CONFIG.COLORS.secondary});
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 600;
            }
            
            .restart-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 15px rgba(52, 152, 219, 0.3);
            }
            
            /* Unicode/Hindi Support */
            .unicode-support {
                font-family: 'Segoe UI', 'Nirmala UI', 'Noto Sans Devanagari', 'Arial Unicode MS', Arial, sans-serif;
                font-size: 1.05em;
                line-height: 1.7;
            }
            
            .error-message {
                color: ${CONFIG.COLORS.incorrect};
                text-align: center;
                padding: 30px;
                font-size: 1.1em;
            }
            
            /* Responsive Design - Tablet */
            @media (max-width: 768px) {
                #${CONFIG.QUIZ_CONTAINER_ID} {
                    margin: 10px;
                    padding: 15px;
                    border-radius: 10px;
                }
                
                .quiz-header {
                    margin-bottom: 15px;
                    padding-bottom: 12px;
                    gap: 10px;
                }
                
                .timer {
                    font-size: 1em;
                    padding: 6px 12px;
                    min-width: 80px;
                }
                
                .question-counter {
                    font-size: 0.95em;
                    padding: 6px 12px;
                }
                
                .submit-status {
                    font-size: 0.85em;
                    padding: 6px 12px;
                }
                
                .question-text {
                    font-size: 1.2em;
                    padding: 16px;
                    margin-bottom: 16px;
                    line-height: 1.6;
                }
                
                .option {
                    padding: 14px;
                    font-size: 0.95em;
                }
                
                .option-label {
                    width: 26px;
                    height: 26px;
                    line-height: 26px;
                    margin-right: 10px;
                    font-size: 0.85em;
                }
                
                .question-scroller-container {
                    margin: 15px 0;
                }
                
                .question-scroller {
                    padding: 12px 6px;
                    gap: 5px;
                }
                
                .scroller-btn {
                    min-width: 36px;
                    height: 36px;
                    font-size: 0.85em;
                }
                
                .navigation {
                    margin-top: 15px;
                    gap: 8px;
                }
                
                .nav-btn {
                    padding: 10px 15px;
                    font-size: 0.9em;
                    min-width: auto;
                }
                
                .results-header h2 {
                    font-size: 1.6em;
                }
                
                .summary {
                    padding: 16px;
                    margin-bottom: 20px;
                }
                
                .summary h3 {
                    font-size: 1.2em;
                }
                
                .summary-stats {
                    gap: 10px;
                }
                
                .stat {
                    padding: 12px 8px;
                }
                
                .stat-value {
                    font-size: 1.6em;
                }
                
                .review-question {
                    padding: 16px;
                    margin-bottom: 12px;
                }
                
                .start-screen {
                    padding: 20px 10px;
                }
                
                .start-card {
                    padding: 20px 15px;
                }
                
                .start-card h2 {
                    font-size: 1.6em;
                    margin-bottom: 15px;
                }
                
                .info-item {
                    padding: 10px;
                    min-width: 90px;
                    font-size: 0.85em;
                }
                
                .info-icon {
                    font-size: 1.3em;
                }
                
                .instructions {
                    padding: 12px;
                    margin: 15px 0;
                }
                
                .start-btn, .continue-btn {
                    padding: 12px;
                    font-size: 0.95em;
                }
            }
            
            /* Responsive Design - Mobile */
            @media (max-width: 480px) {
                #${CONFIG.QUIZ_CONTAINER_ID} {
                    margin: 5px;
                    padding: 12px;
                }
                
                .quiz-header {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 8px;
                }
                
                .timer, .question-counter, .submit-status {
                    align-self: center;
                    width: fit-content;
                }
                
                .question-text {
                    font-size: 1.1em;
                    padding: 14px;
                    margin-bottom: 14px;
                    line-height: 1.5;
                }
                
                .option {
                    padding: 12px;
                    font-size: 0.9em;
                }
                
                .option-label {
                    width: 24px;
                    height: 24px;
                    line-height: 24px;
                    margin-right: 8px;
                    font-size: 0.8em;
                }
                
                .question-scroller-container {
                    margin: 12px 0;
                }
                
                .question-scroller {
                    padding: 10px 5px;
                    gap: 4px;
                }
                
                .scroller-btn {
                    min-width: 32px;
                    height: 32px;
                    font-size: 0.8em;
                    border-width: 2px;
                }
                
                .navigation {
                    flex-direction: column;
                    gap: 8px;
                    margin-top: 12px;
                }
                
                .nav-btn {
                    width: 100%;
                    padding: 10px;
                    justify-content: center;
                }
                
                .summary-stats {
                    grid-template-columns: 1fr;
                }
                
                .question-text {
                    font-size: 1em;
                }
                
                .review-question {
                    padding: 14px;
                    margin-bottom: 10px;
                }
                
                .user-answer.correct,
                .user-answer.incorrect,
                .correct-answer,
                .unanswered-text {
                    padding: 8px;
                    font-size: 0.9em;
                }
                
                .explanation {
                    padding: 10px;
                    font-size: 0.9em;
                }
                
                .restart-btn {
                    padding: 12px 25px;
                    font-size: 0.95em;
                    margin: 20px auto 10px;
                }
                
                .start-card {
                    padding: 15px 12px;
                }
                
                .start-card h2 {
                    font-size: 1.4em;
                    margin-bottom: 12px;
                }
                
                .quiz-info {
                    gap: 8px;
                    margin: 15px 0;
                }
                
                .info-item {
                    min-width: 80px;
                    padding: 8px;
                    font-size: 0.8em;
                }
                
                .info-icon {
                    font-size: 1.2em;
                }
                
                .instructions {
                    padding: 10px;
                    margin: 12px 0;
                    font-size: 0.9em;
                }
                
                .instructions li {
                    font-size: 0.85em;
                    margin-bottom: 4px;
                }
                
                .start-btn, .continue-btn {
                    padding: 10px;
                    font-size: 0.9em;
                    margin-top: 8px;
                }
            }
            
            /* Small Mobile Devices */
            @media (max-width: 360px) {
                #${CONFIG.QUIZ_CONTAINER_ID} {
                    padding: 10px;
                }
                
                .question-text {
                    font-size: 0.95em;
                    padding: 12px;
                }
                
                .option {
                    padding: 10px;
                    font-size: 0.85em;
                }
                
                .option-label {
                    width: 22px;
                    height: 22px;
                    line-height: 22px;
                    margin-right: 6px;
                }
                
                .scroller-btn {
                    min-width: 28px;
                    height: 28px;
                    font-size: 0.75em;
                }
                
                .nav-btn {
                    font-size: 0.85em;
                    padding: 8px;
                }
                
                .timer, .question-counter, .submit-status {
                    font-size: 0.9em;
                    padding: 5px 10px;
                }
            }
        `;
        
        const styleTag = document.createElement('style');
        styleTag.textContent = styles;
        document.head.appendChild(styleTag);
    }
    
    // Initialize timer
    function initTimer() {
        if (!quizState.startTime) {
            quizState.startTime = new Date();
        }
        
        if (quizState.timerInterval) {
            clearInterval(quizState.timerInterval);
        }
        
        quizState.timerInterval = setInterval(() => {
            quizState.elapsedSeconds++;
            updateTimerDisplay();
        }, 1000);
        
        updateTimerDisplay();
    }
    
    // Update timer display
    function updateTimerDisplay() {
        if (elements.timer) {
            const minutes = Math.floor(quizState.elapsedSeconds / 60);
            const seconds = quizState.elapsedSeconds % 60;
            elements.timer.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    // Render the quiz interface
    function renderQuiz() {
        if (quizState.isSubmitted) {
            renderResults();
            return;
        }
        
        const currentQuestion = quizState.questions[quizState.currentIndex];
        const answeredCount = Object.keys(quizState.userAnswers).length;
        const progressPercentage = (answeredCount / quizState.questions.length) * 100;
        
        elements.container.innerHTML = `
            <div class="quiz-header">
                <div class="timer" id="quiz-timer">00:00</div>
                <div class="question-counter">
                    Question ${quizState.currentIndex + 1} of ${quizState.questions.length}
                </div>
                <div class="submit-status">
                    ${answeredCount} of ${quizState.questions.length} answered
                </div>
            </div>
            
            <div class="question-area">
                <div class="question-text unicode-support">${escapeHtml(currentQuestion.question)}</div>
                
                <div class="options-container" id="options-container"></div>
            </div>
            
            <div class="question-scroller-container">
                <div class="question-scroller" id="question-scroller"></div>
                <div class="scroller-progress">
                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
            </div>
            
            <div class="navigation">
                <button class="nav-btn" id="prev-btn" ${quizState.currentIndex === 0 ? 'disabled' : ''}>
                    ← Previous
                </button>
                
                <button class="nav-btn submit-btn" id="submit-btn">
                    ✓ Submit Quiz
                </button>
                
                <button class="nav-btn" id="next-btn" 
                    ${quizState.currentIndex === quizState.questions.length - 1 ? 'disabled' : ''}>
                    Next →
                </button>
            </div>
        `;
        
        // Cache elements
        elements.timer = document.getElementById('quiz-timer');
        elements.optionsContainer = document.getElementById('options-container');
        elements.scroller = document.getElementById('question-scroller');
        elements.prevBtn = document.getElementById('prev-btn');
        elements.nextBtn = document.getElementById('next-btn');
        elements.submitBtn = document.getElementById('submit-btn');
        
        // Update timer display
        updateTimerDisplay();
        
        // Render options
        renderOptions(currentQuestion);
        
        // Render question scroller
        renderQuestionScroller();
        
        // Add event listeners
        attachEventListeners();
    }
    
    // Render options for current question
    function renderOptions(question) {
        elements.optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = `option unicode-support ${quizState.userAnswers[quizState.currentIndex] === index ? 'selected' : ''}`;
            optionElement.dataset.index = index;
            
            const optionLabel = String.fromCharCode(65 + index);
            optionElement.innerHTML = `
                <span class="option-label">${optionLabel}</span>
                <span class="option-text">${escapeHtml(option)}</span>
            `;
            
            elements.optionsContainer.appendChild(optionElement);
        });
    }
    
    // Render question scroller
    function renderQuestionScroller() {
        elements.scroller.innerHTML = '';
        
        quizState.questions.forEach((_, index) => {
            const button = document.createElement('button');
            const isAnswered = quizState.userAnswers[index] !== undefined;
            const isCurrent = index === quizState.currentIndex;
            
            button.className = `scroller-btn ${isAnswered ? 'answered' : ''} ${isCurrent ? 'current' : ''}`;
            button.textContent = index + 1;
            button.dataset.index = index;
            button.title = `Question ${index + 1}${isAnswered ? ' (Answered)' : ' (Not Answered)'}`;
            
            elements.scroller.appendChild(button);
        });
    }
    
    // Attach event listeners
    function attachEventListeners() {
        // Option selection
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', handleOptionSelect);
        });
        
        // Navigation buttons
        elements.prevBtn.addEventListener('click', () => navigateTo(quizState.currentIndex - 1));
        elements.nextBtn.addEventListener('click', () => navigateTo(quizState.currentIndex + 1));
        elements.submitBtn.addEventListener('click', submitQuiz);
        
        // Question scroller buttons
        document.querySelectorAll('.scroller-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                navigateTo(parseInt(e.target.dataset.index));
            });
        });
    }
    
    // Handle option selection
    function handleOptionSelect(e) {
        const selectedIndex = parseInt(e.target.closest('.option').dataset.index);
        quizState.userAnswers[quizState.currentIndex] = selectedIndex;
        
        // Update UI
        document.querySelectorAll('.option').forEach(option => {
            option.classList.remove('selected');
        });
        e.target.closest('.option').classList.add('selected');
        
        // Update scroller
        updateScrollerButton(quizState.currentIndex);
        
        // Update progress bar and status
        const answeredCount = Object.keys(quizState.userAnswers).length;
        const progressPercentage = (answeredCount / quizState.questions.length) * 100;
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        // Update answered count display
        const statusElement = document.querySelector('.submit-status');
        if (statusElement) {
            statusElement.textContent = `${answeredCount} of ${quizState.questions.length} answered`;
        }
        
        // Save progress
        saveProgress();
    }
    
    // Navigate to specific question
    function navigateTo(index) {
        if (index >= 0 && index < quizState.questions.length) {
            quizState.currentIndex = index;
            renderQuiz();
        }
    }
    
    // Update scroller button state
    function updateScrollerButton(index) {
        const button = elements.scroller?.children[index];
        if (button) {
            const isAnswered = quizState.userAnswers[index] !== undefined;
            button.classList.toggle('answered', isAnswered);
            button.classList.toggle('current', index === quizState.currentIndex);
        }
    }
    
    // Submit quiz
    function submitQuiz() {
        if (confirm('Are you sure you want to submit the quiz? You will not be able to change answers after submission.')) {
            clearInterval(quizState.timerInterval);
            quizState.isSubmitted = true;
            renderResults();
        }
    }
    
    // Render results screen
    function renderResults() {
        const results = calculateResults();
        
        elements.container.innerHTML = `
            <div class="results-screen">
                <div class="results-header">
                    <h2>Quiz Completed!</h2>
                    <p style="color: ${CONFIG.COLORS.lightText}">Here's your performance summary</p>
                </div>
                
                <div class="summary">
                    <h3>Your Score</h3>
                    <div class="summary-stats">
                        <div class="stat correct-stat">
                            <div class="stat-value">${results.correct}</div>
                            <div class="stat-label">Correct</div>
                        </div>
                        <div class="stat incorrect-stat">
                            <div class="stat-value">${results.incorrect}</div>
                            <div class="stat-label">Incorrect</div>
                        </div>
                        <div class="stat unanswered-stat">
                            <div class="stat-value">${results.unanswered}</div>
                            <div class="stat-label">Unanswered</div>
                        </div>
                        <div class="stat time-stat">
                            <div class="stat-value">${formatTime(results.timeTaken)}</div>
                            <div class="stat-label">Time Taken</div>
                        </div>
                    </div>
                    
                    <div class="score-summary">
                        <h4>Score</h4>
                        <div style="font-size: 2em; font-weight: bold; color: ${CONFIG.COLORS.primary}">
                            ${results.correct}/${quizState.questions.length}
                        </div>
                        <div style="color: ${CONFIG.COLORS.lightText}; margin-top: 5px;">
                            ${Math.round((results.correct / quizState.questions.length) * 100)}% Accuracy
                        </div>
                    </div>
                </div>
                
                <h3 style="color: ${CONFIG.COLORS.primary}; margin: 25px 0 15px;">Detailed Review</h3>
                <div id="review-container"></div>
                
                <button class="restart-btn" id="restart-btn">🔄 Restart Quiz</button>
            </div>
        `;
        
        // Render review for each question
        renderReview(results.reviewData);
        
        // Add restart button listener
        document.getElementById('restart-btn').addEventListener('click', restartQuiz);
    }
    
    // Render detailed review
    function renderReview(reviewData) {
        const container = document.getElementById('review-container');
        
        reviewData.forEach((review, index) => {
            const question = quizState.questions[index];
            const isCorrect = review.isCorrect;
            const userAnswerIndex = quizState.userAnswers[index];
            
            const reviewElement = document.createElement('div');
            
            let statusClass = '';
            let statusText = '';
            if (userAnswerIndex === undefined) {
                statusClass = 'unanswered';
                statusText = 'Unanswered';
            } else if (isCorrect) {
                statusClass = 'correct';
                statusText = 'Correct';
            } else {
                statusClass = 'incorrect';
                statusText = 'Incorrect';
            }
            
            reviewElement.className = `review-question ${statusClass}`;
            
            let userAnswerHtml = '';
            if (userAnswerIndex !== undefined) {
                const userAnswerClass = isCorrect ? 'correct' : 'incorrect';
                userAnswerHtml = `
                    <div class="user-answer ${userAnswerClass}">
                        <strong>Your Answer:</strong> ${String.fromCharCode(65 + userAnswerIndex)}) ${escapeHtml(question.options[userAnswerIndex])}
                    </div>
                `;
            } else {
                userAnswerHtml = '<div class="unanswered-text"><strong>Your Answer:</strong> You skipped this question</div>';
            }
            
            const correctAnswerHtml = `
                <div class="correct-answer">
                    <strong>Correct Answer:</strong> ${String.fromCharCode(65 + question.correctAnswerIndex)}) ${escapeHtml(question.options[question.correctAnswerIndex])}
                </div>
            `;
            
            const explanationHtml = question.explanation ? 
                `<div class="explanation unicode-support">
                    <span class="explanation-title">Explanation:</span>
                    ${escapeHtml(question.explanation)}
                </div>` : '';
            
            reviewElement.innerHTML = `
                <div class="review-header">
                    <div class="question-number">Question ${index + 1}</div>
                    <div class="question-status status-${statusClass}">${statusText}</div>
                </div>
                <div class="question-text unicode-support">${escapeHtml(question.question)}</div>
                ${userAnswerHtml}
                ${correctAnswerHtml}
                ${explanationHtml}
            `;
            
            container.appendChild(reviewElement);
        });
    }
    
    // Calculate results
    function calculateResults() {
        let correct = 0;
        let incorrect = 0;
        let unanswered = 0;
        const reviewData = [];
        
        quizState.questions.forEach((question, index) => {
            const userAnswer = quizState.userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswerIndex;
            
            if (userAnswer === undefined) {
                unanswered++;
            } else if (isCorrect) {
                correct++;
            } else {
                incorrect++;
            }
            
            reviewData.push({
                isCorrect,
                userAnswer,
                correctAnswer: question.correctAnswerIndex
            });
        });
        
        return {
            correct,
            incorrect,
            unanswered,
            timeTaken: quizState.elapsedSeconds,
            reviewData
        };
    }
    
    // Restart quiz
    function restartQuiz() {
        clearInterval(quizState.timerInterval);
        
        quizState = {
            questions: quizState.questions,
            currentIndex: 0,
            userAnswers: {},
            startTime: null,
            timerInterval: null,
            elapsedSeconds: 0,
            isSubmitted: false,
            isStarted: false
        };
        
        // Clear saved progress
        if (typeof Storage !== 'undefined') {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
        }
        
        showStartScreen();
    }
    
    // Save progress to localStorage
    function saveProgress() {
        if (typeof Storage !== 'undefined') {
            const progress = {
                userAnswers: quizState.userAnswers,
                currentIndex: quizState.currentIndex,
                elapsedSeconds: quizState.elapsedSeconds,
                isStarted: true
            };
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(progress));
        }
    }
    
    // Load progress from localStorage
    function loadProgress() {
        if (typeof Storage !== 'undefined') {
            try {
                const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
                if (saved) {
                    const progress = JSON.parse(saved);
                    quizState.userAnswers = progress.userAnswers || {};
                    quizState.currentIndex = progress.currentIndex || 0;
                    quizState.elapsedSeconds = progress.elapsedSeconds || 0;
                    quizState.isStarted = progress.isStarted || false;
                }
            } catch (e) {
                console.warn('Failed to load saved progress:', e);
            }
        }
    }
    
    // Format time in MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Handle window resize
    function handleResize() {
        // Re-render scroller on resize for better mobile experience
        if (quizState.isStarted && !quizState.isSubmitted && elements.scroller) {
            renderQuestionScroller();
        }
    }
    
    // Show error message
    function showError(message) {
        if (elements.container) {
            elements.container.innerHTML = `<div class="error-message">${escapeHtml(message)}</div>`;
        } else {
            document.body.innerHTML = `<div style="padding: 20px; color: red;">${escapeHtml(message)}</div>`;
        }
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        if (!text) return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
