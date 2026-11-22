/* Trening wiedzy PWA – kompletna logika */
const SEED = {"subjects": [{"id": "filozofia", "name": "Filozofia", "tests": [{"id": "test1", "name": "Sprawdzian – klasa 1", "questions": [{"id": "f1", "text": "Antropologia to:", "options": ["Nauka poświęcona człowiekowi w różnych aspektach jego funkcjonowania.", "Światopogląd.", "Ideologia.", "Myślenie subiektywne, emocjonalne bez głębszej i krytycznej analizy rzeczywistości.", "Rozważa takie kwestie jak sens i cel istnienia człowieka."], "correct": [0], "explanation": "Antropologia bada człowieka: jego pochodzenie, budowę, kulturę i zachowanie."}, {"id": "f2", "text": "Logika języka:", "options": ["Wypowiedzi i zdania, którym można przypisać prawdę lub fałsz.", "Zdania w trybie oznajmującym.", "Bada, czy opisane wydarzenia mogły zdarzyć się naprawdę."], "correct": [0, 1], "explanation": "Chodzi o zdania oznajmujące, którym można przypisać prawdę albo fałsz."}, {"id": "f3", "text": "Funkcja ekspresywna wypowiedzi:", "options": ["Skłania do określonego zachowania.", "Wyraża emocje i uczucia.", "Wywołuje zmiany w rzeczywistości."], "correct": [1], "explanation": "Funkcja ekspresywna wyraża emocje nadawcy, np. radość lub złość."}, {"id": "f4", "text": "Definicja nominalna:", "options": ["Sprowadza się do ustalenia znaczenia samego słowa.", "Wyjaśnia znaczenie słowa poprzez podanie wyrazów z nim równoznacznych.", "Podaje wiele znaczeń danego słowa."], "correct": [0, 1], "explanation": "Definicja nominalna wyjaśnia, jak rozumieć dane wyrażenie, np. przez synonim."}, {"id": "f5", "text": "Definiens to:", "options": ["Człon definiowany.", "Człon definiujący.", "Definicja sprawozdawcza.", "Łącznik."], "correct": [1], "explanation": "Definiens objaśnia znaczenie terminu; definiendum jest terminem objaśnianym."}, {"id": "f6", "text": "Definicja za szeroka jest błędna dlatego że:", "options": ["Definiens jest szerszy od definiendum.", "Definiendum jest szersze od definiensa.", "Gdy definiens i definiendum się wykluczają.", "Żadna odpowiedź nie jest prawdziwa."], "correct": [0], "explanation": "Opis obejmuje więcej obiektów niż definiowany termin."}, {"id": "f7", "text": "Pojęcie ARCHE oznacza:", "options": ["Początek i zasadę.", "Archaiczny sposób rozumienia świata.", "Z którego wszystko powstało i do którego wszystko powraca.", "Wszystkie odpowiedzi są prawdziwe."], "correct": [0, 2], "explanation": "Arche to pierwotna zasada lub źródło rzeczywistości."}, {"id": "f8", "text": "Anaksymander twierdził, że:", "options": ["Wszystko wyłania się z bezkresu.", "Na początku był i nadal jest bezkres jako zasada i źródło wszelkiego istnienia.", "Wszystko wyłania się z wody.", "Ogień to ARCHE."], "correct": [0, 1], "explanation": "Anaksymander uznawał apeiron, czyli bezkres, za źródło wszystkiego."}, {"id": "f9", "text": "Arche dla Anaksymenesa był:", "options": ["Ogień.", "Woda.", "Powietrze.", "Próżnia."], "correct": [2], "explanation": "Anaksymenes uważał powietrze za podstawową zasadę świata."}, {"id": "f10", "text": "Tematyka pierwszych badań filozoficznych miała swoje źródło w:", "options": ["Średniowiecznych manuskryptach.", "Mitologii.", "Mitach teogonicznych.", "Mitach antropogenicznych.", "Mitach kosmogonicznych.", "Żadna odpowiedź nie jest prawdziwa."], "correct": [1, 2, 4], "explanation": "Wczesne pytania filozoficzne wyrastały z mitologii, opowieści o pochodzeniu bogów i powstaniu świata."}]}]}]};
const DB_KEY = "trening-wiedzy-v1";
const RANK_KEY = "trening-wiedzy-ranking-v2";
let db = loadDB();
let currentQuestions = [], roundQuestions = [], questionIndex = 0;
let roundAnswers = [], roundNumber = 1, testStartedAt = 0;
let activeTestId = null, activeTestName = "", activeSubjectName = "";
let cardQuestions = [], cardIndex = 0, cardBack = false;

const $ = id => document.getElementById(id);
const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[ch]));

function makeId() {
  return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() :
    "id-" + Date.now() + "-" + Math.random().toString(36).slice(2);
}
function normalizeQuestion(q, index) {
  return {
    id: String(q.id || makeId() || index),
    text: String(q.text ?? q.q ?? ""),
    options: Array.isArray(q.options) ? q.options : (Array.isArray(q.o) ? q.o : []),
    correct: (Array.isArray(q.correct) ? q.correct : (Array.isArray(q.c) ? q.c : [])).map(Number),
    explanation: String(q.explanation ?? q.e ?? "")
  };
}
function normalizeDB(source) {
  if (!source || !Array.isArray(source.subjects)) return structuredClone(SEED);
  source.subjects.forEach((s, si) => {
    if (!Array.isArray(s.tests)) s.tests = [];
    s.tests.forEach((t, ti) => {
      if (!t.id) t.id = "test-" + si + "-" + ti;
      if (!Array.isArray(t.questions)) t.questions = [];
      t.questions = t.questions.map(normalizeQuestion);
    });
  });
  return source;
}
function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? normalizeDB(JSON.parse(raw)) : structuredClone(SEED);
  } catch (e) {
    return structuredClone(SEED);
  }
}
function saveDB() {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  renderSelectors();
  renderMaterials();
}
function loadRanking() {
  try {
    const value = JSON.parse(localStorage.getItem(RANK_KEY) || "{}");
    return value && typeof value === "object" ? value : {};
  } catch (e) { return {}; }
}
function saveRanking(value) { localStorage.setItem(RANK_KEY, JSON.stringify(value)); }

function selectedSubject() {
  return db.subjects.find(s => s.id === $("sub").value) || db.subjects[0];
}
function selectedTest() {
  const subject = selectedSubject();
  return subject?.tests.find(t => t.id === $("test").value) || subject?.tests[0];
}
function chosenQuestions() { return selectedTest()?.questions || []; }
function updateTestSelect() {
  const subject = selectedSubject();
  const select = $("test");
  const previous = select.value;
  select.innerHTML = "";
  (subject?.tests || []).forEach(t => select.add(new Option(t.name, t.id)));
  if ([...select.options].some(o => o.value === previous)) select.value = previous;
  renderRanking();
}
function updateQuestionTestSelect() {
  const subject = db.subjects.find(s => s.id === $("qSub").value) || db.subjects[0];
  const select = $("qTest"), previous = select.value;
  select.innerHTML = "";
  (subject?.tests || []).forEach(t => select.add(new Option(t.name, t.id)));
  if ([...select.options].some(o => o.value === previous)) select.value = previous;
}
function renderSelectors() {
  ["sub","manageSub","qSub"].forEach(id => {
    const select = $(id), previous = select.value;
    select.innerHTML = "";
    db.subjects.forEach(s => select.add(new Option(s.name, s.id)));
    if ([...select.options].some(o => o.value === previous)) select.value = previous;
  });
  updateTestSelect();
  updateQuestionTestSelect();
}
function renderMaterials() {
  $("list").innerHTML = db.subjects.map(s =>
    `<div class="panel"><b>${esc(s.name)}</b><br>` +
    (s.tests.map(t => `${esc(t.name)} <span class="pill">${t.questions.length} pytań</span>`).join("<br>") || '<span class="muted">Brak sprawdzianów</span>') +
    `</div>`
  ).join("");
}
function setTab(id) {
  ["learn","quiz","cards","manage"].forEach(tab => $(tab).classList.toggle("hide", tab !== id));
  document.querySelectorAll("[data-tab]").forEach(button => button.classList.toggle("active", button.dataset.tab === id));
}
document.querySelectorAll("[data-tab]").forEach(button => button.addEventListener("click", () => setTab(button.dataset.tab)));
$("sub").addEventListener("change", updateTestSelect);
$("qSub").addEventListener("change", updateQuestionTestSelect);

function sameAnswerSet(selected, correct) {
  if (!Array.isArray(selected) || !Array.isArray(correct) || selected.length !== correct.length) return false;
  const a = [...selected].map(Number).sort((x,y)=>x-y);
  const b = [...correct].map(Number).sort((x,y)=>x-y);
  return a.every((value, index) => value === b[index]);
}
function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours) return `${hours} godz. ${minutes} min ${seconds} s`;
  if (minutes) return `${minutes} min ${seconds} s`;
  return `${seconds} s`;
}
function formatDate(iso) {
  try { return new Date(iso).toLocaleString("pl-PL", {dateStyle:"short", timeStyle:"short"}); }
  catch (e) { return ""; }
}
function rankingKey() { return `${activeSubjectName}::${activeTestId}`; }
function renderRanking(highlightId = null) {
  const key = activeTestId ? rankingKey() : (() => {
    const s = selectedSubject(), t = selectedTest();
    return s && t ? `${s.name}::${t.id}` : "";
  })();
  if (!key) { $("rankingList").innerHTML = '<p class="muted">Wybierz sprawdzian, aby zobaczyć ranking.</p>'; return; }
  const records = loadRanking()[key] || [];
  const sorted = [...records].sort((a,b) => a.elapsedMs - b.elapsedMs || a.completedAt.localeCompare(b.completedAt));
  if (!sorted.length) {
    $("rankingList").innerHTML = '<p class="muted">Brak ukończonych prób. Ukończ test, aby pojawić się w rankingu.</p>';
    return;
  }
  $("rankingList").innerHTML = sorted.slice(0,20).map((r,index) =>
    `<div class="rankrow" ${r.id === highlightId ? 'style="background:#eff6ff;border-radius:9px;padding-left:8px;padding-right:8px"' : ''}>
      <span class="ranknum">${index+1}.</span>
      <span><b>${esc(r.name)}</b><br><span class="muted">${formatDate(r.completedAt)} • ${r.rounds} rund</span></span>
      <b>${formatDuration(r.elapsedMs)}</b>
    </div>`
  ).join("");
}
function addRankingRecord(record) {
  const ranking = loadRanking();
  const key = rankingKey();
  ranking[key] = [...(ranking[key] || []), record]
    .sort((a,b) => a.elapsedMs - b.elapsedMs)
    .slice(0,100);
  saveRanking(ranking);
  return ranking[key].find(r => r.id === record.id);
}

function startLearn() {
  currentQuestions = chosenQuestions();
  questionIndex = 0;
  setTab("learn");
  renderLearnQuestion();
}
$("goLearn").addEventListener("click", startLearn);
function renderLearnQuestion() {
  const area = $("learnArea");
  if (!currentQuestions.length) { area.innerHTML = "<h2>Brak pytań</h2><p>Dodaj pytania w zakładce Moje materiały.</p>"; return; }
  const q = currentQuestions[questionIndex];
  area.innerHTML = `<p class="muted">Pytanie ${questionIndex+1}/${currentQuestions.length}</p>
    <h2>${esc(q.text)}</h2><p class="muted">Zaznacz wszystkie poprawne odpowiedzi. Każde pytanie obsługuje wielokrotny wybór.</p>
    <div id="learnOptions">${q.options.map((option,n)=>`<label class="choice"><input type="checkbox" name="learnAnswer" value="${n}"><span>${esc(option)}</span></label>`).join("")}</div>
    <button id="checkLearn">Sprawdź</button><button class="secondary" id="nextLearn" disabled>${questionIndex===currentQuestions.length-1?"Zakończ":"Następne"}</button><div id="learnFeedback"></div>`;
  document.querySelectorAll("#learnOptions input").forEach(input => input.addEventListener("change", () => input.closest(".choice").classList.toggle("selected", input.checked)));
  $("checkLearn").onclick = () => {
    const selected = [...document.querySelectorAll('input[name="learnAnswer"]:checked')].map(x=>+x.value);
    const correct = sameAnswerSet(selected,q.correct);
    $("learnFeedback").innerHTML = `<div class="${correct?"good":"bad"}"><b>${correct?"Poprawnie!":"Poprawne odpowiedzi:"}</b><p>${q.correct.map(n=>esc(q.options[n])).join("<br>")}</p><p>${esc(q.explanation)}</p></div>`;
    $("checkLearn").disabled = true; $("nextLearn").disabled = false;
  };
  $("nextLearn").onclick = () => {
    questionIndex++;
    if (questionIndex < currentQuestions.length) renderLearnQuestion();
    else {
      area.innerHTML = '<h2>Powtórka zakończona</h2><p>Przejrzałeś wszystkie pytania.</p><button id="learnAgain">Powtórz jeszcze raz</button>';
      $("learnAgain").onclick = startLearn;
    }
  };
}
$("goCards").addEventListener("click", () => { setTab("cards"); startCardsMenu(); });

function startQuiz() {
  const test = selectedTest(), subject = selectedSubject();
  if (!test || !test.questions.length) { $("quizArea").innerHTML = '<div class="bad">Ten sprawdzian nie zawiera pytań.</div>'; return; }
  activeTestId = test.id;
  activeTestName = test.name;
  activeSubjectName = subject.name;
  roundQuestions = [...test.questions];
  roundNumber = 1;
  questionIndex = 0;
  testStartedAt = Date.now();
  roundAnswers = [];
  setTab("quiz");
  $("rankingPanel").classList.remove("hide");
  renderRanking();
  renderQuizQuestion();
}
$("goQuiz").addEventListener("click", startQuiz);

function renderQuizQuestion() {
  if (questionIndex >= roundQuestions.length) { finishRound(); return; }
  const q = roundQuestions[questionIndex];
  $("quizArea").innerHTML = `<p class="muted">Runda ${roundNumber} • pytanie ${questionIndex+1}/${roundQuestions.length}</p>
    <div class="progress"><div style="width:${Math.round(questionIndex/roundQuestions.length*100)}%"></div></div>
    <h3>${esc(q.text)}</h3><p class="muted">Zaznacz wszystkie poprawne odpowiedzi. Możesz wybrać jedną lub kilka opcji.</p>
    <div id="quizOptions">${q.options.map((option,n)=>`<label class="choice"><input type="checkbox" name="quizAnswer" value="${n}"><span>${esc(option)}</span></label>`).join("")}</div>
    <button id="submitAnswer">Zatwierdź odpowiedź</button>`;
  document.querySelectorAll("#quizOptions input").forEach(input => input.addEventListener("change", () => input.closest(".choice").classList.toggle("selected", input.checked)));
  $("submitAnswer").onclick = () => {
    const selected = [...document.querySelectorAll('input[name="quizAnswer"]:checked')].map(x=>+x.value);
    if (!selected.length) { alert("Zaznacz przynajmniej jedną odpowiedź."); return; }
    roundAnswers.push({questionId:q.id, selected, correct:sameAnswerSet(selected,q.correct)});
    questionIndex++;
    renderQuizQuestion();
  };
}
function finishRound() {
  const wrong = [];
  roundQuestions.forEach((q,index) => {
    const result = roundAnswers[index];
    if (!result?.correct) wrong.push(q);
  });
  if (!wrong.length) {
    updateMissedFromTest(activeTestId, []);
    finishTest();
    return;
  }
  updateMissedFromTest(activeTestId, wrong.map(q => q.id));
  const correctCount = roundQuestions.length - wrong.length;
  $("quizArea").innerHTML = `<h2>Podsumowanie rundy ${roundNumber}</h2>
    <div class="bad"><b>${correctCount}/${roundQuestions.length} poprawnych odpowiedzi.</b>
    <p>Pozostało ${wrong.length} pytań do poprawy. W następnej rundzie wrócą tylko te pytania.</p></div>
    ${wrong.map(q=>`<div class="panel"><b>${esc(q.text)}</b><p><span class="muted">Prawidłowe odpowiedzi:</span><br>${q.correct.map(n=>esc(q.options[n])).join("<br>")}</p><p>${esc(q.explanation)}</p></div>`).join("")}
    <button id="retryWrong">Kontynuuj – popraw błędne (${wrong.length})</button>`;
  $("retryWrong").onclick = () => {
    roundQuestions = wrong;
    roundNumber++;
    questionIndex = 0;
    roundAnswers = [];
    renderQuizQuestion();
  };
}
function finishTest() {
  const elapsedMs = Date.now() - testStartedAt;
  const name = ($("playerName").value || "").trim().slice(0,24) || "Uczeń";
  const record = {
    id:makeId(), name, elapsedMs, rounds:roundNumber,
    questionCount:chosenQuestions().length, completedAt:new Date().toISOString()
  };
  addRankingRecord(record);
  $("quizArea").innerHTML = `<div class="good">
    <h2>Gratulacje! Wszystkie odpowiedzi są poprawne.</h2>
    <p>Ukończyłeś test po ${roundNumber} ${roundNumber===1?"rundzie":(roundNumber<5?"rundach":"rundach")}.</p>
    <p class="muted">Łączny czas od rozpoczęcia pierwszej rundy do ostatniej poprawnej odpowiedzi:</p>
    <div class="stat">${formatDuration(elapsedMs)}</div>
    <p>Wynik końcowy: 100% (${record.questionCount}/${record.questionCount}).</p>
  </div>
  <div class="panel"><h3>Twój wynik w rankingu</h3><p>Ranking sortowany jest od najkrótszego czasu ukończenia do najdłuższego.</p><div id="finalRanking"></div></div>
  <button id="newAttempt">Rozpocznij nową próbę</button>`;
  const key = rankingKey(), records = loadRanking()[key] || [];
  const sorted = [...records].sort((a,b)=>a.elapsedMs-b.elapsedMs);
  $("finalRanking").innerHTML = sorted.slice(0,20).map((r,n)=>
    `<div class="rankrow" ${r.id===record.id?'style="background:#eff6ff;border-radius:9px;padding-left:8px;padding-right:8px"':''}>
      <span class="ranknum">${n+1}.</span><span><b>${esc(r.name)}</b><br><span class="muted">${formatDate(r.completedAt)} • ${r.rounds} rund</span></span><b>${formatDuration(r.elapsedMs)}</b>
    </div>`
  ).join("");
  $("newAttempt").onclick = startQuiz;
  renderRanking(record.id);
}
function renderRanking(highlightId=null) {
  const subject = selectedSubject(), test = selectedTest();
  if (!subject || !test) { $("rankingList").innerHTML = '<p class="muted">Wybierz sprawdzian.</p>'; return; }
  const records = loadRanking()[`${subject.name}::${test.id}`] || [];
  const sorted = [...records].sort((a,b)=>a.elapsedMs-b.elapsedMs);
  $("rankingList").innerHTML = sorted.length ? sorted.slice(0,20).map((r,n)=>
    `<div class="rankrow" ${r.id===highlightId?'style="background:#eff6ff;border-radius:9px;padding-left:8px;padding-right:8px"':''}>
      <span class="ranknum">${n+1}.</span><span><b>${esc(r.name)}</b><br><span class="muted">${formatDate(r.completedAt)} • ${r.rounds} rund</span></span><b>${formatDuration(r.elapsedMs)}</b>
    </div>`
  ).join("") : '<p class="muted">Brak ukończonych prób. Ukończ test, aby pojawić się w rankingu.</p>';
}
$("test").addEventListener("change", renderRanking);

function startCardsMenu() {
  const all = chosenQuestions();
  const missedIds = new Set(JSON.parse(localStorage.getItem(missedKeyForSelected()) || "[]"));
  const missed = all.filter(q=>missedIds.has(q.id));
  $("cardArea").innerHTML = `<p>Wybierz rodzaj fiszek.</p>
    <button id="allCards">Wszystkie fiszki (${all.length})</button>
    <button id="missedCards" class="secondary" ${missed.length?"":"disabled"}>Fiszki z błędnych odpowiedzi (${missed.length})</button>
    <p class="muted">Fiszki błędnych odpowiedzi są aktualizowane po każdej ukończonej próbie testu.</p>`;
  $("allCards").onclick = () => { cardQuestions=all; cardIndex=0; cardBack=false; renderCard(); };
  $("missedCards").onclick = () => { cardQuestions=missed; cardIndex=0; cardBack=false; renderCard(); };
}
function missedKeyForSelected() {
  const t=selectedTest();
  return "trening-wiedzy-missed-v2-"+(t?.id||"default");
}
function updateMissedFromTest(testId, wrongIds) {
  const key = "trening-wiedzy-missed-v2-"+testId;
  localStorage.setItem(key, JSON.stringify(wrongIds));
}
function renderCard() {
  if (!cardQuestions.length) { $("cardArea").innerHTML = '<p>Brak fiszek w tym zestawie.</p>'; return; }
  const q=cardQuestions[cardIndex];
  $("cardArea").innerHTML = `<p class="muted">Fiszka ${cardIndex+1}/${cardQuestions.length}</p>
    <div class="panel" id="cardFlip"><h2>${cardBack?"Odpowiedź":"Pytanie"}</h2>
    <p>${cardBack?q.correct.map(n=>esc(q.options[n])).join("<br>"):esc(q.text)}</p>
    ${cardBack?`<p>${esc(q.explanation)}</p>`:""}</div>
    <button id="flipCard">Pokaż ${cardBack?"pytanie":"odpowiedź"}</button>
    <button class="secondary" id="prevCard" ${cardIndex===0?"disabled":""}>Wstecz</button>
    <button id="nextCard">${cardIndex===cardQuestions.length-1?"Zakończ":"Dalej"}</button>
    <button class="secondary" id="cardMenu">Wybór fiszek</button>`;
  $("flipCard").onclick = $("cardFlip").onclick = () => { cardBack=!cardBack; renderCard(); };
  $("prevCard").onclick = () => { cardIndex=Math.max(0,cardIndex-1); cardBack=false; renderCard(); };
  $("nextCard").onclick = () => { if(cardIndex<cardQuestions.length-1){cardIndex++;cardBack=false;renderCard();}else startCardsMenu(); };
  $("cardMenu").onclick = startCardsMenu;
}
$("goCards").addEventListener("click", () => { setTab("cards"); startCardsMenu(); });

$("addSub").onclick = () => {
  const name=$("newSub").value.trim();
  if(!name){alert("Wpisz nazwę przedmiotu.");return;}
  db.subjects.push({id:makeId(),name,tests:[]}); $("newSub").value=""; saveDB();
};
$("addTest").onclick = () => {
  const subject=db.subjects.find(s=>s.id===$("manageSub").value), name=$("newTest").value.trim();
  if(!subject||!name){alert("Wybierz przedmiot i wpisz nazwę sprawdzianu.");return;}
  subject.tests.push({id:makeId(),name,questions:[]}); $("newTest").value=""; saveDB();
};
$("addQ").onclick = () => {
  const subject=db.subjects.find(s=>s.id===$("qSub").value);
  const test=subject?.tests.find(t=>t.id===$("qTest").value);
  const options=$("qOpts").value.split("\n").map(x=>x.trim()).filter(Boolean);
  const correct=$("qCorrect").value.split(",").map(x=>Number(x.trim())-1);
  if(!test||!$("qText").value.trim()||options.length<2||!correct.length||correct.some(n=>!Number.isInteger(n)||n<0||n>=options.length)){
    alert("Uzupełnij pytanie, minimum 2 odpowiedzi i numery wszystkich poprawnych opcji.");return;
  }
  test.questions.push({id:makeId(),text:$("qText").value.trim(),options,correct,explanation:$("qExp").value.trim()});
  ["qText","qOpts","qCorrect","qExp"].forEach(id=>$(id).value="");
  saveDB(); alert("Pytanie dodane.");
};
$("export").onclick = () => {
  const blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="moje-zestawy-trening-wiedzy.json"; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
};
$("import").onclick = () => $("file").click();
$("file").onchange = async event => {
  try {
    const imported=normalizeDB(JSON.parse(await event.target.files[0].text()));
    if(confirm("Import zastąpi obecne materiały. Kontynuować?")){db=imported;saveDB();alert("Materiały zaimportowane.");}
  } catch(e) { alert("Nie udało się odczytać pliku JSON."); }
  event.target.value="";
};

renderSelectors();
renderMaterials();
renderRanking();
