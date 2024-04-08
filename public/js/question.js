// Global variables

let team_id = document.getElementById("team_id").value;
let currentindex = 0;
let masks = document.querySelectorAll('.mask');
let questionContainer = document.querySelector('.questio_container .question');
let optionsContainer = document.querySelector('.questio_container .showQuestions');
let submitButton = document.querySelector('.questio_container .buttons .submit');
let quessButton = optionsContainer.querySelector(".optionsContainer");
let quessInput = optionsContainer.querySelector("#guessImage");
let closeguess = optionsContainer.querySelector(".closeguess");
let currentQuestionResponse; // Variable to store the current question response
let currentRound;
let currentRoundImage =  {};
let currentRoundImageQuestion;
let team;
let answeredQuestions = [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false
];

let round1 = "15:00";
let round2 = "15:00";
let round3 = "15:00";


let currentTime;

// Set the timer for 10 minutes
const timerDuration = 15 * 60 * 1000; // 10 minutes in milliseconds

// Get the current time
let startTime = localStorage.getItem("startTime");
if (!startTime) {
    startTime = Date.now();
    localStorage.setItem("startTime", startTime);
} else {
    startTime = parseInt(startTime);
}

// Function to update the timer display
function updateTimer() {
    const currentTimeLocal = Date.now();
    const elapsedTime = currentTimeLocal - startTime;
    const remainingTime = timerDuration - elapsedTime;

    // Calculate minutes and seconds
    const minutes = Math.floor(remainingTime / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    // Display the remaining time
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const displaySeconds = seconds < 10 ? `0${seconds}` : seconds;
    document.getElementById("timer").textContent = `${displayMinutes}:${displaySeconds}`;
    currentTime = `${displayMinutes}:${displaySeconds}`;

    // Check if the timer has finished
    if (remainingTime <= 0) {
        clearInterval(timerInterval);
        document.getElementById("timer").textContent = "Time's up!";
        localStorage.clear();
        alert("Time's up! Switching to new round");
        setTimeLapse(team_id);
    }
}

// Update the timer display every second
const timerInterval = setInterval(updateTimer, 1000);

// Restore timer if page was refreshed
const storedTime = localStorage.getItem("currentTime");
if (storedTime) {
    const storedStartTime = parseInt(localStorage.getItem("startTime"));
    const elapsedTime = parseInt(storedTime) - storedStartTime;
    startTime = storedStartTime - elapsedTime;
}

// Store current time to localStorage every second
setInterval(() => {
    localStorage.setItem("currentTime", Date.now());
}, 1000);


let full_screen = document.querySelector(".full_screen");

full_screen.addEventListener("click",()=>{
    full_screen.classList.toggle("active");
    full_screen.parentElement.classList.toggle("active");
})

setTimeout(() => {
    if (currentRound == "round1") {
        currentRoundImage = team.round1_image;
        document.querySelector(".currentround").innerHTML = '<i class="fab fa-python icon"></i> PYTHON';
        document.querySelector(".currentroundTitle").innerHTML = 'Round 1 ';
    }else if (currentRound == "round2") {
        currentRoundImage = team.round2_image;
        document.querySelector(".currentroundTitle").innerHTML = 'Round 2';
        document.querySelector(".currentround").innerHTML = '<i class="fab fa-cuttlefish icon"></i> C';
    }else{
        currentRoundImage = team.round3_image;
        document.querySelector(".currentroundTitle").innerHTML = 'Round 3 ';
        document.querySelector(".currentround").innerHTML = '<i class="fab fa-java icon"></i>JAVA';
    }

    document.querySelector(".image").setAttribute("src","/assets/img/"+(currentRoundImage.image_url));
    // console.log(currentRoundImage.Image_name);
    // console.log(currentRoundImage.Image_name);

}, 1000);


let profile = document.querySelector(".profile");

profile.addEventListener("click", ()=>{
    document.querySelector(".menu_options").classList.toggle("active");
});

let side_button = document.querySelector(".side_button");
let side_bar = document.querySelector(".side_bar");
let main = document.querySelector(".main");

side_button.addEventListener("click",()=>{
    side_button.classList.toggle("active");
    side_bar.classList.toggle("active");
    main.classList.toggle("active");
});

function skipround(){
    let confirmationMessage = confirm("Are you sure.. dou you want to skip the round..?");
    if (confirmationMessage) {
        fetch(`/skipround/${team_id}/${currentTime}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data =>{
           console.log(data);
           localStorage.clear();
           window.location.href = ""; 
        })
        .catch(error => {
            console.error('Error updating answered questions:', error);
        });
    }
}

function submit(){
    if(optionsContainer.querySelector("#guessImage").value.trim().toLowerCase().includes(currentRoundImage.Image_name.trim().toLowerCase())){
        document.getElementById("victoryAudio").play();
        alert("Wow Correct Answer...!\nSwitching to new step");
        setImageFound(team_id);
    }else{
        alert("wrong Guess");
        closeGuess()
    }
}

function displayGuess(){
    questionContainer.innerHTML = ``;
    optionsContainer.innerHTML = (`
        <div>
            QN:${currentRoundImage.Image_qn ? currentRoundImage.Image_qn: "Guess the image...?!"}
        </div>
        <button class="closeguess" onclick="closeGuess()">X</button> 
        <input type="text" name="quessImage" id="guessImage"> 
        <br>
        <button class="guessButton"  onclick="submitGuess()">guess</button> 
    `);
    submitButton.style.display = "none"
}

function closeGuess(){
    submitButton.style.display = "block"
    let newIndex = answeredQuestions.indexOf(false);
        if (newIndex == -1) {
            optionsContainer.innerHTML = ` 
            <p class="highlight"><i class="fas fa-hand-point-right"></i> No more Options you have .... you have failed to found the image...😭 </p>
            <button class="skip"  onclick="skipround()"><i class="fas fa-forward"></i> Skip to next round</button> 
        `
        }else{
            optionsContainer.innerHTML = ` 
            <p class="highlight"><i class="fas fa-hand-point-right"></i>Select any other question from the grid..❓</p>
        `
        }
}
function checkAnswers(){
    masks.forEach(function(mask, index){
        masks.forEach(ms => {
            ms.classList.remove("clicked");
        });
        if (answeredQuestions[index] == true) {
            mask.classList.add("active");
        }else{
            mask.classList.remove("active");
        }
        mask.classList.add("clicked");
    })
}

function getTeamDetails(teamid){
    let xhr = new XMLHttpRequest();
    document.querySelector(".load_question").classList.add("active");
    xhr.open('GET', '/details/' + teamid, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let response;
                try {
                    response = JSON.parse(xhr.responseText);
                    console.log("Response:", response);
                    document.querySelector(".load_question").classList.remove("active");
                } catch (error) {
                    console.error("Error parsing response:", error);
                    return;
                }
                if (response.success) {
                    answeredQuestions = response.team.AnsweredQuestions;
                    currentRound = response.team.currentRound;
                    // currentRoundImage = response.team;
                    team = response.team
                    console.log(currentRoundImage);
                    document.querySelector(".imagefound").innerHTML = response.team.images_found
                    document.querySelector(".score").innerHTML = response.team.score
                    document.querySelector(".attempts").innerHTML = response.team.attempts
                    checkAnswers()
                    console.log(answeredQuestions);
                } else {
                    console.error("Error:", response.message);
                }
            } else {
                console.error("Error:", xhr.status);
            }
        }
    };
    xhr.send();
}

getTeamDetails(team_id);


// Function to set timeLapsed update
function setTimeLapse(teamId) {
    let timeLapseXhr = new XMLHttpRequest();
    timeLapseXhr.open('PUT', '/timeLapse', true);
    timeLapseXhr.setRequestHeader('Content-Type', 'application/json');
    timeLapseXhr.onreadystatechange = function() {
        if (timeLapseXhr.readyState === XMLHttpRequest.DONE) {
            if (timeLapseXhr.status === 200) {
                // Check if there's a redirection
                const response = JSON.parse(timeLapseXhr.responseText);
                if (response.redirectTo) {
                    // Redirect to the specified URL
                    window.location.href = response.redirectTo;
                } else {
                    // Handle success
                    checkAnswers();
                    window.location.href = "";
                    console.log("Time Lapse Added");
                }
            } else {
                console.error("Error updating Guess:", timeLapseXhr.status);
            }
        }
    };
    timeLapseXhr.send(JSON.stringify({ teamId: teamId }));
}


// Function to send image update
function setImageFound(teamId) {
    let updateImageFoundXhr = new XMLHttpRequest();
    updateImageFoundXhr.open('PUT', '/updateImageFound', true);
    updateImageFoundXhr.setRequestHeader('Content-Type', 'application/json');
    updateImageFoundXhr.onreadystatechange = function() {
        if (updateImageFoundXhr.readyState === XMLHttpRequest.DONE) {
            if (updateImageFoundXhr.status === 200) {
                // Check if there's a redirection
                try {
                    const response = JSON.parse(updateImageFoundXhr.responseText);
                    if (response.redirectTo) {
                        // Redirect to the specified URL
                        window.location.href = response.redirectTo;
                    } else {
                        // Handle success
                        checkAnswers();
                        localStorage.clear();
                        window.location.href = "";
                        console.log("correct Guess added");
                    }
                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
            } else {
                console.error("Error updating Guess:", updateImageFoundXhr.status);
            }
        }
    };
    updateImageFoundXhr.send(JSON.stringify({ teamId: teamId, time: currentTime }));
}




// Function to send attempt update
function sendAttemptUpdate(teamId) {
    let updateAttemptXhr = new XMLHttpRequest();
    updateAttemptXhr.open('PUT', '/updateAttempt', true);
    updateAttemptXhr.setRequestHeader('Content-Type', 'application/json');
    updateAttemptXhr.onreadystatechange = function() {
        if (updateAttemptXhr.readyState === XMLHttpRequest.DONE) {
            if (updateAttemptXhr.status === 200) {
                checkAnswers()
                console.log("Attempt updated successfully");
            } else {
                console.error("Error updating attempt:", updateAttemptXhr.status);
            }
        }
    };
    updateAttemptXhr.send(JSON.stringify({ teamId: teamId }));
}

// Function to send score update
function sendScoreUpdate(teamId, increment) {
    let updateScoreXhr = new XMLHttpRequest();
    updateScoreXhr.open('PUT', '/updateScore', true);
    updateScoreXhr.setRequestHeader('Content-Type', 'application/json');
    updateScoreXhr.onreadystatechange = function() {
        if (updateScoreXhr.readyState === XMLHttpRequest.DONE) {
            if (updateScoreXhr.status === 200) {
                console.log("Score updated successfully");
                checkAnswers();
            } else {
                console.error("Error updating score:", updateScoreXhr.status);
            }
        }
    };
    updateScoreXhr.send(JSON.stringify({ teamId: teamId, increment: increment }));
}

// Function to get question details
function getQuestionDetails(index) {
    let xhr = new XMLHttpRequest();
    document.querySelector(".load_question").classList.add("active");
    xhr.open('GET', '/question/'+ currentRound +'/' + index, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let response;
                try {
                    response = JSON.parse(xhr.responseText);

                    // console.log("Response:", response);
                    document.querySelector(".load_question").classList.remove("active");
                } catch (error) {
                    console.error("Error parsing response:", error);
                    return;
                }
                if (response.success) {
                    currentQuestionResponse = response; // Store the response
                    console.log(currentQuestionResponse);
                    displayQuestion(response.question);
                } else {
                    console.error("Error:", response.message);
                }
            } else {
                console.error("Error:", xhr.status);
            }
        }
    };
    xhr.send();
}

// Function to display question details
function displayQuestion(question) {
    let language;
    console.log("log: ",question);
    
    if (currentRound == "round1") {
        language = "python"
    }else if (currentRound == "round2") {
        language = "c"
    }else{
        language = "java"
    }
    // Encode the question content to display it properly
    let encodedQuestion = question.Question.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    questionContainer.innerHTML = `<pre><code class="${language}">${encodedQuestion}</code></pre>`;
    optionsContainer.innerHTML = (`
     <p style="width:100%">Guess the Output ❓</p>
     <div>
     <pre>
        <label>
            <input type="radio" name="guessAnswer" value="A"> ${question.A.trim()}
        </label>
        <label>
            <input type="radio" name="guessAnswer" value="B"> ${question.B.trim()}
        </label>
        <label>
            <input type="radio" name="guessAnswer" value="C"> ${question.C.trim()}
        </label>
        <label>
            <input type="radio" name="guessAnswer" value="D"> ${question.D.trim()}
        </label>
        </pre>
    </div>
     
    `);

    // <p>${question.Answer}</p>

    submitButton.style.display = "block";
    submitButton.disabled = false;
    hljs.highlightAll();
}


function updateAnsweredQuestions(userId, questionIndex, value) {
    // Convert the boolean value to a string
    const boolValue = value.toString();
    
    fetch(`/updateAnsweredQuestions/${userId}/${questionIndex}/${boolValue}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok.');
    })
    .then(updatedUser => {
        // Optionally, handle the response from the backend
        getTeamDetails(updatedUser._id);
    })
    .catch(error => {
        console.error('Error updating answered questions:', error);
    });
}


// Event listener for mask click
document.addEventListener('DOMContentLoaded', function() {
    masks.forEach(function(mask, index) {
        mask.addEventListener('click', function() {
            console.log("Index:", index);
            currentindex = index;
            // localStorage.setItem("currentindex",currentindex);
            getQuestionDetails(index);
        });
    });



    // Handle submission of the answer
    submitButton.onclick = function() {
        if (currentQuestionResponse) {
            let selectedOption = optionsContainer.querySelector('input[type="radio"]:checked');
            if (selectedOption) {
                let selectedValue = selectedOption.value.trim();
                if (selectedValue === currentQuestionResponse.question.Answer) {
                    sendScoreUpdate(team_id, 1);
                    document.getElementById("correctAudio").play();
                    displayGuess();
                    updateAnsweredQuestions(team_id, currentindex, true);
                } else {
                    sendAttemptUpdate(team_id);
                    document.getElementById("wrongAudio").play();
                    updateAnsweredQuestions(team_id, currentindex, false);
                }
            } else {
                alert("Please select an option.");
            }
        } else {
            console.error("No question response available.");
        }
    };
});

function setMalpractice(type){
    fetch(`/updateMalpractice/${team_id}/${type}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok.');
    })
    .then(data =>{
        if (data.redirectTo) {
            console.log(data.redirectTo);
            window.location.href = `/${data.redirectTo}`;
        }
    })
    .catch(error => {
        console.error('Error updating answered questions:', error);
    });
}

// document.addEventListener("visibilitychange", function() {
//     if (document.visibilityState === 'hidden') {
//         let type = encodeURIComponent("open new tab or minimize the tab");
//         // User switched to another tab or minimized the window
//         setMalpractice(type);
//         console.log("User switched to another tab or minimized the window");

//     } else {
//         // User came back to the tab
//         console.log("User came back to the tab");
//     }
// });  

// window.addEventListener('beforeunload', function(event) {
//     // Show confirmation message
//     var confirmationMessage = 'Are you sure you want to reload the page?';
//     event.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
//     return confirmationMessage; // Gecko, WebKit, Chrome <34
//   });
//   console.log("page load");

// window.addEventListener('unload', function() {
//   // Make a fetch request when the page is about to reload
//   let type = encodeURIComponent("try to load the page");
//       // User switched to another tab or minimized the window
//       setMalpractice(type);
// });
  
