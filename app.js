/* ==========================================================================
   app.js – HLAVNÍ LOGIKA STROOPOVA TESTU
   --------------------------------------------------------------------------
   Obsah souboru (v tomto pořadí):
     1. Základní nastavení a stav
     2. Pomocné funkce (obrazovky, náhoda, statistika)
     3. Míchání položek s omezeními
     4. Zvuk (odemčení a zvonění)
     5. Obrazovky průběhu: příprava → úvod → video (→ Zahájit test)
     6. Kolo testu (křížek, slovo, měření reakčního času)
     7. Pauza mezi koly a konec testu
     8. Ukládání dat (localStorage, CSV, Google Sheets)
     9. Administrátorská stránka (?admin=1)
    10. Ochrany během testu (zavření okna, pravé tlačítko, opuštění okna)
    11. Spuštění
   ========================================================================== */

(function () {
  'use strict';

  /* ======================================================================
     1. ZÁKLADNÍ NASTAVENÍ A STAV
     ====================================================================== */

  var C = window.STROOP_CONFIG;
  var STIMULI = window.STROOP_STIMULI;

  // Parametry v adrese: ?test=1 (testovací režim), ?admin=1 (administrace)
  var params = new URLSearchParams(window.location.search);
  var TEST = params.get('test') === '1';
  var ADMIN = params.get('admin') === '1';

  var TRIALS_PER_ROUND = TEST ? C.TEST_TRIALS_PER_ROUND : C.TRIALS_PER_ROUND;
  var PAUSE_SECONDS = TEST ? C.TEST_PAUSE_SECONDS : C.PAUSE_SECONDS;

  var STORAGE_PREFIX = 'stroop_ucastnik_';   // klíč v localStorage = prefix + kód
  var CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  // Barvy podle klíče, např. BARVA.cervena.hex
  var BARVA = {};
  C.BARVY.forEach(function (b) { BARVA[b.key] = b; });

  // Přesné pořadí sloupců v datech (kap. 7.1 a 7.2 zadání)
  var TRIAL_COLUMNS = [
    'kod_ucastnika', 'datum_cas_startu', 'vek', 'vek_mimo_rozsah', 'pohlavi',
    'kolo', 'podminka', 'poradi_v_kole', 'id_polozky',
    'slovo', 'barva_pisma', 'typ',
    'odpoved', 'spravne', 'rt_s', 'cas_odpovedi_iso',
    'testovaci_rezim', 'verze_aplikace', 'user_agent', 'rozliseni_obrazovky',
    'opustil_okno'
  ];
  var SUMMARY_COLUMNS = [
    'kod_ucastnika', 'datum_cas_startu', 'vek', 'pohlavi', 'kolo', 'podminka',
    'pocet_polozek', 'pocet_spravne', 'uspesnost_procent',
    'uspesnost_kongruentni_procent', 'uspesnost_inkongruentni_procent',
    'prumer_rt_spravne_s', 'median_rt_spravne_s',
    'prumer_rt_kongruentni_spravne_s', 'prumer_rt_inkongruentni_spravne_s',
    'stroop_efekt_s',
    'testovaci_rezim'
  ];

  // Stav jednoho sezení (jednoho účastníka)
  var S = {
    phase: 'prep',          // prep | intro | video | instr | round | pause | end | admin
    kod: null,
    datumStartu: null,      // ISO čas kliknutí na „Připravit test“
    vek: null,
    vekMimoRozsah: 0,
    pohlavi: null,
    kolo: 0,
    poradi: { 1: [], 2: [] },   // pole položek v pořadí, jak šly za sebou
    index: 0,               // pořadí aktuální položky v kole (od 0)
    current: null,          // aktuální položka { item, opustil }
    onset: 0,               // čas vykreslení slova (performance.now)
    accepting: false,       // true = kliknutí na tlačítko se počítá
    trials: [],             // všechny položkové řádky
    summaries: [],          // souhrnné řádky (jeden za kolo)
    odeslani: { 1: 'ceka', 2: 'ceka' },   // stav odeslání do Sheets po kolech
    sendPromises: []
  };

  /* ======================================================================
     2. POMOCNÉ FUNKCE
     ====================================================================== */

  function $(id) { return document.getElementById(id); }

  // Zobrazí jednu obrazovku, ostatní skryje
  function show(screenId) {
    var all = document.querySelectorAll('.screen');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
    $(screenId).classList.add('active');
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // Náhodné celé číslo 0 … n-1
  function randInt(n) { return Math.floor(Math.random() * n); }

  // Fisher–Yates míchání (vrací nové pole)
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = randInt(i + 1);
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function round1(x) { return Math.round(x * 10) / 10; }
  function round3(x) { return Math.round(x * 1000) / 1000; }   // sekundy s přesností na ms

  function mean(arr) {
    if (!arr.length) return '';
    var s = 0;
    for (var i = 0; i < arr.length; i++) s += arr[i];
    return round3(s / arr.length);
  }

  function median(arr) {
    if (!arr.length) return '';
    var a = arr.slice().sort(function (x, y) { return x - y; });
    var m = Math.floor(a.length / 2);
    return round3(a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2);
  }

  function percent(part, whole) { return whole ? round1(100 * part / whole) : ''; }

  // Anonymní kód účastníka: 5 znaků bez zaměnitelných znaků
  function generateCode() {
    for (var attempt = 0; attempt < 100; attempt++) {
      var bytes = new Uint8Array(5);
      if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
      else for (var k = 0; k < 5; k++) bytes[k] = randInt(256);
      var code = '';
      for (var i = 0; i < 5; i++) code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
      // Kódy, které by Excel/Sheets přečetl jako číslo (např. 23456 nebo 2E345), přeskočíme
      if (/^[0-9]+$/.test(code) || /^[0-9]+E[0-9]+$/.test(code)) continue;
      // Kód nesmí kolidovat s už uloženým účastníkem na tomto počítači
      if (storageGet(STORAGE_PREFIX + code)) continue;
      return code;
    }
    return 'X' + Date.now().toString(36).toUpperCase().slice(-4);
  }

  /* ======================================================================
     3. MÍCHÁNÍ POLOŽEK S OMEZENÍMI
     ----------------------------------------------------------------------
     Pravidla: stejná barva písma ani stejné slovo nesmí být dvakrát po sobě
     a max. 3 položky stejného typu (kongruentní/inkongruentní) za sebou.
     Postup: náhodně skládáme posloupnost a vybíráme jen z položek, které
     pravidla splňují. Když se zasekneme, začneme znovu (trvá to milisekundy).
     ====================================================================== */

  function fitsAfter(seq, item) {
    var n = seq.length;
    if (n === 0) return true;
    var prev = seq[n - 1];
    if (prev.barva === item.barva) return false;
    if (prev.slovo === item.slovo) return false;
    if (n >= 3 && seq[n - 1].typ === item.typ && seq[n - 2].typ === item.typ &&
        seq[n - 3].typ === item.typ) return false;
    return true;
  }

  function tryBuildOrder(items) {
    var pool = shuffle(items);
    var seq = [];
    while (pool.length) {
      var candidates = [];
      for (var i = 0; i < pool.length; i++) if (fitsAfter(seq, pool[i])) candidates.push(i);
      if (!candidates.length) return null;            // slepá ulička → zkusit znovu
      var pick = candidates[randInt(candidates.length)];
      seq.push(pool.splice(pick, 1)[0]);
    }
    return seq;
  }

  function constrainedOrder(items) {
    for (var attempt = 0; attempt < 5000; attempt++) {
      var seq = tryBuildOrder(items);
      if (seq) return seq;
    }
    return null;
  }

  // Vybere položky pro kolo (všech 80, nebo vyváženou podmnožinu v testovacím
  // režimu) a vrátí je v zamíchaném pořadí.
  function makeRoundOrder() {
    if (TRIALS_PER_ROUND >= STIMULI.length) {
      return constrainedOrder(STIMULI) || shuffle(STIMULI);
    }
    var cong = STIMULI.filter(function (s) { return s.typ === 'kongruentni'; });
    var inc = STIMULI.filter(function (s) { return s.typ === 'inkongruentni'; });
    var nC = Math.ceil(TRIALS_PER_ROUND / 2), nI = TRIALS_PER_ROUND - nC;
    for (var attempt = 0; attempt < 500; attempt++) {
      var subset = shuffle(cong).slice(0, nC).concat(shuffle(inc).slice(0, nI));
      var seq = constrainedOrder(subset);
      if (seq) return seq;
    }
    return shuffle(STIMULI).slice(0, TRIALS_PER_ROUND);
  }

  /* ======================================================================
     4. ZVUK
     ----------------------------------------------------------------------
     Prohlížeč pustí zvuk jen po kliknutí uživatele. Proto při kliknutí na
     „Připravit test“ vytvoříme AudioContext a přehrajeme ticho. Zvonění
     v pauze pak zazní spolehlivě.
     ====================================================================== */

  var audioCtx = null;
  var bellBuffer = null;     // načtený audio/zvonek.mp3 (pokud existuje)
  var bellLoadTried = false;

  function getAudioCtx() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    return audioCtx;
  }

  function unlockAudio() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume();
      var buf = ctx.createBuffer(1, 1, 22050);   // jeden vzorek ticha
      var src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch (e) { /* nevadí */ }
    loadBellFile();
  }

  // Pokusí se načíst audio/zvonek.mp3. Když neexistuje, použije se syntetické zvonění.
  function loadBellFile() {
    if (bellLoadTried) return;
    bellLoadTried = true;
    var ctx = getAudioCtx();
    if (!ctx || !window.fetch) return;
    fetch(C.BELL_FILE, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.arrayBuffer() : null; })
      .then(function (data) {
        if (!data) return null;
        return new Promise(function (res, rej) { ctx.decodeAudioData(data, res, rej); });
      })
      .then(function (buffer) { if (buffer) bellBuffer = buffer; })
      .catch(function () { /* soubor není → syntetické zvonění */ });
  }

  // Přehraje zvonění (soubor, nebo syntetický školní zvonek)
  function ringBell() {
    var ctx = getAudioCtx();
    if (!ctx) return;
    try { if (ctx.state !== 'running') ctx.resume(); } catch (e) { /* nic */ }

    if (bellBuffer) {
      var src = ctx.createBufferSource();
      src.buffer = bellBuffer;
      src.connect(ctx.destination);
      src.start(ctx.currentTime + 0.05);
      return;
    }
    synthBell(ctx, C.BELL_SECONDS || 3.5);
  }

  // Syntetický „školní zvonek“: kovový tón (několik neharmonických složek),
  // který kladívko rozeznívá cca 18× za sekundu, na konci doznění.
  function synthBell(ctx, duration) {
    var t0 = ctx.currentTime + 0.05;
    var base = 760;   // základní výška tónu (Hz)
    var partials = [[1, 0.42], [2.0, 0.22], [2.76, 0.16], [5.4, 0.1], [8.93, 0.05]];

    var strike = ctx.createGain();         // obálka úderů kladívka
    strike.gain.setValueAtTime(0, t0);
    strike.connect(ctx.destination);

    var oscs = [];
    partials.forEach(function (p) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = base * p[0];
      g.gain.value = p[1];
      o.connect(g); g.connect(strike);
      oscs.push(o);
    });

    var rate = 18, step = 1 / rate;
    for (var t = t0; t < t0 + duration; t += step) {
      strike.gain.setValueAtTime(1, t);
      strike.gain.exponentialRampToValueAtTime(0.35, t + step * 0.9);
    }
    var tEnd = t0 + duration;
    strike.gain.setValueAtTime(1, tEnd);
    strike.gain.exponentialRampToValueAtTime(0.001, tEnd + 0.8);

    oscs.forEach(function (o) { o.start(t0); o.stop(tEnd + 0.9); });
  }

  /* ======================================================================
     5. OBRAZOVKY PRŮBĚHU
     ====================================================================== */

  // ---- 0. Příprava --------------------------------------------------------
  function initPrep() {
    S.phase = 'prep';
    var ind = $('sheets-indicator');
    if (C.SHEETS_URL && /^https:\/\//.test(C.SHEETS_URL)) {
      ind.innerHTML = 'Google Sheets: <span class="status-ok">✓ nastaveno</span>';
    } else {
      ind.innerHTML = 'Google Sheets: <span class="status-bad">✗ URL není nastavená</span>';
    }

    $('link-sound-test').addEventListener('click', function (e) {
      e.preventDefault();
      unlockAudio();
      // malé zpoždění, aby se stihl případně načíst audio/zvonek.mp3
      setTimeout(ringBell, bellBuffer ? 0 : 400);
    });

    $('btn-prepare').addEventListener('click', function () {
      // 1) celá obrazovka
      try {
        var el = document.documentElement;
        var req = el.requestFullscreen || el.webkitRequestFullscreen;
        if (req) {
          var p = req.call(el);
          if (p && p.catch) p.catch(function () { /* nevadí */ });
        }
      } catch (e) { /* nevadí */ }
      // 2) odemčení zvuku
      unlockAudio();
      // 3) anonymní kód + čas startu
      S.kod = generateCode();
      S.datumStartu = new Date().toISOString();
      // 4) úvodní obrazovka
      showIntro();
    });

    show('scr-prep');
  }

  // ---- 1. Úvod a údaje ----------------------------------------------------
  function showIntro() {
    S.phase = 'intro';
    $('intro-text').textContent = C.TEXTY.UVOD_POZDRAV;
    var age = $('inp-age');
    var btn = $('btn-intro');
    var err = $('age-error');

    function readAge() {
      var v = age.value.trim();
      if (!/^\d{1,3}$/.test(v)) return null;
      var n = parseInt(v, 10);
      return (n >= 15 && n <= 99) ? n : null;
    }
    function readGender() {
      var r = document.querySelector('input[name="gender"]:checked');
      return r ? r.value : null;
    }
    function validate() {
      var a = readAge();
      err.textContent = (age.value.trim() !== '' && a === null)
        ? 'Zadejte prosím věk jako celé číslo od 15 do 99.' : '';
      btn.disabled = !(a !== null && readGender());
    }

    age.addEventListener('input', validate);
    // Zabránit zadání desetinné čárky/tečky, mínusu a „e“
    age.addEventListener('keydown', function (e) {
      if (['.', ',', '-', '+', 'e', 'E'].indexOf(e.key) >= 0) e.preventDefault();
    });
    var radios = document.querySelectorAll('input[name="gender"]');
    for (var i = 0; i < radios.length; i++) radios[i].addEventListener('change', validate);

    btn.addEventListener('click', function () {
      var a = readAge(), g = readGender();
      if (a === null || !g) return;
      S.vek = a;
      S.vekMimoRozsah = (a < 18 || a > 26) ? 1 : 0;
      S.pohlavi = g;
      showVideo();
    });

    validate();
    show('scr-intro');
    setTimeout(function () { try { age.focus(); } catch (e) { /* nic */ } }, 50);
  }

  // ---- 2. Instruktážní video ---------------------------------------------
  function showVideo() {
    S.phase = 'video';
    $('video-title').textContent = C.TEXTY.VIDEO_NADPIS;
    var v = $('video');
    var btn = $('btn-video');
    var hint = $('video-hint');
    var failed = false;
    btn.disabled = true;
    hint.textContent = C.TEXTY.VIDEO_CEKANI;

    // Záložní varianta: video chybí nebo se nenačte → textové instrukce
    function fallback() {
      if (failed) return;
      failed = true;
      try { v.pause(); } catch (e) { /* nic */ }
      $('video-wrap').classList.add('hidden');
      $('video-title').textContent = '';
      $('video-fallback').innerHTML = C.TEXTY.INSTRUKCE;
      $('video-fallback').classList.remove('hidden');
      hint.textContent = '';
      btn.disabled = false;
    }

    v.addEventListener('error', fallback);
    v.addEventListener('ended', function () {
      btn.disabled = false;
      hint.textContent = C.TEXTY.VIDEO_HOTOVO;
    });
    // „Zahájit test“ → rovnou 1. kolo
    btn.addEventListener('click', function () {
      if (btn.disabled || S.phase !== 'video') return;
      try { v.pause(); } catch (e) { /* nic */ }
      enableTestProtection();
      startRound(1);
    });

    show('scr-video');
    try {
      v.src = C.VIDEO_FILE;
      v.load();
      var p = v.play();          // po kliknutí na stránce prohlížeč přehrání dovolí
      if (p && p.catch) p.catch(function () { /* účastník spustí sám */ });
    } catch (e) { fallback(); }

    // Pojistka: když se do 10 s nenačte vůbec nic, přejdeme na text
    setTimeout(function () {
      if (!failed && v.readyState === 0 && S.phase === 'video') fallback();
    }, 10000);
  }

  /* ======================================================================
     6. KOLO TESTU
     ====================================================================== */

  var fixEl, wordEl;

  // Vytvoří 6 tlačítek odpovědí (jednou, pevné pořadí)
  function buildAnswerButtons() {
    var row = $('answer-row');
    C.BARVY.forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer-btn';
      btn.textContent = b.label;
      btn.tabIndex = -1;                 // nelze ovládat klávesnicí
      btn.dataset.key = b.key;
      btn.addEventListener('pointerdown', onAnswer);
      // klik a dvojklik nic nedělají (měří se jen pointerdown)
      btn.addEventListener('click', function (e) { e.preventDefault(); });
      btn.addEventListener('dblclick', function (e) { e.preventDefault(); });
      row.appendChild(btn);
    });
  }

  function startRound(kolo) {
    S.phase = 'round';
    S.kolo = kolo;
    S.index = 0;
    S.poradi[kolo] = makeRoundOrder();
    show('scr-task');
    nextTrial();
  }

  // Křížek → po FIXATION_MS slovo
  function nextTrial() {
    if (S.index >= S.poradi[S.kolo].length) { endRound(); return; }
    S.accepting = false;
    S.current = { item: S.poradi[S.kolo][S.index], opustil: 0 };
    wordEl.style.visibility = 'hidden';
    fixEl.style.visibility = 'visible';
    setTimeout(showWord, C.FIXATION_MS);
  }

  // Zobrazí slovo a změří okamžik jeho skutečného vykreslení
  function showWord() {
    var it = S.current.item;
    requestAnimationFrame(function () {
      fixEl.style.visibility = 'hidden';
      wordEl.textContent = BARVA[it.slovo].label;
      wordEl.style.color = BARVA[it.barva].hex;
      wordEl.style.visibility = 'visible';
      // v dalším snímku je slovo na obrazovce → začátek měření
      requestAnimationFrame(function () {
        S.onset = performance.now();
        S.accepting = true;
      });
    });
  }

  // Odpověď účastníka (pointerdown na tlačítku)
  function onAnswer(e) {
    if (e.button !== 0) return;          // jen levé tlačítko myši
    e.preventDefault();
    if (S.phase !== 'round' || !S.accepting) return;   // během křížku se ignoruje
    var now = performance.now();
    // čas události (stejná časová osa jako performance.now v Chrome/Edge)
    var tResp = (typeof e.timeStamp === 'number' && e.timeStamp >= S.onset && e.timeStamp <= now)
      ? e.timeStamp : now;
    S.accepting = false;                 // další kliky se do této položky nepočítají

    var it = S.current.item;
    var odpoved = e.currentTarget.dataset.key;
    var origin = performance.timeOrigin || (Date.now() - now);

    S.trials.push({
      kod_ucastnika: S.kod,
      datum_cas_startu: S.datumStartu,
      vek: S.vek,
      vek_mimo_rozsah: S.vekMimoRozsah,
      pohlavi: S.pohlavi,
      kolo: S.kolo,
      podminka: S.kolo === 1 ? 'bez_publika' : 's_publikem',
      poradi_v_kole: S.index + 1,
      id_polozky: it.id,
      slovo: it.slovo,
      barva_pisma: it.barva,
      typ: it.typ,
      odpoved: odpoved,
      spravne: odpoved === it.barva ? 1 : 0,
      rt_s: round3((tResp - S.onset) / 1000),   // reakční čas v sekundách
      cas_odpovedi_iso: new Date(origin + tResp).toISOString(),
      testovaci_rezim: TEST ? 1 : 0,
      verze_aplikace: C.APP_VERSION,
      user_agent: navigator.userAgent,
      rozliseni_obrazovky: screen.width + 'x' + screen.height,
      opustil_okno: S.current.opustil
    });

    S.index++;
    nextTrial();                         // hned další křížek, bez zpětné vazby
  }

  // Souhrn jednoho kola
  function makeSummary(kolo) {
    var rows = S.trials.filter(function (t) { return t.kolo === kolo; });
    var ok = rows.filter(function (t) { return t.spravne === 1; });
    var cong = rows.filter(function (t) { return t.typ === 'kongruentni'; });
    var inc = rows.filter(function (t) { return t.typ === 'inkongruentni'; });
    var congOk = cong.filter(function (t) { return t.spravne === 1; });
    var incOk = inc.filter(function (t) { return t.spravne === 1; });
    var rt = function (arr) { return arr.map(function (t) { return t.rt_s; }); };
    var mC = mean(rt(congOk)), mI = mean(rt(incOk));

    return {
      kod_ucastnika: S.kod,
      datum_cas_startu: S.datumStartu,
      vek: S.vek,
      pohlavi: S.pohlavi,
      kolo: kolo,
      podminka: kolo === 1 ? 'bez_publika' : 's_publikem',
      pocet_polozek: rows.length,
      pocet_spravne: ok.length,
      uspesnost_procent: percent(ok.length, rows.length),
      uspesnost_kongruentni_procent: percent(congOk.length, cong.length),
      uspesnost_inkongruentni_procent: percent(incOk.length, inc.length),
      prumer_rt_spravne_s: mean(rt(ok)),
      median_rt_spravne_s: median(rt(ok)),
      prumer_rt_kongruentni_spravne_s: mC,
      prumer_rt_inkongruentni_spravne_s: mI,
      stroop_efekt_s: (mC !== '' && mI !== '') ? round3(mI - mC) : '',
      testovaci_rezim: TEST ? 1 : 0
    };
  }

  /* ======================================================================
     7. PAUZA A KONEC
     ====================================================================== */

  function endRound() {
    var kolo = S.kolo;
    S.accepting = false;
    S.current = null;
    fixEl.style.visibility = 'hidden';
    wordEl.style.visibility = 'hidden';
    S.summaries.push(makeSummary(kolo));
    saveLocal();
    if (kolo === 1) {
      startPause();
      sendRound(1);          // odesílá se na pozadí během pauzy
    } else {
      finishTest();
    }
  }

  function startPause() {
    S.phase = 'pause';
    ringBell();              // signál pro publikum
    $('pause-text').innerHTML = C.TEXTY.PAUZA;
    $('pause-end-text').textContent = C.TEXTY.PAUZA_KONEC;
    $('pause-continue').classList.add('hidden');
    var cd = $('countdown');
    cd.classList.remove('hidden');
    show('scr-pause');

    var end = performance.now() + PAUSE_SECONDS * 1000;
    cd.textContent = String(PAUSE_SECONDS);
    var timer = setInterval(function () {
      var left = Math.max(0, Math.ceil((end - performance.now()) / 1000));
      cd.textContent = String(left);
      if (left <= 0) {
        clearInterval(timer);
        cd.classList.add('hidden');
        $('pause-continue').classList.remove('hidden');
        S.phase = 'pause_done';
      }
    }, 100);
  }

  function initPauseButton() {
    $('btn-pause').addEventListener('click', function () {
      if (S.phase !== 'pause_done') return;   // během odpočtu nejde
      startRound(2);
    });
  }

  function finishTest() {
    S.phase = 'end';
    disableUnloadWarning();
    $('end-text').innerHTML = C.TEXTY.KONEC;
    $('end-code-label').textContent = C.TEXTY.KONEC_KOD_POPISEK;
    $('end-code').textContent = S.kod;
    show('scr-end');
    saveLocal(true);
    // CSV se stáhne automaticky
    try { downloadCSV(buildCSV(S.trials, TRIAL_COLUMNS), csvFileName(S.kod, S.datumStartu)); }
    catch (e) { /* data jsou i v localStorage */ }
    sendRound(2);
    updateSaveStatus();
  }

  // Malý stavový ukazatel ukládání na konci
  function updateSaveStatus() {
    var el = $('save-status');
    if (!el) return;
    var st = [S.odeslani[1], S.odeslani[2]];
    var busy = st.some(function (s) { return s === 'ceka' || s === 'odesila'; });
    var allConfirmed = st.every(function (s) { return s === 'potvrzeno'; });
    var allSent = st.every(function (s) { return s === 'potvrzeno' || s === 'nepotvrzeno'; });
    el.className = 'corner corner-bl small';
    if (busy) {
      el.textContent = 'Ukládám…';
    } else if (allConfirmed) {
      el.textContent = 'Data uložena ✓';
      el.classList.add('status-ok');
    } else if (allSent) {
      el.textContent = 'Data odeslána (bez potvrzení), záloha v počítači ✓';
    } else {
      el.textContent = 'Uložení online selhalo, data jsou zálohovaná v počítači';
      el.classList.add('status-bad');
    }
  }

  /* ======================================================================
     8. UKLÁDÁNÍ DAT
     ====================================================================== */

  // ---- localStorage (záloha v prohlížeči) --------------------------------
  function storageGet(key) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
    catch (e) { return null; }
  }
  function storageSet(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); return true; }
    catch (e) { return false; }
  }

  function saveLocal(finished) {
    var rec = {
      kod: S.kod,
      datum_cas_startu: S.datumStartu,
      testovaci_rezim: TEST ? 1 : 0,
      dokonceno: finished || S.summaries.length >= 2 ? 1 : 0,
      odeslani: S.odeslani,
      trials: S.trials,
      summaries: S.summaries
    };
    storageSet(STORAGE_PREFIX + S.kod, rec);
  }

  // ---- Odeslání jednoho kola do Google Sheets ----------------------------
  function sendRound(kolo) {
    var payload = {
      trials: S.trials.filter(function (t) { return t.kolo === kolo; }),
      summaries: S.summaries.filter(function (s) { return s.kolo === kolo; })
    };
    S.odeslani[kolo] = C.SHEETS_URL ? 'odesila' : 'bez_url';
    saveLocal();
    updateSaveStatus();
    var p = postToSheets(payload).then(function (result) {
      S.odeslani[kolo] = result;
      saveLocal();
      updateSaveStatus();
    });
    S.sendPromises.push(p);
    return p;
  }

  var lastSendError = '';   // poslední chybová zpráva (zobrazí se v administraci)

  // Vrací stav: 'potvrzeno' | 'nepotvrzeno' | 'chyba' | 'bez_url'
  function postToSheets(payload) {
    if (!C.SHEETS_URL) return Promise.resolve('bez_url');
    var body = JSON.stringify(payload);
    var headers = { 'Content-Type': 'text/plain;charset=utf-8' };  // bez CORS preflightu
    var delays = [0].concat(C.SEND_RETRY_DELAYS_MS.slice(0, C.SEND_RETRIES));

    function attempt(i) {
      if (i >= delays.length) return Promise.resolve('chyba');
      return sleep(delays[i]).then(function () {
        return fetch(C.SHEETS_URL, { method: 'POST', headers: headers, body: body, redirect: 'follow' })
          .then(function (r) {
            return r.text().then(function (txt) {
              var j = null;
              try { j = JSON.parse(txt); } catch (e) { /* není JSON */ }
              if (j && j.ok === true) { lastSendError = ''; return 'potvrzeno'; }
              lastSendError = (j && j.chyba) ? String(j.chyba) : txt.slice(0, 300);
              return attempt(i + 1);       // server odpověděl chybou → znovu
            });
          })
          .catch(function () {
            // Odpověď nejde přečíst (CORS) nebo nejde síť → zkusit no-cors
            return fetch(C.SHEETS_URL, { method: 'POST', mode: 'no-cors', headers: headers, body: body })
              .then(function () { return 'nepotvrzeno'; })      // odesláno, nepotvrzeno
              .catch(function () { return attempt(i + 1); });   // síť nejde → znovu
          });
      });
    }
    return attempt(0);
  }

  // ---- CSV (středník, desetinná čárka, UTF-8 s BOM) ----------------------
  function csvCell(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'number') return String(v).replace('.', ',');
    var s = String(v);
    if (/[;"\r\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function buildCSV(rows, columns) {
    var lines = [columns.join(';')];
    rows.forEach(function (r) {
      lines.push(columns.map(function (c) { return csvCell(r[c]); }).join(';'));
    });
    return '\uFEFF' + lines.join('\r\n') + '\r\n';
  }

  function csvFileName(kod, iso) {
    var d = iso ? iso.slice(0, 10) : new Date().toISOString().slice(0, 10);
    return 'stroop_' + kod + '_' + d + '.csv';
  }

  function downloadCSV(text, filename) {
    var blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 2000);
  }

  /* ======================================================================
     9. ADMINISTRACE (?admin=1)
     ====================================================================== */

  var STATUS_TEXT = {
    potvrzeno: '✓ uloženo',
    nepotvrzeno: 'odesláno, nepotvrzeno',
    chyba: '✗ neodesláno (chyba)',
    bez_url: '✗ neodesláno (chyběla URL)',
    ceka: '✗ neodesláno',
    odesila: '✗ neodesláno (přerušeno)',
    zadna_data: '– (kolo neproběhlo)'
  };

  // Starší záznamy (verze 1.0.0) měly časy v ms – převedeme je na sekundy
  function upgradeRow(r) {
    var out = {};
    Object.keys(r).forEach(function (k) {
      var v = r[k];
      if (/_ms$/.test(k)) {
        out[k.replace(/_ms$/, '_s')] = (v === '' || v === null || v === undefined) ? '' : round3(v / 1000);
      } else out[k] = v;
    });
    return out;
  }
  function upgradeRecord(rec) {
    rec.trials = (rec.trials || []).map(upgradeRow);
    rec.summaries = (rec.summaries || []).map(upgradeRow);
    return rec;
  }

  function loadAllRecords() {
    var recs = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(STORAGE_PREFIX) === 0) {
          var r = storageGet(k);
          if (r && r.kod) recs.push(upgradeRecord(r));
        }
      }
    } catch (e) { /* localStorage nedostupné */ }
    recs.sort(function (a, b) { return String(a.datum_cas_startu).localeCompare(String(b.datum_cas_startu)); });
    return recs;
  }

  function roundStatus(rec, kolo) {
    var has = (rec.summaries || []).some(function (s) { return s.kolo === kolo; });
    if (!has) return 'zadna_data';
    return (rec.odeslani && rec.odeslani[kolo]) || 'ceka';
  }

  function needsResend(st) { return st !== 'potvrzeno' && st !== 'nepotvrzeno' && st !== 'zadna_data'; }

  function formatDate(iso) {
    try { return new Date(iso).toLocaleString('cs-CZ'); } catch (e) { return iso; }
  }

  function renderAdmin() {
    var recs = loadAllRecords();
    var tb = document.querySelector('#admin-table tbody');
    tb.innerHTML = '';
    if (!recs.length) {
      var tr0 = document.createElement('tr');
      tr0.innerHTML = '<td colspan="6">Na tomto počítači nejsou uložená žádná data.</td>';
      tb.appendChild(tr0);
    }
    recs.forEach(function (r) {
      var tr = document.createElement('tr');
      var cells = [
        r.kod,
        formatDate(r.datum_cas_startu),
        r.testovaci_rezim ? 'testovací' : 'ostrý',
        r.dokonceno ? 'ano' : 'ne',
        STATUS_TEXT[roundStatus(r, 1)] || '',
        STATUS_TEXT[roundStatus(r, 2)] || ''
      ];
      cells.forEach(function (c) {
        var td = document.createElement('td');
        td.textContent = c;
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    $('admin-sheets').textContent = C.SHEETS_URL
      ? 'Google Sheets: URL je nastavená.'
      : 'Google Sheets: URL není nastavená (config.js → SHEETS_URL).';
    return recs;
  }

  function initAdmin() {
    S.phase = 'admin';
    show('scr-admin');
    renderAdmin();
    var msg = $('admin-msg');
    var stamp = new Date().toISOString().slice(0, 10);

    $('adm-csv-trials').addEventListener('click', function () {
      var rows = [];
      loadAllRecords().forEach(function (r) { rows = rows.concat(r.trials || []); });
      if (!rows.length) { msg.textContent = 'Nejsou žádná data ke stažení.'; return; }
      downloadCSV(buildCSV(rows, TRIAL_COLUMNS), 'stroop_vse_polozky_' + stamp + '.csv');
      msg.textContent = 'Staženo ' + rows.length + ' položkových řádků.';
    });

    $('adm-csv-summary').addEventListener('click', function () {
      var rows = [];
      loadAllRecords().forEach(function (r) { rows = rows.concat(r.summaries || []); });
      if (!rows.length) { msg.textContent = 'Nejsou žádná data ke stažení.'; return; }
      downloadCSV(buildCSV(rows, SUMMARY_COLUMNS), 'stroop_vse_souhrny_' + stamp + '.csv');
      msg.textContent = 'Staženo ' + rows.length + ' souhrnných řádků.';
    });

    $('adm-check').addEventListener('click', function () {
      var btn = this;
      btn.disabled = true;
      msg.textContent = 'Zkouším spojení…';
      checkSheetsConnection().then(function (text) {
        msg.textContent = text;
        btn.disabled = false;
      });
    });

    $('adm-resend').addEventListener('click', function () {
      var btn = this;
      if (!C.SHEETS_URL) { msg.textContent = 'Nejdřív vložte URL skriptu do config.js (SHEETS_URL).'; return; }
      var jobs = [];
      loadAllRecords().forEach(function (r) {
        [1, 2].forEach(function (k) {
          if (needsResend(roundStatus(r, k))) jobs.push({ rec: r, kolo: k });
        });
      });
      if (!jobs.length) { msg.textContent = 'Všechna data už byla odeslána.'; return; }
      btn.disabled = true;
      msg.textContent = 'Odesílám ' + jobs.length + ' kol…';
      var okCount = 0;
      // postupně, jedno po druhém
      jobs.reduce(function (prev, job) {
        return prev.then(function () {
          var payload = {
            trials: (job.rec.trials || []).filter(function (t) { return t.kolo === job.kolo; }),
            summaries: (job.rec.summaries || []).filter(function (s) { return s.kolo === job.kolo; })
          };
          return postToSheets(payload).then(function (res) {
            var fresh = storageGet(STORAGE_PREFIX + job.rec.kod) || job.rec;
            fresh.odeslani = fresh.odeslani || {};
            fresh.odeslani[job.kolo] = res;
            storageSet(STORAGE_PREFIX + job.rec.kod, fresh);
            if (res === 'potvrzeno' || res === 'nepotvrzeno') okCount++;
            renderAdmin();
          });
        });
      }, Promise.resolve()).then(function () {
        btn.disabled = false;
        msg.textContent = 'Hotovo: odesláno ' + okCount + ' z ' + jobs.length + ' kol.' +
          (lastSendError ? ' Poslední chyba ze serveru: ' + lastSendError : '');
      });
    });

    $('adm-delete').addEventListener('click', function () {
      var n = loadAllRecords().length;
      if (!n) { msg.textContent = 'Není co mazat.'; return; }
      askConfirm('Opravdu smazat lokální zálohy ' + n +
        ' účastníků z tohoto počítače? Data v Google Sheets zůstanou. ' +
        'Doporučujeme nejdřív stáhnout CSV.', function () {
        try {
          var keys = [];
          for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && k.indexOf(STORAGE_PREFIX) === 0) keys.push(k);
          }
          keys.forEach(function (k) { localStorage.removeItem(k); });
          msg.textContent = 'Smazáno ' + keys.length + ' záloh.';
        } catch (e) { msg.textContent = 'Mazání se nepodařilo.'; }
        renderAdmin();
      });
    });
  }

  // Otestuje spojení se skriptem a vrátí srozumitelnou zprávu.
  // Pošle prázdná data – do tabulky se nic nezapíše.
  function checkSheetsConnection() {
    if (!C.SHEETS_URL) return Promise.resolve('✗ V config.js chybí SHEETS_URL.');
    if (!/\/exec$/.test(C.SHEETS_URL)) {
      return Promise.resolve('✗ URL musí končit na /exec (ne /dev). Zkopírujte URL webové aplikace z „Spravovat nasazení“.');
    }
    return fetch(C.SHEETS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ trials: [], summaries: [], kontrola: 1 })
    }).then(function (r) { return r.text(); }).then(function (txt) {
      var j = null;
      try { j = JSON.parse(txt); } catch (e) { /* není JSON */ }
      if (j && j.ok === true) return '✓ Spojení funguje, skript odpovídá a je připojený k tabulce.';
      if (j && j.chyba) return '✗ Skript odpověděl chybou: ' + j.chyba;
      if (/function not found/i.test(txt)) {
        return '✗ Google hlásí „Script function not found“: nasazená verze neobsahuje kód z Code.gs. ' +
          'Vložte kód, uložte a vydejte novou verzi nasazení (NAVOD.md, Krok 2).';
      }
      return '✗ Skript nevrátil očekávanou odpověď. Začátek odpovědi: ' + txt.replace(/<[^>]+>/g, ' ').slice(0, 200);
    }).catch(function () {
      return '✗ Odpověď skriptu nejde přečíst. Otevřete URL skriptu v novém panelu prohlížeče:\n' +
        '• „{\"ok\":true…}“ → skript je v pořádku, zkuste test znovu;\n' +
        '• „Script function not found“ → nasazená verze neobsahuje kód, vydejte novou verzi (NAVOD.md, Krok 2);\n' +
        '• přihlašovací stránka Googlu → nasazení nemá přístup „Kdokoli“;\n' +
        '• stránka se nenačte → nejde internet.';
    });
  }

  // Vlastní potvrzovací dialog
  function askConfirm(text, onOk) {
    var d = $('dialog');
    $('dialog-text').textContent = text;
    d.classList.remove('hidden');
    function close() {
      d.classList.add('hidden');
      $('dialog-ok').onclick = null;
      $('dialog-cancel').onclick = null;
    }
    $('dialog-cancel').onclick = close;
    $('dialog-ok').onclick = function () { close(); onOk(); };
  }

  /* ======================================================================
     10. OCHRANY BĚHEM TESTU
     ====================================================================== */

  function onBeforeUnload(e) {
    e.preventDefault();
    e.returnValue = '';   // prohlížeč zobrazí vlastní varování
    return '';
  }

  function enableTestProtection() {
    document.body.classList.add('locked');
    window.addEventListener('beforeunload', onBeforeUnload);
  }

  function disableUnloadWarning() {
    window.removeEventListener('beforeunload', onBeforeUnload);
  }

  function inTest() {
    return ['round', 'pause', 'pause_done', 'end'].indexOf(S.phase) >= 0;
  }

  function initGlobalGuards() {
    // pravé tlačítko, označování a přetahování během testu
    document.addEventListener('contextmenu', function (e) { if (inTest()) e.preventDefault(); });
    document.addEventListener('selectstart', function (e) { if (inTest()) e.preventDefault(); });
    document.addEventListener('dragstart', function (e) { if (inTest()) e.preventDefault(); });

    // Klávesnice během kola a pauzy nic nedělá (Esc pro opuštění celé
    // obrazovky prohlížeč zablokovat nedovolí – to je v pořádku)
    document.addEventListener('keydown', function (e) {
      if (S.phase === 'round' || S.phase === 'pause') e.preventDefault();
    }, true);

    // Opuštění okna / celé obrazovky během kola → zapsat k aktuální položce
    function markLeft() {
      if (S.phase === 'round' && S.current) S.current.opustil = 1;
    }
    window.addEventListener('blur', markLeft);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') markLeft();
    });
    document.addEventListener('fullscreenchange', function () {
      if (!document.fullscreenElement) markLeft();
    });
  }

  /* ======================================================================
     11. SPUŠTĚNÍ
     ====================================================================== */

  function init() {
    if (!C || !STIMULI) {
      document.body.innerHTML = '<p style="padding:40px">Chyba: nenačetl se config.js nebo stimuli.js.</p>';
      return;
    }
    fixEl = $('fixation');
    wordEl = $('word');
    if (TEST) $('test-label').classList.remove('hidden');

    if (ADMIN) { initAdmin(); return; }

    buildAnswerButtons();
    initPauseButton();
    initGlobalGuards();
    initPrep();
  }

  // Pro kontrolu v konzoli (F12) – nic neovlivňuje průběh
  window.STROOP_DEBUG = {
    makeRoundOrder: makeRoundOrder,
    fitsAfter: fitsAfter,
    buildCSV: buildCSV,
    state: S
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
