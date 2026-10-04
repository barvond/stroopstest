/* ==========================================================================
   Code.gs – Google Apps Script pro Stroopův test
   --------------------------------------------------------------------------
   Přijímá data z webu a zapisuje je do této Google tabulky.
     ostrá data       → listy „polozky“ a „souhrn“
     testovací data   → listy „test_polozky“ a „test_souhrn“
   Listy se založí samy (včetně hlavičky), pokud neexistují.

   Nasazení: Nasadit → Nové nasazení → Webová aplikace,
             Spustit jako: Já, Kdo má přístup: Kdokoli.
   Podrobný postup je v NAVOD.md.
   ========================================================================== */

// Sloupce položkových řádků (stejné pořadí jako na webu)
var HLAVICKA_POLOZKY = [
  'kod_ucastnika', 'datum_cas_startu', 'vek', 'vek_mimo_rozsah', 'pohlavi',
  'kolo', 'podminka', 'poradi_v_kole', 'id_polozky',
  'slovo', 'barva_pisma', 'typ',
  'odpoved', 'spravne', 'rt_s', 'cas_odpovedi_iso',
  'testovaci_rezim', 'verze_aplikace', 'user_agent', 'rozliseni_obrazovky',
  'opustil_okno'
];

// Sloupce souhrnných řádků
var HLAVICKA_SOUHRN = [
  'kod_ucastnika', 'datum_cas_startu', 'vek', 'pohlavi', 'kolo', 'podminka',
  'pocet_polozek', 'pocet_spravne', 'uspesnost_procent',
  'uspesnost_kongruentni_procent', 'uspesnost_inkongruentni_procent',
  'prumer_rt_spravne_s', 'median_rt_spravne_s',
  'prumer_rt_kongruentni_spravne_s', 'prumer_rt_inkongruentni_spravne_s',
  'stroop_efekt_s',
  'testovaci_rezim'
];

// Sloupce, které se mají uložit jako text (aby je tabulka nepřevedla
// na číslo nebo datum, např. kód „2E345“)
var TEXTOVE_SLOUPCE = ['kod_ucastnika', 'datum_cas_startu', 'cas_odpovedi_iso',
                       'user_agent', 'rozliseni_obrazovky', 'verze_aplikace'];

/** Test spojení: otevřete URL skriptu v prohlížeči → {"ok":true} */
function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return vratJson({ ok: !!ss, zprava: ss ? 'Stroop – spojení funguje, tabulka: ' + ss.getName()
                                         : 'Skript není připojený k tabulce' });
}

/** Příjem dat z webu: { trials: [...], summaries: [...] } */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);   // počká, až dopíše jiný souběžný zápis
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error('Skript není připojený k tabulce – vytvořte ho v tabulce přes Rozšíření → Apps Script.');

    var trials = data.trials || [];
    var summaries = data.summaries || [];
    var n = 0;
    n += zapisDoListu(ss, 'polozky', HLAVICKA_POLOZKY, trials.filter(jeOstry));
    n += zapisDoListu(ss, 'test_polozky', HLAVICKA_POLOZKY, trials.filter(jeTestovaci));
    n += zapisDoListu(ss, 'souhrn', HLAVICKA_SOUHRN, summaries.filter(jeOstry));
    n += zapisDoListu(ss, 'test_souhrn', HLAVICKA_SOUHRN, summaries.filter(jeTestovaci));
    SpreadsheetApp.flush();

    return vratJson({ ok: true, zapsano: n });
  } catch (err) {
    return vratJson({ ok: false, chyba: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) { /* nic */ }
  }
}

function jeTestovaci(r) { return Number(r.testovaci_rezim) === 1; }
function jeOstry(r) { return !jeTestovaci(r); }

/** Zapíše řádky do listu; list i hlavičku případně založí. Vrací počet řádků. */
function zapisDoListu(ss, nazev, hlavicka, radky) {
  if (!radky.length) return 0;

  var list = ss.getSheetByName(nazev);
  if (!list) list = ss.insertSheet(nazev);

  // Hlavička: když list nemá žádné sloupce, zapíšeme ji celou
  var hl;
  if (list.getLastColumn() === 0) {
    hl = hlavicka.slice();
    list.getRange(1, 1, 1, hl.length).setValues([hl]).setFontWeight('bold');
    list.setFrozenRows(1);
  } else {
    hl = list.getRange(1, 1, 1, list.getLastColumn()).getValues()[0].map(String);
    // chybějící sloupce doplníme na konec (kdyby se později přidaly)
    hlavicka.forEach(function (h) {
      if (hl.indexOf(h) < 0) {
        hl.push(h);
        list.getRange(1, hl.length).setValue(h).setFontWeight('bold');
      }
    });
  }

  // Hodnoty seřadíme podle hlavičky v listu
  var hodnoty = radky.map(function (r) {
    return hl.map(function (h) {
      var v = r[h];
      return (v === undefined || v === null) ? '' : v;
    });
  });

  var start = list.getLastRow() + 1;
  // textové sloupce nastavit jako „prostý text“ ještě před zápisem
  hl.forEach(function (h, i) {
    if (TEXTOVE_SLOUPCE.indexOf(h) >= 0) {
      list.getRange(start, i + 1, hodnoty.length, 1).setNumberFormat('@');
    }
  });
  list.getRange(start, 1, hodnoty.length, hl.length).setValues(hodnoty);
  return hodnoty.length;
}

function vratJson(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
