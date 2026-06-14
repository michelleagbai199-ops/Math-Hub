// grabbing our HTML pages and input elements so we can manage them with code
const loginPage = document.getElementById('login-page');
const studentInput = document.getElementById('student-name');
const dashboardPage = document.getElementById('dashboard-page');
const quizPage = document.getElementById('quiz-page');
const resultsPage = document.getElementById('results-page');
const scoreHistoryGrid = document.getElementById('score-history-grid');

// global counters for managing timer clocks and test states
let currentIndex = 0;
let generatedQuestions = [];
let userAnswers = {};
let timeLeft = 60 * 60;
let countdown;
const totalTestQuestions = 40;

// MATH ENGINE: loops 40 times to build problems and calculate answers using eval()
function generatePureMathQuestions() {
    let list = [];
    const mathOperators = ['+', '-', '*','/'];

    for (let i = 0; i < totalTestQuestions; i++) {
        let op = mathOperators[Math.floor(Math.random() * mathOperators.length)];
        let num1 = Math.floor(Math.random() * 80) + 10; // pick number between 10-90
        let num2 = Math.floor(Math.random() * 15) + 1;  // pick number between 1-15

        let questionText = `What Is The Value Of: ${num1} ${op} ${num2}?`;
        
        // computer automatically computes the string math expression down to a number
        let computedAnswer = eval(`${num1} ${op} ${num2}`);
        
        // generating fake answers relative to the correct answer
        let wrong1 = computedAnswer + 3;
        let wrong2 = computedAnswer - 2;
        let wrong3 = computedAnswer * 2;

        let optionsPool = [String(computedAnswer), String(wrong1), String(wrong2), String(wrong3)];
        
        // mixes up the answers so the right one isn't always in the exact same spot
        optionsPool.sort(() => Math.random() - 0.5);

        list.push({ 
            q: questionText, 
            options: optionsPool, 
            a: String(computedAnswer) 
        });
    }
    return list;
}

// STORAGE GEARS: saving percentages and rendering them as dashboard history rectangles
function saveResultToMemory(percent) {
    let history = JSON.parse(localStorage.getItem('mathScores')) || [];
    history.push({ date: new Date().toLocaleDateString(), score: percent + "%" });
    localStorage.setItem('mathScores', JSON.stringify(history));
}

function renderDashboardHistory() {
    let history = JSON.parse(localStorage.getItem('mathScores')) || [];
    
    if (history.length === 0) {
        scoreHistoryGrid.innerHTML = "<p style='grid-column: 1/-1;'>No Practice Exam Logs Found. Start A New Session!</p>";
    } else {
        scoreHistoryGrid.innerHTML = history.map(item => `
            <div class="history-item-card">
                <span>TEST DATE: ${item.date}</span>
                <strong>ACCURACY: ${item.score}</strong>
            </div>
        `).join('');
    }
}

// ROUTING CONTROLLERS: handles switching screens when logging in or clicking buttons
function handlelogin() {
    const name = studentInput.value.trim();
    if (name === "") return alert("Please Enter Your Name To Authenticate!");
    
    document.getElementById('welcome-msg').innerText = "WELCOME BACK, " + name.toUpperCase();
    loginPage.classList.add('hidden');
    dashboardPage.classList.remove('hidden');
    renderDashboardHistory();
}

function startquiz() {
    dashboardPage.classList.add('hidden');
    quizPage.classList.remove('hidden');
    
    currentIndex = 0;
    userAnswers = {};
    generatedQuestions = generatePureMathQuestions(); 
    
    renderflashcard();
    startTimer();
}

// CARD RENDERER: paints one question inside the card, using horizontal button row layouts
function renderflashcard() {
    const container = document.getElementById('question-container');
    const item = generatedQuestions[currentIndex];

    // we map options directly into an inline horizontal button row layout
    container.innerHTML = `
        <h3 style="color:#881337; margin-bottom: 20px;">Question ${currentIndex + 1} Of ${totalTestQuestions}</h3>
        <p style="font-size:24px; margin-bottom: 25px; color:#4C0519;"><strong>${item.q}</strong></p>
        
        <div class="options-row-layout">
            ${item.options.map(opt => `
                <label class="choice-pill-label">
                    <input type="radio" name="q" value="${opt}" 
                    ${userAnswers[currentIndex] === opt ? 'checked' : ''} 
                    onchange="saveAnswer('${opt}')"> ${opt}
                </label>
            `).join('')}
        </div>
    `;

    // handles toggle states for back, next, and finish buttons outside the flashcard
    document.getElementById('prev-btn').style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
    
    if (currentIndex === totalTestQuestions - 1) {
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('submit-btn').classList.remove('hidden');
    } else {
        document.getElementById('next-btn').classList.remove('hidden');
        document.getElementById('submit-btn').classList.add('hidden');
    }
}

function saveAnswer(val) {
    userAnswers[currentIndex] = val;
}

function nextquestion() {
    currentIndex++;
    renderflashcard();
}

function prevquestion() {
    currentIndex--;
    renderflashcard();
}

// SCORE AND CLOCK: updates timer and tallies scores at final submission
function startTimer() {
    timeLeft = 60 * 60; 
    clearInterval(countdown);
    countdown = setInterval(() => {
        timeLeft--;
        let min = Math.floor(timeLeft / 60);
        let sec = timeLeft % 60;
        document.getElementById('timer').innerText = min + ":" + (sec < 10 ? "0" : "") + sec;
        if (timeLeft <= 0) submitquiz();
    }, 1000);
}

function submitquiz() {
    clearInterval(countdown);
    let correctCount = 0;
    
    generatedQuestions.forEach((q, i) => {
        if (userAnswers[i] === q.a) correctCount++;
    });

    let percent = Math.round((correctCount / totalTestQuestions) * 100);
    saveResultToMemory(percent); 
    
    quizPage.classList.add('hidden');
    resultsPage.classList.remove('hidden');
    
    document.getElementById('final-score').innerText = "PERCENTAGE ACCURACY: " + percent + "%";
    
    if (percent >= 70) {
        document.getElementById('grade-comment').innerText = "EXCELLENT PERFORMANCE! 🥳";
    } else if (percent >= 50) {
        document.getElementById('grade-comment').innerText = "GOOD JOB, CONTINUE PRACTICING. 👍";
    } else {
        document.getElementById('grade-comment').innerText = "KEEP STUDYING AND TRY AGAIN! 📚";
    }
}

function backtodashboard() {
    resultsPage.classList.add('hidden');
    dashboardPage.classList.remove('hidden');
    renderDashboardHistory(); 
}