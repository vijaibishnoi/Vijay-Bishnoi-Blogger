# Blogger Quiz Plugin by Vijay Bishnoi

A fully responsive, feature-rich quiz application that runs entirely in the browser. This single-file JavaScript application can be easily embedded in any website or blog (including Blogger) with no dependencies.

![Quiz App Preview](https://img.shields.io/badge/Quiz-App-brightgreen) ![Responsive](https://img.shields.io/badge/Responsive-Yes-blue) ![No Dependencies](https://img.shields.io/badge/Dependencies-None-green)

## 🌟 Features

- **Self-contained**: Single JavaScript file, no dependencies
- **Responsive Design**: Perfectly works on mobile, tablet, and desktop
- **Hindi/Unicode Support**: Full support for Hindi and other Unicode languages
- **Progress Saving**: Automatically saves progress using localStorage
- **Detailed Results**: Comprehensive score breakdown with answer explanations
- **Timer**: Tracks total time taken for the quiz
- **Question Navigation**: Easy navigation between questions with visual indicators
- **Clean Interface**: Modern, user-friendly design

## 📋 Prerequisites

- A web hosting service (GitHub Pages, Netlify, Vercel, etc.)
- Or a blog platform (Blogger, WordPress, etc.)
- Basic knowledge of HTML and JSON

## 🚀 Quick Start

### Method 1: Direct Script Inclusion

Add this to your HTML page:

```html
<!-- Container where quiz will appear -->
<div id="quiz-container"></div>

<!-- Quiz data (can be placed anywhere in the body) -->
<script type="application/json" id="quizData">
[
  {
    "question": "What is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "correctAnswerIndex": 1,
    "explanation": "Basic addition: 2 + 2 equals 4"
  },
  {
    "question": "Which planet is known as the Red Planet?",
    "options": ["Earth", "Mars", "Jupiter", "Venus"],
    "correctAnswerIndex": 1,
    "explanation": "Mars is called the Red Planet due to iron oxide on its surface"
  }
]
</script>

<!-- Load the quiz application -->
<script src="https://cdn.jsdelivr.net/gh/vijaibishnoi/Vijay-Bishnoi-Blogger@main/quiz.min.js"></script>
```

### Method 2: Using a Global Variable

```html
<script>
window.quizData = [
  {
    "question": "हिंदी में प्रश्न",
    "options": ["विकल्प १", "विकल्प २", "विकल्प ३", "विकल्प ४"],
    "correctAnswerIndex": 0,
    "explanation": "स्पष्टीकरण यहाँ"
  }
];
</script>
<script src="https://cdn.jsdelivr.net/gh/vijaibishnoi/Vijay-Bishnoi-Blogger@main/quiz.min.js"></script>
```

## 📝 Creating Quiz Data

### JSON Structure

The quiz data must follow this exact format:

```json
[
  {
    "question": "Your question here (can include Hindi/Unicode)",
    "options": [
      "Option 1 text",
      "Option 2 text", 
      "Option 3 text",
      "Option 4 text"
    ],
    "correctAnswerIndex": 0,
    "explanation": "Optional explanation for the answer"
  }
]
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | String | ✅ | The question text (supports HTML entities for Unicode) |
| `options` | Array | ✅ | Exactly 4 answer options |
| `correctAnswerIndex` | Number | ✅ | Index of correct answer (0-3) |
| `explanation` | String | ❌ | Optional explanation shown in results |

### Prompt Templates for Different Subjects

#### For General Knowledge Quiz:
```json
[
  {
    "question": "Which country is known as the Land of the Rising Sun?",
    "options": ["China", "Japan", "Thailand", "South Korea"],
    "correctAnswerIndex": 1,
    "explanation": "Japan is called the Land of the Rising Sun because it lies to the east of the Asian mainland."
  },
  {
    "question": "Who wrote 'Romeo and Juliet'?",
    "options": ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    "correctAnswerIndex": 1,
    "explanation": "William Shakespeare wrote the famous tragedy 'Romeo and Juliet'."
  }
]
```

#### For Science Quiz:
```json
[
  {
    "question": "What is the chemical symbol for Gold?",
    "options": ["Go", "Gd", "Au", "Ag"],
    "correctAnswerIndex": 2,
    "explanation": "Gold's chemical symbol is Au, from Latin 'aurum' meaning shining dawn."
  },
  {
    "question": "Which gas do plants absorb during photosynthesis?",
    "options": ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    "correctAnswerIndex": 1,
    "explanation": "Plants absorb carbon dioxide (CO₂) and release oxygen during photosynthesis."
  }
]
```

#### For Math Quiz:
```json
[
  {
    "question": "What is 15% of 200?",
    "options": ["15", "30", "20", "25"],
    "correctAnswerIndex": 1,
    "explanation": "15% of 200 = (15/100) × 200 = 30"
  },
  {
    "question": "What is the value of π (pi) to two decimal places?",
    "options": ["3.14", "3.16", "3.12", "3.18"],
    "correctAnswerIndex": 0,
    "explanation": "π is approximately 3.14159, so 3.14 to two decimal places."
  }
]
```

#### For Hindi Language Quiz:
```json
[
  {
    "question": "&#2360;&#2366;&#2350;&#2366;&#2344;&#2381;&#2351; &#2350;&#2366;&#2352;&#2381;&#2327; &#2325;&#2366; &#2346;&#2381;&#2352;&#2340;&#2367;&#2352;&#2379;&#2343; &#2325;&#2381;&#2351;&#2366; &#2361;&#2376;?",
    "options": ["&#2357;&#2367;&#2358;&#2375;&#2359; &#2350;&#2366;&#2352;&#2381;&#2327;", "&#2335;&#2377;&#2336;&#2368; &#2350;&#2366;&#2352;&#2381;&#2327;", "&#2340;&#2375;&#2332; &#2350;&#2366;&#2352;&#2381;&#2327;", "&#2350;&#2344;&#2381;&#2340;&#2352;&#2339; &#2350;&#2366;&#2352;&#2381;&#2327;"],
    "correctAnswerIndex": 1,
    "explanation": "&#2360;&#2366;&#2350;&#2366;&#2344;&#2381;&#2351; &#2350;&#2366;&#2352;&#2381;&#2327; &#2325;&#2366; &#2346;&#2381;&#2352;&#2340;&#2367;&#2352;&#2379;&#2343; &#2335;&#2377;&#2336;&#2368; &#2350;&#2366;&#2352;&#2381;&#2327; &#2361;&#2376;&#2404;"
  }
]
```

## 🔧 Customization

### Changing Colors
Edit these values in the JavaScript file (around line 15):

```javascript
COLORS: {
    primary: '#3498db',     // Main blue color
    secondary: '#2ecc71',   // Green color
    accent: '#e74c3c',      // Red accent
    correct: '#27ae60',     // Correct answer color
    incorrect: '#e74c3c',   // Incorrect answer color
    // ... more colors
}
```

### Changing Container ID
By default, the quiz looks for a container with ID `quiz-container`. To change:

1. In your HTML: `<div id="my-quiz-container"></div>`
2. In the JavaScript file, change: `QUIZ_CONTAINER_ID: 'my-quiz-container'`

## 📱 Usage Instructions

### For Users:
1. Click "Start Quiz" to begin
2. Select an answer by clicking on an option
3. Use navigation buttons or question scroller to move between questions
4. Click "Submit Quiz" when finished
5. Review results with detailed explanations

### For Quiz Creators:
1. Create JSON data following the structure above
2. Include the JSON in your HTML page
3. Load the JavaScript file
4. The quiz will automatically initialize

## 🛠️ Development

### Local Testing
1. Download `quiz-app.js`
2. Create an HTML file with quiz data
3. Open in a web browser

### Building Custom Version
To modify the quiz:
1. Clone the repository
2. Edit `quiz-app.js`
3. Test locally
4. Deploy to your hosting service

## 📊 Features in Detail

### Quiz Interface
- **Start Screen**: Welcome screen with quiz instructions
- **Timer**: Real-time timer tracking total elapsed time
- **Question Counter**: Shows current question and total count
- **Visual Indicators**: Color-coded question status
- **Progress Bar**: Visual completion indicator

### Navigation
- **Previous/Next Buttons**: Sequential navigation
- **Question Scroller**: Jump to any question directly
- **Answered Status**: Visual indication of answered questions
- **Current Question Highlight**: Clearly shows current position

### Results Screen
- **Score Summary**: Correct, incorrect, unanswered counts
- **Time Taken**: Total time for the quiz
- **Accuracy Percentage**: Overall performance metric
- **Detailed Review**: Each question with user's answer and correct answer
- **Explanations**: Shows explanations if provided
- **Color-coded Feedback**: Green for correct, red for incorrect

## 🔒 Data Handling

### Storage
- Uses `localStorage` to save progress
- Progress persists even if browser is closed
- Users can continue where they left off
- Data is cleared when quiz is restarted

### Privacy
- No data is sent to external servers
- All processing happens in the browser
- No user tracking or analytics

## 🌐 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Opera 47+
- Mobile browsers (iOS Safari, Chrome for Android)

## 🚨 Troubleshooting

### Common Issues

1. **Quiz not appearing**
   - Check if container ID matches
   - Verify JSON syntax is valid
   - Check browser console for errors

2. **Hindi text not displaying correctly**
   - Ensure JSON uses HTML entities for special characters
   - Verify the decoding function is working

3. **Progress not saving**
   - Check if browser supports localStorage
   - Ensure cookies are enabled

4. **Mobile display issues**
   - The app is responsive, but check viewport meta tag
   - Add: `<meta name="viewport" content="width=device-width, initial-scale=1">`

### Debugging
Open browser console (F12) and check for:
- JSON parsing errors
- Missing elements
- JavaScript errors

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues, questions, or suggestions:
1. Open an issue on GitHub
2. Provide detailed information about the problem
3. Include code samples if possible

## 🎯 Tips for Quiz Creators

1. **Keep questions clear and concise**
2. **Make options distinct and plausible**
3. **Use explanations to teach, not just correct**
4. **Test your quiz on multiple devices**
5. **Keep quizzes manageable (20-30 questions ideal)**

## 📚 Example Quiz

Check the `examples/` directory for complete quiz examples on various topics.

---

**Happy Quizzing!** 🎓
