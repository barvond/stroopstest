/* ==========================================================================
   stimuli.js – PEVNÁ SADA 80 POLOŽEK STROOPOVA TESTU
   --------------------------------------------------------------------------
   Sada je stejná pro obě kola i pro všechny účastníky. Mění se jen pořadí
   (míchá se v app.js zvlášť pro každé kolo a každého účastníka).

   slovo = co je napsáno (význam slova)
   barva = barva písma, kterou má účastník označit (správná odpověď)
   typ   = kongruentni (slovo = barva písma) / inkongruentni (slovo ≠ barva)

   Klíče barev (cervena, oranzova, …) odpovídají objektu BARVY v config.js.
   Položky 1–40 jsou kongruentní, 41–80 inkongruentní.
   ========================================================================== */

window.STROOP_STIMULI = Object.freeze([
  { id:  1, slovo: 'cervena',  barva: 'cervena',  typ: 'kongruentni' },
  { id:  2, slovo: 'cervena',  barva: 'cervena',  typ: 'kongruentni' },
  { id:  3, slovo: 'cervena',  barva: 'cervena',  typ: 'kongruentni' },
  { id:  4, slovo: 'cervena',  barva: 'cervena',  typ: 'kongruentni' },
  { id:  5, slovo: 'cervena',  barva: 'cervena',  typ: 'kongruentni' },
  { id:  6, slovo: 'cervena',  barva: 'cervena',  typ: 'kongruentni' },
  { id:  7, slovo: 'cervena',  barva: 'cervena',  typ: 'kongruentni' },
  { id:  8, slovo: 'oranzova', barva: 'oranzova', typ: 'kongruentni' },
  { id:  9, slovo: 'oranzova', barva: 'oranzova', typ: 'kongruentni' },
  { id: 10, slovo: 'oranzova', barva: 'oranzova', typ: 'kongruentni' },
  { id: 11, slovo: 'oranzova', barva: 'oranzova', typ: 'kongruentni' },
  { id: 12, slovo: 'oranzova', barva: 'oranzova', typ: 'kongruentni' },
  { id: 13, slovo: 'oranzova', barva: 'oranzova', typ: 'kongruentni' },
  { id: 14, slovo: 'oranzova', barva: 'oranzova', typ: 'kongruentni' },
  { id: 15, slovo: 'zluta',    barva: 'zluta',    typ: 'kongruentni' },
  { id: 16, slovo: 'zluta',    barva: 'zluta',    typ: 'kongruentni' },
  { id: 17, slovo: 'zluta',    barva: 'zluta',    typ: 'kongruentni' },
  { id: 18, slovo: 'zluta',    barva: 'zluta',    typ: 'kongruentni' },
  { id: 19, slovo: 'zluta',    barva: 'zluta',    typ: 'kongruentni' },
  { id: 20, slovo: 'zluta',    barva: 'zluta',    typ: 'kongruentni' },
  { id: 21, slovo: 'zluta',    barva: 'zluta',    typ: 'kongruentni' },
  { id: 22, slovo: 'zelena',   barva: 'zelena',   typ: 'kongruentni' },
  { id: 23, slovo: 'zelena',   barva: 'zelena',   typ: 'kongruentni' },
  { id: 24, slovo: 'zelena',   barva: 'zelena',   typ: 'kongruentni' },
  { id: 25, slovo: 'zelena',   barva: 'zelena',   typ: 'kongruentni' },
  { id: 26, slovo: 'zelena',   barva: 'zelena',   typ: 'kongruentni' },
  { id: 27, slovo: 'zelena',   barva: 'zelena',   typ: 'kongruentni' },
  { id: 28, slovo: 'zelena',   barva: 'zelena',   typ: 'kongruentni' },
  { id: 29, slovo: 'modra',    barva: 'modra',    typ: 'kongruentni' },
  { id: 30, slovo: 'modra',    barva: 'modra',    typ: 'kongruentni' },
  { id: 31, slovo: 'modra',    barva: 'modra',    typ: 'kongruentni' },
  { id: 32, slovo: 'modra',    barva: 'modra',    typ: 'kongruentni' },
  { id: 33, slovo: 'modra',    barva: 'modra',    typ: 'kongruentni' },
  { id: 34, slovo: 'modra',    barva: 'modra',    typ: 'kongruentni' },
  { id: 35, slovo: 'fialova',  barva: 'fialova',  typ: 'kongruentni' },
  { id: 36, slovo: 'fialova',  barva: 'fialova',  typ: 'kongruentni' },
  { id: 37, slovo: 'fialova',  barva: 'fialova',  typ: 'kongruentni' },
  { id: 38, slovo: 'fialova',  barva: 'fialova',  typ: 'kongruentni' },
  { id: 39, slovo: 'fialova',  barva: 'fialova',  typ: 'kongruentni' },
  { id: 40, slovo: 'fialova',  barva: 'fialova',  typ: 'kongruentni' },
  { id: 41, slovo: 'oranzova', barva: 'cervena',  typ: 'inkongruentni' },
  { id: 42, slovo: 'oranzova', barva: 'cervena',  typ: 'inkongruentni' },
  { id: 43, slovo: 'zluta',    barva: 'cervena',  typ: 'inkongruentni' },
  { id: 44, slovo: 'zelena',   barva: 'cervena',  typ: 'inkongruentni' },
  { id: 45, slovo: 'modra',    barva: 'cervena',  typ: 'inkongruentni' },
  { id: 46, slovo: 'modra',    barva: 'cervena',  typ: 'inkongruentni' },
  { id: 47, slovo: 'fialova',  barva: 'cervena',  typ: 'inkongruentni' },
  { id: 48, slovo: 'cervena',  barva: 'oranzova', typ: 'inkongruentni' },
  { id: 49, slovo: 'cervena',  barva: 'oranzova', typ: 'inkongruentni' },
  { id: 50, slovo: 'zluta',    barva: 'oranzova', typ: 'inkongruentni' },
  { id: 51, slovo: 'zelena',   barva: 'oranzova', typ: 'inkongruentni' },
  { id: 52, slovo: 'modra',    barva: 'oranzova', typ: 'inkongruentni' },
  { id: 53, slovo: 'fialova',  barva: 'oranzova', typ: 'inkongruentni' },
  { id: 54, slovo: 'fialova',  barva: 'oranzova', typ: 'inkongruentni' },
  { id: 55, slovo: 'cervena',  barva: 'zluta',    typ: 'inkongruentni' },
  { id: 56, slovo: 'oranzova', barva: 'zluta',    typ: 'inkongruentni' },
  { id: 57, slovo: 'zelena',   barva: 'zluta',    typ: 'inkongruentni' },
  { id: 58, slovo: 'zelena',   barva: 'zluta',    typ: 'inkongruentni' },
  { id: 59, slovo: 'modra',    barva: 'zluta',    typ: 'inkongruentni' },
  { id: 60, slovo: 'fialova',  barva: 'zluta',    typ: 'inkongruentni' },
  { id: 61, slovo: 'cervena',  barva: 'zelena',   typ: 'inkongruentni' },
  { id: 62, slovo: 'oranzova', barva: 'zelena',   typ: 'inkongruentni' },
  { id: 63, slovo: 'zluta',    barva: 'zelena',   typ: 'inkongruentni' },
  { id: 64, slovo: 'zluta',    barva: 'zelena',   typ: 'inkongruentni' },
  { id: 65, slovo: 'modra',    barva: 'zelena',   typ: 'inkongruentni' },
  { id: 66, slovo: 'fialova',  barva: 'zelena',   typ: 'inkongruentni' },
  { id: 67, slovo: 'cervena',  barva: 'modra',    typ: 'inkongruentni' },
  { id: 68, slovo: 'cervena',  barva: 'modra',    typ: 'inkongruentni' },
  { id: 69, slovo: 'oranzova', barva: 'modra',    typ: 'inkongruentni' },
  { id: 70, slovo: 'zluta',    barva: 'modra',    typ: 'inkongruentni' },
  { id: 71, slovo: 'zelena',   barva: 'modra',    typ: 'inkongruentni' },
  { id: 72, slovo: 'fialova',  barva: 'modra',    typ: 'inkongruentni' },
  { id: 73, slovo: 'fialova',  barva: 'modra',    typ: 'inkongruentni' },
  { id: 74, slovo: 'cervena',  barva: 'fialova',  typ: 'inkongruentni' },
  { id: 75, slovo: 'oranzova', barva: 'fialova',  typ: 'inkongruentni' },
  { id: 76, slovo: 'oranzova', barva: 'fialova',  typ: 'inkongruentni' },
  { id: 77, slovo: 'zluta',    barva: 'fialova',  typ: 'inkongruentni' },
  { id: 78, slovo: 'zelena',   barva: 'fialova',  typ: 'inkongruentni' },
  { id: 79, slovo: 'modra',    barva: 'fialova',  typ: 'inkongruentni' },
  { id: 80, slovo: 'modra',    barva: 'fialova',  typ: 'inkongruentni' }
]);

/* --------------------------------------------------------------------------
   KONTROLNÍ SOUČTY (ověřeno skriptem při generování sady)
   --------------------------------------------------------------------------
   Celkem položek: 80
   Podle kongruence:  kongruentní 40, inkongruentní 40

   Kongruentní (40) podle barvy:
     cervena 7, oranzova 7, zluta 7, zelena 7, modra 6, fialova 6
   Inkongruentní (40) podle barvy písma:
     cervena 7, oranzova 7, zluta 6, zelena 6, modra 7, fialova 7
   Inkongruentní (40) podle slova:
     cervena 7, oranzova 7, zluta 6, zelena 6, modra 7, fialova 7
     (všech 30 kombinací slovo × barva písma je zastoupeno alespoň jednou,
      10 kombinací dvakrát)

   Všech 80 podle barvy písma:
     cervena 14, oranzova 14, zluta 13, zelena 13, modra 13, fialova 13
   Všech 80 podle slova:
     cervena 14, oranzova 14, zluta 13, zelena 13, modra 13, fialova 13
   -------------------------------------------------------------------------- */
