document.addEventListener("DOMContentLoaded", () => {
    let startBtn = document.querySelector(".start-btn");
    let welcomeScreen = document.querySelector(".welcome-screen");
    let quizSection = document.querySelector(".quiz-content");
    let questionElement = document.getElementById("question");
    let answersContainer = document.querySelector(".answers");
    let scoreSection = document.querySelector(".score-section");
    let finalScore = document.getElementById("final-score");
    let restartBtn = document.querySelector(".restart-btn");
    let timerElement = document.getElementById("timer");
    let hintText = document.getElementById("hint");
    let hintBtn = document.querySelector(".hint-btn");

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let timer;
    let timeLeft = 30;
    let hintUsed = false;
    let selectedCategory = sessionStorage.getItem("selectedCategory") || "9";

    async function fetchQuestions(difficulty) {
        const questionCount = document.getElementById("question-count").value;
        const apiUrl = `https://opentdb.com/api.php?amount=${questionCount}&category=${selectedCategory}&difficulty=${difficulty}&type=multiple`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Failed to fetch questions!");

            const data = await response.json();
            if (!data.results || data.results.length === 0) {
                alert("No questions found. Please try again.");
                return;
            }

            questions = data.results;
            startGame();
        } catch (error) {
            console.error("Error fetching questions:", error);
            alert("Error loading questions. Please check your internet connection and try again.");
        }
    }

    function startGame() {
        welcomeScreen.classList.add("hidden");
        quizSection.classList.remove("hidden");
        scoreSection.classList.add("hidden");

        score = 0;
        currentQuestionIndex = 0;
        sessionStorage.setItem("hintUsed", "false");
        nextQuestion();
    }

    function nextQuestion() {
        if (currentQuestionIndex >= questions.length) {
            endGame();
            return;
        }
        hintText.textContent = "";
        hintText.classList.add("hidden");
        hintUsed = false;
        showQuestion(questions[currentQuestionIndex]);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function showQuestion(questionData) {
        document.getElementById("question-number").textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
        sessionStorage.setItem("currentCorrectAnswer", questionData.correct_answer);

        clearInterval(timer);
        timeLeft = 30;
        timerElement.textContent = timeLeft;
        timer = setInterval(updateTimer, 1000);

        questionElement.textContent = decodeEntities(questionData.question);
        answersContainer.innerHTML = "";

        const answers = shuffleArray([...questionData.incorrect_answers, questionData.correct_answer]);

        answers.forEach(answer => {
            const btn = document.createElement("button");
            btn.classList.add("answer-btn");
            btn.innerHTML = decodeEntities(answer);
            btn.onclick = () => checkAnswer(btn, answer, questionData.correct_answer);
            answersContainer.appendChild(btn);
        });
    }

    hintBtn.addEventListener("click", () => {
        const correctAnswer = sessionStorage.getItem("currentCorrectAnswer");
        if (!hintUsed && correctAnswer) {
            hintText.textContent = `Hint: The answer starts with '${correctAnswer.charAt(0)}'`;
            hintText.classList.remove("hidden");
            hintUsed = true;
        } else {
            hintText.textContent = "No hint available.";
            hintText.classList.remove("hidden");
        }
    });

    function updateTimer() {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            autoSubmitAnswer();
        }
    }

    function checkAnswer(button, selectedAnswer, correctAnswer) {
        clearInterval(timer);
        document.querySelectorAll(".answer-btn").forEach(btn => btn.disabled = true);

        if (selectedAnswer === correctAnswer) {
            button.classList.add("correct");
            score++;
        } else {
            button.classList.add("incorrect");
            document.querySelectorAll(".answer-btn").forEach(btn => {
                if (decodeEntities(btn.innerHTML) === correctAnswer) {
                    btn.classList.add("correct");
                }
            });
        }

        setTimeout(() => {
            currentQuestionIndex++;
            nextQuestion();
        }, 1500);
    }

    function endGame() {
        clearInterval(timer);
        quizSection.classList.add("hidden");
        scoreSection.classList.remove("hidden");
    
        const percentage = Math.round((score / questions.length) * 100);
        finalScore.textContent = `Your Score: ${score} / ${questions.length} (${percentage}%)`;
    
        let feedbackMessage = "";
        if (percentage >= 80) {
            feedbackMessage = "🔥 Amazing! You're a trivia master!";
        } else if (percentage >= 50) {
            feedbackMessage = "😊 Great job! You did well!";
        } else {
            feedbackMessage = "💡 Keep practicing! You'll do better next time!";
        }
        document.getElementById("feedback").textContent = feedbackMessage;
        //  Get the logged-in player's name
    let playerName = localStorage.getItem("username") || "Guest";

    //  Save to Leaderboard
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ name: playerName, score: score, date: new Date().toLocaleString() });

    //  Sort by highest score
    leaderboard.sort((a, b) => b.score - a.score);

    //  Limit leaderboard to top 10 scores
    leaderboard = leaderboard.slice(0, 10);

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    
        // Handle Highscore
        let highscore = localStorage.getItem("highscore") || 0;
        if (score > highscore) {
            localStorage.setItem("highscore", score);
            showHighscoreNotification();
        }
    }
    
    //  Function to Show Highscore Notification
    function showHighscoreNotification() {
        const notification = document.createElement("div");
        notification.classList.add("highscore-notification");
        notification.innerHTML = `
            🎉 New Highscore! 🎉
            <br>
            <span>${score} Points</span>
        `;
        document.body.appendChild(notification);
    
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    function decodeEntities(text) {
        const txt = document.createElement("textarea");
        txt.innerHTML = text;
        return txt.value;
    }

    startBtn.addEventListener("click", () => {
        const difficulty = document.getElementById("difficulty").value;
        fetchQuestions(difficulty);
    });

    restartBtn.addEventListener("click", () => {
        welcomeScreen.classList.remove("hidden");
        quizSection.classList.add("hidden");
        scoreSection.classList.add("hidden");
        score = 0;
        currentQuestionIndex = 0;
        questions = [];
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const backgroundAudio = document.getElementById("background-audio");

    function playAudio() {
        if (localStorage.getItem("soundEnabled") === "true") {
            backgroundAudio.volume = 0.5; // Adjust volume if needed
            backgroundAudio.play().then(() => {
                console.log("✅ Audio started automatically.");
            }).catch(error => {
                console.log("❌ Audio blocked by browser:", error);
            });
        } else {
            console.log("🔇 Sound is disabled in settings.");
        }
    }

    // Try playing audio immediately after page loads
    playAudio();

    // Ensure looping if it stops
    backgroundAudio.addEventListener("ended", () => {
        backgroundAudio.currentTime = 0;
        backgroundAudio.play();
    });
});

  















