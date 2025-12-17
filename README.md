# InsightPilot

    Small web app with `Index.html`, `script.js`, and `style.css.
Open `Index.html` in a browser to run the app.
The Story
InsightPilot was born out of a challenge: How do you provide professional-grade strategy in seconds? As a developer starting with very limited web design experience, this project was a race against time. Joining the hackathon late meant focusing on structural integrity and user experience (UX). The result is a resilient, polished dashboard that proves high-quality design is about clean logic and thoughtful layout.
Features and UX Innovation
• Intelligent Layout: A 75/25 split dashboard built with CSS Grid, featuring a sticky sidebar for persistent access to report history.
• Adaptive Header: A custom-engineered header that compresses to save vertical space but expands on hover to reveal full branding—a demonstration of complex CSS transitions.
• Theme Engine: A full Dark/Light mode implementation using CSS variables and localStorage for a persistent, professional aesthetic.
• Data Sanitization: A robust JavaScript layer that cleans raw CSV input, ensuring that extra spaces or empty rows do not break the visualization.
• Strategic Alerts: Real-time data scanning that flags critical metrics before the full analysis is even generated.
Technical Implementation
The Stack
• Frontend: HTML5, CSS3 (Modern Grid and Flexbox)
• Logic: Vanilla JavaScript (ES6+)
• Charts: Chart.js (Dual-axis integration)
Code Highlights
The project prioritized clean, dependency-free code. By avoiding heavy frameworks, the application achieves a lightning-fast loading speed and high performance.
Challenges Overcome
• The Learning Curve: Starting with low web design skills, it was necessary to rapidly master CSS Grid and transition logic to ensure the expanding header did not break the layout flow.
• The Time Crunch: Due to a late start, the focus was shifted to a Mock AI Engine over a live API. This allowed for the perfection of the UX and data-handling architecture first, creating a plug-and-play structure for future LLM integration.
Future Roadmap
1. Live LLM Integration: Connecting to the Gemini or GPT API for real-time, genuine strategic narratives.
2. Multi-File Support: Allowing cross-functional analysis between Sales, Marketing, and Finance datasets.
3. Advanced Exporting: Moving beyond JSON to professional PDF report generation.
How to Use
1. Clone the repository.
2. Open index.html in any browser.
3. Use the pre-loaded sample data or upload a custom .csv to see the engine in action.
