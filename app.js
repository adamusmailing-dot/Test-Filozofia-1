const seed = {"subjects":[{"id":"filozofia","name":"Filozofia","tests":[{"id":"test1","name":"Sprawdzian – klasa 1","questions":[{"id":"1","text":"Antropologia to:","options":["Nauka poświęcona człowiekowi w różnych aspektach jego funkcjonowania.","Światopogląd.","Ideologia.","Myślenie subiektywne, emocjonalne bez głębszej i krytycznej analizy rzeczywistości.","Rozważa takie kwestie jak sens i cel istnienia człowieka."],"correct":[0],"multi":false,"explanation":"Antropologia bada człowieka: jego pochodzenie, budowę, kulturę i zachowanie."},{"id":"2","text":"Logika języka:","options":["Wypowiedzi i zdania, którym można przypisać prawdę lub fałsz.","Zdania w trybie oznajmującym.","Bada, czy opisane wydarzenia mogły zdarzyć się naprawdę."],"correct":[0,1],"multi":true,"explanation":"Chodzi o zdania oznajmujące, którym można przypisać prawdę albo fałsz."},{"id":"3","text":"Funkcja ekspresywna wypowiedzi:","options":["Skłania do określonego zachowania.","Wyraża emocje i uczucia.","Wywołuje zmiany w rzeczywistości."],"correct":[1],"multi":false,"explanation":"Funkcja ekspresywna wyraża emocje nadawcy, np. radość lub złość."},{"id":"4","text":"Definicja nominalna:","options":["Sprowadza się do ustalenia znaczenia samego słowa.","Wyjaśnia znaczenie słowa poprzez podanie wyrazów z nim równoznacznych.","Podaje wiele znaczeń danego słowa."],"correct":[0,1],"multi":true,"explanation":"Definicja nominalna wyjaśnia, jak rozumieć dane wyrażenie, np. przez synonim."},{"id":"5","text":"Definiens to:","options":["Człon definiowany.","Człon definiujący.","Definicja sprawozdawcza.","Łącznik."],"correct":[1],"multi":false,"explanation":"Definiens objaśnia znaczenie terminu; definiendum jest terminem objaśnianym."},{"id":"6","text":"Definicja za szeroka jest błędna dlatego że:","options":["Definiens jest szerszy od definiendum.","Definiendum jest szersze od definiensa.","Gdy definiens i definiendum się wykluczają.","Żadna odpowiedź nie jest prawdziwa."],"correct":[0],"multi":false,"explanation":"Opis obejmuje więcej obiektów niż definiowany termin."},{"id":"7","text":"Pojęcie ARCHE oznacza:","options":["Początek i zasadę.","Archaiczny sposób rozumienia świata.","Z którego wszystko powstało i do którego wszystko powraca.","Wszystkie odpowiedzi są prawdziwe."],"correct":[0,2],"multi":true,"explanation":"Arche to pierwotna zasada lub źródło rzeczywistości."},{"id":"8","text":"Anaksymander twierdził, że:","options":["Wszystko wyłania się z bezkresu.","Na początku był i nadal jest bezkres jako zasada i źródło wszelkiego istnienia.","Wszystko wyłania się z wody.","Ogień to ARCHE."],"correct":[0,1],"multi":true,"explanation":"Anaksymander uznawał apeiron, czyli bezkres, za źródło wszystkiego."},{"id":"9","text":"Arche dla Anaksymenesa był:","options":["Ogień.","Woda.","Powietrze.","Próżnia."],"correct":[2],"multi":false,"explanation":"Anaksymenes uważał powietrze za podstawową zasadę świata."},{"id":"10","text":"Tematyka pierwszych badań filozoficznych miała swoje źródło w:","options":["Średniowiecznych manuskryptach.","Mitologii.","Mitach teogonicznych.","Mitach antropogenicznych.","Mitach kosmogonicznych.","Żadna odpowiedź nie jest prawdziwa."],"correct":[1,2,4],"multi":true,"explanation":"Wczesne pytania filozoficzne wyrastały z mitologii, opowieści o pochodzeniu bogów i powstaniu świata."}]}]}]};
const KEY = "trening-wiedzy-v1";
let db = JSON.parse(localStorage.getItem(KEY) || "null") || seed;
let qs = [], i = 0, picks = [], flip = false, quizRound = 1, currentTestId = null;

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function currentTest() {
  const s = db.subjects.find(x => x.id === $("sub").value) || db.subjects[0];
  return s?.tests.find(t => t.id === $("test").value) || s?.tests[0];
}
function missedKey() { return "treningWiedzyMissed_" + (currentTestId || $("test")?.value || "default"); }
function getMissed() {
  try { return JSON.parse(localStorage.getItem(missedKey()) || "[]"); }
  catch { return []; }
}
function setMissed(ids) { localStorage.setItem(missedKey(), JSON.stringify([...new Set(ids)])); }
function save() { localStorage.setItem(KEY, JSON.stringify(db)); render(); }

function render() {
  ["sub","manageSub","qSub"].forEach(id => {
    const el = $(id), old = el.value;
    el.innerHTML = db.subjects.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join("");
    if ([...el.options].some(o => o.value === old)) el.value = old;
  });
  updateTests(); updateQTests(); renderList();
}
function updateTests() {
  const s = db.subjects.find(x => x.id === $("sub").value) || db.subjects[0];
  const old = $("test").value;
  $("test").innerHTML = (s?.tests || []).map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join("");
  if ([...$("test").options].some(o => o.value === old)) $("test").value = old;
}
function updateQTests() {
  const s = db.subjects.find(x => x.id === $("qSub").value) || db.subjects[0];
  const old = $("qTest").value;
  $("qTest").innerHTML = (s?.tests || []).map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join("");
  if ([...$("qTest").options].some(o => o.value === old)) $("qTest").value = old;
}
function chosen() { return currentTest()?.questions || []; }
function renderList() {
  $("list").innerHTML = db.subjects.map(s =>
    `<p><b>${esc(s.name)}</b><br>${s.tests.map(t => `${esc(t.name)} <span class="pill">${t.questions.length} pytań</span>`).join("<br>") || "Brak sprawdzianów"}</p>`
  ).join("");
}
function tab(id) {
  ["learn","quiz","cards","manage"].forEach(x => $(x).classList.toggle("hide", x !== id));
  document.querySelectorAll("[data-tab]").forEach(b => b.classList.toggle("active", b.dataset.tab === id));
}
document.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => tab(b.dataset.tab));
$("sub").onchange = () => { updateTests(); };
$("qSub").onchange = updateQTests;

function start(mode) {
  const t = currentTest();
  currentTestId = t?.id || null;
  qs = chosen(); i = 0; picks = []; flip = false;
  if (mode === "learn") { tab("learn"); learn(); }
  if (mode === "quiz") { tab("quiz"); beginQuiz(); }
  if (mode === "cards") { tab("cards"); cardMenu(); }
}
$("goLearn").onclick = () => start("learn");
$("goQuiz").onclick = () => start("quiz");
$("goCards").onclick = () => start("cards");

function learn() {
  const area = $("learnArea");
  if (!qs.length) { area.textContent = "Brak pytań w tym zestawie."; return; }
  const q = qs[i];
  area.innerHTML = `<p class="muted">Pytanie ${i+1}/${qs.length}</p><h2>${esc(q.text)}</h2>
    ${q.options.map((o,n) => `<label class="choice"><input type="${q.multi?"checkbox":"radio"}" name="ans" value="${n}"> ${esc(o)}</label>`).join("")}
    <button id="check">Sprawdź</button><button class="secondary" id="next" disabled>Następne</button><div id="fb"></div>`;
  $("check").onclick = () => {
    const a = [...document.querySelectorAll("[name=ans]:checked")].map(x => +x.value);
    const ok = same(a,q.correct);
    $("fb").innerHTML = `<div class="${ok?"good":"bad"}"><b>${ok?"Poprawnie!":"Poprawna odpowiedź:"}</b><p>${q.correct.map(n=>esc(q.options[n])).join("<br>")}</p>${esc(q.explanation)}</div>`;
    $("next").disabled = false; $("check").disabled = true;
  };
  $("next").onclick = () => {
    i++;
    if (i < qs.length) learn();
    else { area.innerHTML = `<h2>Powtórka zakończona!</h2><button id="again">Powtórz</button>`; $("again").onclick = () => { i=0; learn(); }; }
  };
}
function same(a,b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length &&
    [...a].sort((x,y)=>x-y).every((v,n)=>v === [...b].sort((x,y)=>x-y)[n]);
}

/* TEST: błędne pytania wracają w kolejnych rundach aż do poprawnej odpowiedzi. */
function beginQuiz() {
  if (!qs.length) { $("quizArea").textContent = "Brak pytań w tym zestawie."; return; }
  qs = [...chosen()].sort(() => Math.random() - 0.5);
  quizRound = 1; picks = []; i = 0;
  // Nowy pełny test zaczyna od aktualnego zestawu; błędy z poprzednich prób są zachowane do fiszek.
  drawQuiz();
}
function drawQuiz() {
  if (i >= qs.length) { finishQuizRound(); return; }
  const q = qs[i];
  $("quizArea").innerHTML = `<p class="muted">Runda ${quizRound} • pytanie ${i+1}/${qs.length}</p>
    <h3>${esc(q.text)}</h3><p class="muted">${q.multi?"Zaznacz wszystkie poprawne odpowiedzi.":"Wybierz jedną odpowiedź."}</p>
    ${q.options.map((o,n)=>`<label class="choice"><input type="${q.multi?"checkbox":"radio"}" name="qa" value="${n}"> ${esc(o)}</label>`).join("")}
    <button id="nextQ">Sprawdź odpowiedź</button>`;
  $("nextQ").onclick = () => {
    const selected = [...document.querySelectorAll("[name=qa]:checked")].map(x => +x.value);
    picks.push(selected);
    i++;
    drawQuiz();
  };
}
function finishQuizRound() {
  const wrong = qs.filter((q,n) => !same(picks[n],q.correct));
  const missed = new Set(getMissed());
  qs.forEach((q,n) => { if (same(picks[n],q.correct)) missed.delete(q.id); else missed.add(q.id); });
  setMissed([...missed]);
  const score = qs.length - wrong.length;
  if (!wrong.length) {
    $("quizArea").innerHTML = `<div class="good"><h2>Świetnie! Wszystkie odpowiedzi poprawne.</h2><p>Ukończyłeś test w ${quizRound} ${quizRound===1?"rundzie":"rundach"}. Nie ma już pytań do poprawy.</p></div>
      <button id="againAll">Rozwiąż cały test ponownie</button>`;
    $("againAll").onclick = beginQuiz;
    return;
  }
  $("quizArea").innerHTML = `<h2>Runda ${quizRound}: ${score}/${qs.length} poprawnych</h2>
    <div class="bad"><b>Pozostało ${wrong.length} pytań do poprawy.</b><p>Te pytania wrócą w następnej rundzie. Test zakończy się dopiero wtedy, gdy wszystkie odpowiedzi będą poprawne.</p>
    <button id="continueWrong">Kontynuuj – popraw błędne (${wrong.length})</button></div>
    ${wrong.map(q=>`<div class="panel"><b>${esc(q.text)}</b><p class="muted">Poprawna odpowiedź: ${q.correct.map(n=>esc(q.options[n])).join("; ")}</p><p>${esc(q.explanation||"")}</p></div>`).join("")}`;
  $("continueWrong").onclick = () => {
    qs = [...wrong].sort(() => Math.random() - 0.5);
    quizRound++; i=0; picks=[]; drawQuiz();
  };
}

/* FISZKI: pełny zestaw albo tylko pytania błędne zapisane podczas testu. */
function cardMenu() {
  const all = chosen(), missed = new Set(getMissed());
  const bad = all.filter(q => missed.has(q.id));
  $("cardArea").innerHTML = `<p>Wybierz rodzaj powtórki.</p>
    <button id="allCards">Wszystkie fiszki (${all.length})</button>
    <button id="missedCards" class="secondary" ${bad.length?"":"disabled"}>Powtórz błędne fiszki (${bad.length})</button>
    <p class="muted">Błędne fiszki zapisują się po teście. Gdy w kolejnym teście odpowiesz na dane pytanie poprawnie, zniknie ono z listy błędów.</p>`;
  $("allCards").onclick = () => { qs=all; i=0; flip=false; card(); };
  $("missedCards").onclick = () => { qs=bad; i=0; flip=false; card(); };
}
function card() {
  if (!qs.length) { $("cardArea").textContent = "Nie ma fiszek do powtórki. Rozwiąż test, aby zapisać błędne odpowiedzi."; return; }
  const q = qs[i];
  $("cardArea").innerHTML = `<p class="muted">Fiszka ${i+1}/${qs.length}</p>
    <div class="panel" id="flip"><h2>${flip?"Odpowiedź":"Pytanie"}</h2>
    <p>${flip?q.correct.map(n=>esc(q.options[n])).join("<br>"):esc(q.text)}</p>${flip?`<p>${esc(q.explanation||"")}</p>`:""}</div>
    <button id="turn">Odwróć</button><button class="secondary" id="prev" ${i===0?"disabled":""}>Wstecz</button>
    <button id="nextCard">${i===qs.length-1?"Zakończ":"Dalej"}</button><button class="secondary" id="backCards">Wybór fiszek</button>`;
  $("turn").onclick = $("flip").onclick = () => { flip=!flip; card(); };
  $("prev").onclick = () => { i=Math.max(0,i-1); flip=false; card(); };
  $("nextCard").onclick = () => { if(i<qs.length-1){i++;flip=false;card();}else cardMenu(); };
  $("backCards").onclick = cardMenu;
}

$("addSubject").onclick = () => {
  const n=$("newSubject").value.trim(); if(!n)return alert("Wpisz nazwę przedmiotu.");
  db.subjects.push({id:crypto.randomUUID(),name:n,tests:[]}); $("newSubject").value=""; save();
};
$("addTest").onclick = () => {
  const s=db.subjects.find(x=>x.id===$("manageSub").value), n=$("newTest").value.trim();
  if(!s||!n)return alert("Wybierz przedmiot i nazwę sprawdzianu.");
  s.tests.push({id:crypto.randomUUID(),name:n,questions:[]}); $("newTest").value=""; save();
};
$("addQ").onclick = () => {
  const s=db.subjects.find(x=>x.id===$("qSub").value), t=s?.tests.find(x=>x.id===$("qTest").value);
  const opts=$("qOpts").value.split("\n").map(x=>x.trim()).filter(Boolean);
  const correct=$("qCorrect").value.split(",").map(x=>Number(x.trim())-1);
  if(!t||!$("qText").value.trim()||opts.length<2||correct.some(n=>!Number.isInteger(n)||n<0||n>=opts.length))return alert("Uzupełnij pytanie, minimum 2 odpowiedzi i poprawne numery.");
  t.questions.push({id:crypto.randomUUID(),text:$("qText").value.trim(),options:opts,correct,multi:$("multi").checked||correct.length>1,explanation:$("qExp").value});
  ["qText","qOpts","qCorrect","qExp"].forEach(x=>$(x).value=""); $("multi").checked=false; save(); alert("Pytanie dodane.");
};
$("export").onclick = () => {
  const a=document.createElement("a"), u=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:"application/json"}));
  a.href=u; a.download="moje-zestawy.json"; a.click(); URL.revokeObjectURL(u);
};
$("import").onclick = () => $("file").click();
$("file").onchange = async e => {
  try {
    const d=JSON.parse(await e.target.files[0].text());
    if(!Array.isArray(d.subjects))throw 0;
    if(confirm("Import zastąpi obecne materiały. Kontynuować?")){db=d;save();}
  } catch { alert("Nieprawidłowy plik JSON."); }
};
render();
