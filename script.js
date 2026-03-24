// --- Firebase Auth ---
const authMsg = document.getElementById('auth-msg');

function signup(){
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;
  auth.createUserWithEmailAndPassword(email, pass)
      .then(userCredential=>{
        authMsg.innerText = "Signup successful!";
      }).catch(err=>authMsg.innerText = err.message);
}

function login(){
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, pass)
      .then(userCredential=>{
        document.getElementById('auth-section').style.display='none';
        document.getElementById('main-section').style.display='block';
        document.getElementById('user-name').innerText = email;
      }).catch(err=>authMsg.innerText=err.message);
}

function logout(){
  auth.signOut().then(()=>{
    document.getElementById('auth-section').style.display='block';
    document.getElementById('main-section').style.display='none';
  });
}

// --- Start Lesson ---
async function startLesson(){
  const subject = document.getElementById('subject').value;
  const grade = document.getElementById('grade').value;
  const response = await fetch(`subjects/${subject}.json`);
  const data = await response.json();
  const lesson = data[grade].lessons[0]; // first lesson for MVP
  localStorage.setItem('currentLesson', JSON.stringify(lesson));
  localStorage.setItem('currentSubject', subject);
  localStorage.setItem('currentGrade', grade);
  window.location.href='lesson.html';
}

// --- Lesson Page ---
let lesson = JSON.parse(localStorage.getItem('currentLesson'));
if(lesson && document.getElementById('lesson-title')){
  document.getElementById('lesson-title').innerText = lesson.title;
  document.getElementById('lesson-content').innerText = lesson.content;

  const quizDiv = document.getElementById('quiz');
  lesson.quiz.forEach((q,i)=>{
    quizDiv.innerHTML += `<p>${q.question}</p>`;
    q.options.forEach(opt=>{
      quizDiv.innerHTML += `<input type="radio" name="q${i}" value="${opt}"> ${opt}<br>`;
    });
  });
}

function submitQuiz(){
  let score=0;
  lesson.quiz.forEach((q,i)=>{
    const sel = document.querySelector(`input[name=q${i}]:checked`);
    if(sel && sel.value===q.answer) score++;
  });

  alert(`Your score: ${score}/${lesson.quiz.length}`);
  const user = auth.currentUser;
  if(user){
    db.collection('progress').doc(user.uid)
      .set({
        subject: localStorage.getItem('currentSubject'),
        grade: localStorage.getItem('currentGrade'),
        lesson: lesson.title,
        score: score,
        timestamp: Date.now()
      }, {merge:true});
  }
}

// --- AI Tutor ---
async function askAI(){
  const input = document.getElementById('userInput').value;
  const aiResponse = document.getElementById('aiResponse');

  // CALL OpenAI API or simple local responses
  if(input.toLowerCase().includes("math")) aiResponse.innerText="Math helps you solve problems.";
  else if(input.toLowerCase().includes("plant")) aiResponse.innerText="Plants make food via photosynthesis.";
  else aiResponse.innerText="Sorry, I don't know yet.";
}

// --- Dashboard ---
window.onload = ()=>{
  const dashboard = document.getElementById('dashboard-content');
  const user = auth.currentUser;
  if(dashboard && user){
    db.collection('progress').doc(user.uid).get().then(doc=>{
      if(doc.exists){
        dashboard.innerText=`Last lesson: ${doc.data().lesson}, Score: ${doc.data().score}`;
      } else dashboard.innerText="No progress yet.";
    });
  }
}
