/* ==========================================================================
   config.js – VŠECHNA NASTAVENÍ NA JEDNOM MÍSTĚ
   --------------------------------------------------------------------------
   Tady můžete bezpečně měnit hodnoty i texty. Dávejte pozor jen na to,
   aby zůstaly zachované uvozovky, čárky a závorky.
   ========================================================================== */

window.STROOP_CONFIG = {

  /* ---- Google Sheets ----------------------------------------------------
     Sem vložte URL nasazeného Google Apps Scriptu (končí na /exec).
     Postup je v souboru NAVOD.md. Když zůstane prázdné (''), data se
     ukládají jen do počítače (CSV + záloha v prohlížeči). */
  SHEETS_URL: 'https://script.google.com/macros/s/AKfycby8iveL87rjLY44QbgDj3Aq5Dz6fZXMDlTUxq4ger0BuSoA-zBuY7_g0BaYAzTRzglV-w/exec',

  /* ---- Verze aplikace (zapisuje se do dat) ------------------------------ */
  APP_VERSION: '1.3.0',

  /* ---- Časování a rozsah testu ------------------------------------------ */
  FIXATION_MS: 500,          // jak dlouho svítí křížek „+“ před slovem (ms)
  PAUSE_SECONDS: 60,         // délka pauzy mezi koly (s)
  TRIALS_PER_ROUND: 40,      // počet položek v jednom kole (celá sada ze stimuli.js)

  /* Testovací režim (index.html?test=1) */
  TEST_TRIALS_PER_ROUND: 6,
  TEST_PAUSE_SECONDS: 5,

  /* ---- Odesílání dat ---------------------------------------------------- */
  SEND_RETRIES: 3,                    // kolikrát se odeslání zopakuje při chybě
  SEND_RETRY_DELAYS_MS: [1500, 4000, 8000], // prodlevy před opakováním

  /* ---- Zvonění v pauze --------------------------------------------------
     Když v repozitáři existuje soubor audio/zvonek.mp3, přehraje se on.
     Jinak aplikace zvonění vyrobí sama (Web Audio API). */
  BELL_FILE: 'audio/zvonek.mp3',
  BELL_SECONDS: 3.5,

  /* ---- Barvy ------------------------------------------------------------
     key: interní název (zapisuje se do dat), label: co se zobrazí,
     hex: barva písma slova uprostřed (tlačítka mají vždy bílý text). Pořadí určuje pořadí tlačítek zleva doprava. */
  BARVY: [
    { key: 'cervena',  label: 'ČERVENÁ',  hex: '#E53935' },
    { key: 'oranzova', label: 'ORANŽOVÁ', hex: '#E8650A' },   // tmavší, aby se nepletla se žlutou
    { key: 'zluta',    label: 'ŽLUTÁ',    hex: '#FDD835' },
    { key: 'zelena',   label: 'ZELENÁ',   hex: '#43A047' },
    { key: 'modra',    label: 'MODRÁ',    hex: '#1E88E5' },
    { key: 'fialova',  label: 'FIALOVÁ',  hex: '#AB47BC' }
  ],

  /* ---- Texty obrazovek (lze používat jednoduché HTML: <strong>, <br>, <p>) */
  TEXTY: {
    UVOD_POZDRAV:
      'Nejprve prosím vyplňte dva údaje.',


    /* Úvodní informace o experimentu (1. obrazovka po „Připravit test“) */
    INFO:
      '<h2>Dobrý den, vítáme vás u našeho experimentu.</h2>' +
      '<p>V následujících minutách budete plnit krátký počítačový úkol zaměřený ' +
      'na rychlost a přesnost reakcí.</p>' +
      '<p>Na obrazovce se vám budou postupně zobrazovat názvy barev. Vaším úkolem bude ' +
      'vždy určit <strong>barvu, kterou je slovo napsané</strong>, nikoliv význam samotného slova.</p>' +
      '<p>Například pokud se na obrazovce objeví slovo ' +
      '<span class="ex-word" style="color:#E53935">MODRÁ</span> napsané červenou barvou, ' +
      'správnou odpovědí je <strong>červená</strong>, protože rozhodující je barva písma, ' +
      'nikoliv slovo, které vidíte.</p>' +
      '<p>V některých případech bude význam slova odpovídat jeho barvě, například slovo ' +
      '<span class="ex-word" style="color:#43A047">ZELENÁ</span> bude napsané zelenou barvou. ' +
      'V jiných případech se význam slova a barva písma budou lišit. V obou případech je ' +
      'vaším úkolem určit <strong>pouze barvu písma</strong>.</p>' +
      '<p>Odpověď budete zadávat kliknutím myší na jednu z možností, které se vám zobrazí ' +
      'na obrazovce. Snažte se reagovat co nejrychleji a zároveň co nejpřesněji.</p>' +
      '<p>Experiment se skládá ze dvou částí. V jedné části budete úkol řešit samostatně. ' +
      'V druhé části budou průběh administrace sledovat dva pozorovatelé. Pozorovatelé s vámi ' +
      'během řešení nebudou komunikovat ani do úkolu nijak zasahovat. Jejich úkolem bude ' +
      'pouze sledovat průběh administrace.</p>' +
      '<p>Mezi jednotlivými částmi experimentu bude zařazena krátká pauza v délce jedné minuty, ' +
      'během níž se na počítači rozezvoní zvoneček, tak se prosím nelekejte. Slouží pouze jako ' +
      'upozornění, že jste splnili první polovinu testu.</p>' +
      '<p>Celý experiment potrvá přibližně 15 až 20 minut. Během řešení se prosím snažte ' +
      'postupovat co nejpřesněji a zároveň reagovat co nejrychleji podle instrukcí, které dostanete.</p>' +
      '<p>Získaná data budou zaznamenávána v anonymizované podobě a budou využita výhradně ' +
      'pro účely tohoto výzkumu.</p>' +
      '<p>Účast v experimentu je dobrovolná a kdykoli můžete svou účast ukončit bez udání důvodu.</p>' +
      '<p>Děkujeme vám za účast. Nejprve vyplníte dva krátké údaje a pak si ukážeme, ' +
      'jak úkol vypadá.</p>',

    /* Ukázky krok za krokem (po vyplnění věku a pohlaví).
       slovo = co je napsáno, barva = barva písma = správná odpověď.
       Do dat se nic z ukázek nezapisuje. */
    UKAZKY: [
      { slovo: 'modra', barva: 'cervena',
        text: 'Slovo říká MODRÁ, ale je napsané <strong>červenou</strong> barvou. ' +
              'Správná odpověď je proto <strong>ČERVENÁ</strong>.' },
      { slovo: 'zelena', barva: 'zelena',
        text: 'Slovo ZELENÁ je napsané <strong>zelenou</strong> barvou. Význam slova a barva ' +
              'písma se shodují, správná odpověď je <strong>ZELENÁ</strong>.' },
      { slovo: 'zluta', barva: 'fialova',
        text: 'Slovo říká ŽLUTÁ, ale je napsané <strong>fialovou</strong> barvou. ' +
              'Správná odpověď je <strong>FIALOVÁ</strong>. Rozhoduje vždy jen barva písma.' }
    ],
    UKAZKA_NADPIS: 'Ukázka',          // zobrazí se jako „Ukázka 1 ze 3“
    UKAZKA_DALSI: 'Další ukázka',
    UKAZKA_ZPET: 'Zpět',
    START_TEXT:
      '<h2>Nyní můžeme začít</h2>' +
      '<p>Před každým slovem se na chvíli objeví křížek „+“, dívejte se na něj. ' +
      'Pak klikněte na tlačítko s <strong>barvou písma</strong>, co nejrychleji ' +
      'a zároveň co nejpřesněji. Během testu se nezobrazuje, zda jste odpověděli správně.</p>' +
      '<p>Až budete připraveni, klikněte na „Spustit test“.</p>',

    PAUZA:
      '<h2>První část je hotová.</h2>' +
      '<p>V další části budou přítomni dva pozorovatelé, kteří budou sledovat ' +
      'průběh administrace a správnost postupu při řešení úkolu. ' +
      'Chvilku prosím počkejte.</p>',
    PAUZA_KONEC: 'Až budete připraveni, klikněte na Pokračovat.',

    KONEC:
      '<h2>Děkujeme vám za účast!</h2>' +
      '<p>Test je u konce. Velmi si vážíme vašeho času a pozornosti, ' +
      'kterou jste úkolu věnovali – bez vás by tento výzkum nemohl vzniknout.</p>' +
      '<p>Prosím zůstaňte na místě, experimentátor za vámi za chvíli přijde.</p>',
    KONEC_KOD_POPISEK: 'Kód:'   // malý kód účastníka v pravém dolním rohu
  }
};
