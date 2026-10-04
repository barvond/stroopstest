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
  APP_VERSION: '1.0.0',

  /* ---- Časování a rozsah testu ------------------------------------------ */
  FIXATION_MS: 500,          // jak dlouho svítí křížek „+“ před slovem (ms)
  PAUSE_SECONDS: 60,         // délka pauzy mezi koly (s)
  TRIALS_PER_ROUND: 80,      // počet položek v jednom kole

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

  /* ---- Instruktážní video ---------------------------------------------- */
  VIDEO_FILE: 'video/instrukce.mp4',

  /* ---- Barvy ------------------------------------------------------------
     key: interní název (zapisuje se do dat), label: co se zobrazí,
     hex: barva písma. Pořadí určuje pořadí tlačítek zleva doprava. */
  BARVY: [
    { key: 'cervena',  label: 'ČERVENÁ',  hex: '#E53935' },
    { key: 'oranzova', label: 'ORANŽOVÁ', hex: '#FB8C00' },
    { key: 'zluta',    label: 'ŽLUTÁ',    hex: '#FDD835' },
    { key: 'zelena',   label: 'ZELENÁ',   hex: '#43A047' },
    { key: 'modra',    label: 'MODRÁ',    hex: '#1E88E5' },
    { key: 'fialova',  label: 'FIALOVÁ',  hex: '#AB47BC' }
  ],

  /* ---- Texty obrazovek (lze používat jednoduché HTML: <strong>, <br>, <p>) */
  TEXTY: {
    UVOD_POZDRAV:
      'Vítejte. Děkujeme za účast ve výzkumu. Nejprve prosím vyplňte dva údaje.',

    VIDEO_NADPIS: 'Instrukce k testu',
    VIDEO_HOTOVO: 'Video můžete pustit znovu, nebo pokračujte dál.',
    VIDEO_CEKANI: 'Pusťte si prosím video. Tlačítko „Pokračovat“ se odemkne po jeho dohrání.',

    INSTRUKCE:
      '<h2>Jak test probíhá</h2>' +
      '<p>Uprostřed obrazovky se vždy objeví slovo, které označuje barvu. ' +
      'Slovo je napsané nějakou barvou písma.</p>' +
      '<p>Vaším úkolem je <strong>kliknout na tlačítko s barvou písma</strong>, ' +
      'ne na to, co slovo znamená.</p>' +
      '<p>Příklad: když uvidíte slovo ' +
      '<span style="color:#E53935;font-weight:700">ZELENÁ</span> napsané červeně, klikněte na ČERVENÁ.</p>' +
      '<p>Odpovídejte co nejrychleji a zároveň co nejpřesněji. Před každým slovem ' +
      'se na chvíli objeví křížek „+“, dívejte se na něj.</p>' +
      '<p>Test má dvě části. Až budete připraveni, klikněte na „Začít“.</p>',

    PAUZA:
      '<h2>První část je hotová.</h2>' +
      '<p>V další části budou přítomni dva pozorovatelé, kteří budou sledovat ' +
      'průběh administrace a správnost postupu při řešení úkolu. ' +
      'Chvilku prosím počkejte.</p>',
    PAUZA_KONEC: 'Až budete připraveni, klikněte na Pokračovat.',

    KONEC:
      'Děkujeme, test je u konce. Prosím zůstaňte na místě, experimentátor za vámi přijde.',
    KONEC_KOD_POPISEK: 'Váš kód (experimentátor si ho zapíše):'
  }
};
