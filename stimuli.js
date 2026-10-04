/* ==========================================================================
   stimuli.js – PEVNÁ SADA 40 POLOŽEK STROOPOVA TESTU (verze 1.2.0)
   --------------------------------------------------------------------------
   Sada je stejná pro obě kola i pro všechny účastníky. Mění se jen pořadí
   (míchá se v app.js zvlášť pro každé kolo a každého účastníka).
   Každé kolo = těchto 40 položek, celkem tedy 80 odpovědí na účastníka.

   slovo = co je napsáno (význam slova)
   barva = barva písma, kterou má účastník označit (správná odpověď)
   typ   = kongruentni (slovo = barva písma) / inkongruentni (slovo ≠ barva)

   Klíče barev (cervena, oranzova, …) odpovídají objektu BARVY v config.js.
   Položky 1–20 jsou kongruentní, 21–40 inkongruentní.
   ========================================================================== */

window.STROOP_STIMULI = Object.freeze([
  { id:  1, slovo: 'cervena',  barva: 'cervena',  typ: 'kongruentni' },
  { id:  2, slovo: 'cervena',  barva: 'cervena',  typ: 'kongruentni' },
  { id:  3, slovo: 'cervena',  barva: 'cervena',  typ: 'kongruentni' },
  { id:  4, slovo: 'oranzova', barva: 'oranzova', typ: 'kongruentni' },
  { id:  5, slovo: 'oranzova', barva: 'oranzova', typ: 'kongruentni' },
  { id:  6, slovo: 'oranzova', barva: 'oranzova', typ: 'kongruentni' },
  { id:  7, slovo: 'zluta',    barva: 'zluta',    typ: 'kongruentni' },
  { id:  8, slovo: 'zluta',    barva: 'zluta',    typ: 'kongruentni' },
  { id:  9, slovo: 'zluta',    barva: 'zluta',    typ: 'kongruentni' },
  { id: 10, slovo: 'zelena',   barva: 'zelena',   typ: 'kongruentni' },
  { id: 11, slovo: 'zelena',   barva: 'zelena',   typ: 'kongruentni' },
  { id: 12, slovo: 'zelena',   barva: 'zelena',   typ: 'kongruentni' },
  { id: 13, slovo: 'modra',    barva: 'modra',    typ: 'kongruentni' },
  { id: 14, slovo: 'modra',    barva: 'modra',    typ: 'kongruentni' },
  { id: 15, slovo: 'modra',    barva: 'modra',    typ: 'kongruentni' },
  { id: 16, slovo: 'modra',    barva: 'modra',    typ: 'kongruentni' },
  { id: 17, slovo: 'fialova',  barva: 'fialova',  typ: 'kongruentni' },
  { id: 18, slovo: 'fialova',  barva: 'fialova',  typ: 'kongruentni' },
  { id: 19, slovo: 'fialova',  barva: 'fialova',  typ: 'kongruentni' },
  { id: 20, slovo: 'fialova',  barva: 'fialova',  typ: 'kongruentni' },
  { id: 21, slovo: 'oranzova', barva: 'cervena',  typ: 'inkongruentni' },
  { id: 22, slovo: 'zluta',    barva: 'cervena',  typ: 'inkongruentni' },
  { id: 23, slovo: 'modra',    barva: 'cervena',  typ: 'inkongruentni' },
  { id: 24, slovo: 'fialova',  barva: 'cervena',  typ: 'inkongruentni' },
  { id: 25, slovo: 'cervena',  barva: 'oranzova', typ: 'inkongruentni' },
  { id: 26, slovo: 'zelena',   barva: 'oranzova', typ: 'inkongruentni' },
  { id: 27, slovo: 'modra',    barva: 'oranzova', typ: 'inkongruentni' },
  { id: 28, slovo: 'fialova',  barva: 'oranzova', typ: 'inkongruentni' },
  { id: 29, slovo: 'cervena',  barva: 'zluta',    typ: 'inkongruentni' },
  { id: 30, slovo: 'modra',    barva: 'zluta',    typ: 'inkongruentni' },
  { id: 31, slovo: 'fialova',  barva: 'zluta',    typ: 'inkongruentni' },
  { id: 32, slovo: 'cervena',  barva: 'zelena',   typ: 'inkongruentni' },
  { id: 33, slovo: 'oranzova', barva: 'zelena',   typ: 'inkongruentni' },
  { id: 34, slovo: 'zluta',    barva: 'zelena',   typ: 'inkongruentni' },
  { id: 35, slovo: 'oranzova', barva: 'modra',    typ: 'inkongruentni' },
  { id: 36, slovo: 'zluta',    barva: 'modra',    typ: 'inkongruentni' },
  { id: 37, slovo: 'zelena',   barva: 'modra',    typ: 'inkongruentni' },
  { id: 38, slovo: 'cervena',  barva: 'fialova',  typ: 'inkongruentni' },
  { id: 39, slovo: 'oranzova', barva: 'fialova',  typ: 'inkongruentni' },
  { id: 40, slovo: 'zelena',   barva: 'fialova',  typ: 'inkongruentni' }
]);

/* --------------------------------------------------------------------------
   KONTROLNÍ SOUČTY (ověřeno skriptem při generování sady)
   --------------------------------------------------------------------------
   Celkem položek: 40
   Podle kongruence:  kongruentní 20, inkongruentní 20

   Kongruentní (20) podle barvy:
     cervena 3, oranzova 3, zluta 3, zelena 3, modra 4, fialova 4
   Inkongruentní (20) podle barvy písma:
     cervena 4, oranzova 4, zluta 3, zelena 3, modra 3, fialova 3
   Inkongruentní (20) podle slova:
     cervena 4, oranzova 4, zluta 3, zelena 3, modra 3, fialova 3
     (20 různých kombinací slovo × barva písma, žádná se neopakuje)

   Všech 40 podle barvy písma:
     cervena 7, oranzova 7, zluta 6, zelena 6, modra 7, fialova 7
   Všech 40 podle slova:
     cervena 7, oranzova 7, zluta 6, zelena 6, modra 7, fialova 7
   -------------------------------------------------------------------------- */
