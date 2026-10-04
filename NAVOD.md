# Stroopův test – návod k nasazení a použití

Výzkum „Vliv publika na kognitivní výkon“, Katedra psychologie FF UP Olomouc.
Web: `https://barvond.github.io/stroopstest/`

Návod je psaný pro člověka, který neprogramuje. Postupujte krok za krokem.

---

## Co je v repozitáři

| Soubor | K čemu je |
|---|---|
| `index.html` | stránka testu |
| `style.css` | vzhled |
| `app.js` | logika testu (není potřeba měnit) |
| `config.js` | **nastavení** – sem patří URL Google tabulky, časy a texty |
| `stimuli.js` | pevná sada 80 položek (ID 1–80), kontrolní součty jsou na konci souboru |
| `video/instrukce.mp4` | instruktážní video (nahrajete sami; bez něj se zobrazí textové instrukce) |
| `audio/zvonek.mp3` | nepovinné – vlastní zvonění; když chybí, aplikace zvoní sama |
| `apps-script/Code.gs` | kód pro Google tabulku |

---

## Krok 1: Google tabulka a Apps Script

Dělá ten, na jehož Google účtu mají data být.

1. Otevřete <https://sheets.google.com> a založte **novou prázdnou tabulku**. Pojmenujte ji např. „Stroop – data“.
2. V tabulce klikněte v horním menu na **Rozšíření → Apps Script**. Otevře se nové okno s editorem.
3. V editoru je soubor `Kód.gs` (nebo `Code.gs`) s pár řádky. **Smažte všechno**, co v něm je.
4. Otevřete soubor `apps-script/Code.gs` z repozitáře, zkopírujte celý jeho obsah a vložte ho do editoru.
5. Klikněte na ikonu diskety (**Uložit projekt**). Projekt můžete pojmenovat „Stroop“.

Listy `polozky`, `souhrn`, `test_polozky` a `test_souhrn` nemusíte zakládat, skript si je založí sám při prvním zápisu.

## Krok 2: Nasazení skriptu jako webové aplikace

1. V editoru Apps Scriptu klikněte vpravo nahoře na **Nasadit → Nové nasazení**.
2. U „Vyberte typ“ klikněte na ozubené kolečko a zvolte **Webová aplikace**.
3. Vyplňte:
   - **Popis:** Stroop v1
   - **Spustit jako:** **Já** (váš e-mail)
   - **Kdo má přístup:** **Kdokoli**
4. Klikněte na **Nasadit**.
5. Google bude chtít **autorizovat přístup**. Klikněte na „Autorizovat přístup“, vyberte svůj účet. Objeví se varování „Google tuto aplikaci neověřil“ – klikněte na **Rozšířené** (Advanced) → **Přejít na Stroop (nezabezpečené)** → **Povolit**. Je to v pořádku, jde o váš vlastní skript.
6. Zobrazí se **URL webové aplikace** končící na `/exec`. **Zkopírujte ji** (tlačítko Kopírovat).
7. Kontrola: vložte URL do nového panelu prohlížeče. Musí se zobrazit `{"ok":true,"zprava":"Stroop – spojení funguje"}`.

> **Pozor:** Pokud později v `Code.gs` cokoli změníte, je nutné vydat novou verzi: **Nasadit → Spravovat nasazení → tužka (Upravit) → Verze: Nová verze → Nasadit**. URL zůstane stejná.

## Krok 3: Vložení URL do `config.js`

1. Otevřete `config.js`.
2. Najděte řádek `SHEETS_URL: '',`
3. Mezi apostrofy vložte zkopírovanou URL, např.:
   `SHEETS_URL: 'https://script.google.com/macros/s/AKfycb.../exec',`
4. Uložte. Apostrofy i čárka na konci musí zůstat.

## Krok 4: Nahrání na GitHub a zapnutí GitHub Pages

1. Přihlaste se na <https://github.com> a otevřete repozitář **barvond/stroopstest** (když neexistuje: vpravo nahoře **+ → New repository**, název `stroopstest`, **Public**, Create).
2. Klikněte na **Add file → Upload files** a přetáhněte do okna **všechny soubory a složky** (`index.html`, `style.css`, `app.js`, `config.js`, `stimuli.js`, složky `apps-script`, `video`, případně `audio`, a tento `NAVOD.md`). Struktura složek musí zůstat zachovaná.
3. Dole klikněte na **Commit changes**.
4. **Video:** soubor se musí jmenovat přesně `instrukce.mp4` a ležet ve složce `video`. Nahrajte ho přes Add file → Upload files (přetáhněte celou složku `video`). Přes webové rozhraní jde nahrát soubor do **25 MB**; větší video zmenšete (např. HandBrake, 720p).
5. Zapněte Pages: **Settings → Pages**. U „Source“ zvolte **Deploy from a branch**, branch **main**, složka **/ (root)** → **Save**.
6. Za 1–3 minuty bude web na `https://barvond.github.io/stroopstest/`.

Úprava souboru později: otevřete soubor na GitHubu → tužka (Edit) → upravit → **Commit changes**. Změna se projeví do pár minut (v prohlížeči pak stiskněte Ctrl+F5).

## Krok 5: Ověření, že vše funguje

1. Otevřete `https://barvond.github.io/stroopstest/?test=1`.
   - Vlevo nahoře musí být žlutý štítek **TESTOVACÍ REŽIM**.
   - Vpravo nahoře musí být **Google Sheets: ✓ nastaveno**. Když je ✗, chybí URL v `config.js`.
2. Klikněte na **Test zvuku** vpravo nahoře – musí zaznít zvonění. Nastavte hlasitost počítače tak, aby ho bylo slyšet za dveřmi.
3. Projděte celý test (v testovacím režimu má každé kolo jen 6 položek a pauza 5 s).
4. Na konci zkontrolujte:
   - ukazatel vpravo dole: **Data uložena ✓**,
   - stáhl se soubor `stroop_<kód>_<datum>.csv`,
   - v Google tabulce přibyly listy **test_polozky** (12 řádků) a **test_souhrn** (2 řádky).
5. Otevřete `https://barvond.github.io/stroopstest/?admin=1` – účastník z testu musí být v seznamu.
6. Testovací data v tabulce klidně smažte (smažte celé listy `test_…`, skript si je při dalším testu založí znovu).

---

## Postup experimentátora u každého účastníka

**Jednorázově na laboratorním počítači:** v Chrome/Edge v Nastavení → Stahování vypněte „Před stažením se zeptat, kam soubor uložit“, aby se CSV uložilo samo do složky Stažené soubory. Používejte pořád **stejný prohlížeč** (lokální zálohy jsou vázané na prohlížeč a adresu webu). Nepoužívejte anonymní okno – po jeho zavření se zálohy smažou.

**Před účastníkem**

1. Zapněte zvuk počítače **na maximum** (a zkontrolujte, že nejsou připojená sluchátka).
2. Otevřete `https://barvond.github.io/stroopstest/` (bez `?test=1`).
3. Zkontrolujte vpravo nahoře **Google Sheets: ✓**. Případně klikněte na **Test zvuku**.
4. Účastník podepíše papírový informovaný souhlas.
5. Klikněte na **Připravit test pro účastníka**. Stránka se přepne na celou obrazovku a objeví se úvodní obrazovka s věkem a pohlavím.
6. Posaďte účastníka k počítači a **odejděte z místnosti**.

**Během testu**

- Po 1. kole zazní **zvonění** – to je signál pro dva pozorovatele, aby vešli do místnosti. Účastník mezitím vidí odpočet 60 s.

**Po skončení**

1. Na obrazovce je velký **kód účastníka** – zapište ho na papírový informovaný souhlas.
2. Zkontrolujte ukazatel vpravo dole:
   - **Data uložena ✓** – vše v pořádku.
   - **Data odeslána (bez potvrzení), záloha v počítači ✓** – data téměř jistě dorazila; ověřte v tabulce, že tam kód je.
   - **Uložení online selhalo…** – nic se neděje, data jsou v počítači (viz níže).
3. Proveďte ústní debriefing.
4. Celou obrazovku ukončete klávesou **Esc**. Pro dalšího účastníka stránku obnovte (F5).

## Když nejde internet

Test běží normálně i bez internetu (stránka musí být jen jednou načtená). Data jsou uložená dvakrát:

1. **CSV soubor** ve složce Stažené soubory (`stroop_<kód>_<datum>.csv`). Otevře se rovnou v českém Excelu.
2. **Záloha v prohlížeči** – otevřete `…/stroopstest/?admin=1`:
   - **Znovu odeslat neodeslaná data do Google Sheets** – až internet zase půjde, jedním kliknutím se dopošle vše, co se neodeslalo,
   - **Stáhnout vše jako CSV** / **Stáhnout souhrny jako CSV** – všechna data z tohoto počítače,
   - **Smazat lokální zálohy** – až budete mít data bezpečně jinde (na konci sběru).

## Vyřazení dat na žádost účastníka

V Google tabulce v listech `polozky` i `souhrn` vyfiltrujte sloupec `kod_ucastnika` podle kódu ze souhlasu a řádky smažte. Totéž v CSV souborech a lokální zálohu smažte přes admin stránku (maže se ale vše najednou, takže nejdřív stáhněte CSV a řádky odstraňte tam).

## Poznámky k datům

- `rt_ms` = reakční čas v ms (od vykreslení slova do stisknutí tlačítka myši).
- `slovo`, `barva_pisma`, `odpoved` používají názvy bez diakritiky: `cervena, oranzova, zluta, zelena, modra, fialova`.
- `pohlavi`: `zena, muz, jine, nechci_uvest`.
- `opustil_okno = 1`: během této položky účastník opustil celou obrazovku nebo přepnul okno.
- Pokud se kolo odeslalo „bez potvrzení“ a pak ještě ručně znovu, může být v tabulce dvakrát. Duplicitu poznáte podle stejné kombinace `kod_ucastnika` + `kolo` + `poradi_v_kole`.
- Ostrá a testovací data jsou oddělená (listy `polozky`/`souhrn` vs. `test_…`, sloupec `testovaci_rezim`).

## Úpravy nastavení (`config.js`)

- `PAUSE_SECONDS` – délka pauzy (60), `FIXATION_MS` – délka křížku (500 ms).
- `TEXTY` – všechny texty obrazovek (instrukce, pauza, konec).
- `APP_VERSION` – při jakékoli změně během sběru dat zvyšte (např. na 1.0.1), zapisuje se do dat.

---

## Kontrolní seznam pro pilotní test

1. [ ] `?test=1` ukazuje štítek TESTOVACÍ REŽIM a Google Sheets ✓.
2. [ ] Test zvuku: zvonění je slyšet **za zavřenými dveřmi** při hlasitosti, kterou budete používat.
3. [ ] „Připravit test“ přepne do celé obrazovky.
4. [ ] Tlačítko Pokračovat u věku a pohlaví je neaktivní, dokud nejsou vyplněné obě položky; věk 14 nebo 100 nejde zadat.
5. [ ] Video se přehraje se zvukem a Pokračovat se odemkne až po dohrání. (Bez videa se zobrazí text.)
6. [ ] Účastník bez pomoci pochopí z instrukcí, že kliká na **barvu písma** (zeptejte se pilotního účastníka).
7. [ ] Slovo i tlačítka se při testu nehýbou, žlutá je dobře čitelná na monitoru v laboratoři.
8. [ ] Klik během křížku nic neudělá; dvojklik na odpověď nepřeskočí další slovo.
9. [ ] Na začátku pauzy zazní zvonění, odpočet nejde přeskočit (kliky ani klávesy), po 0 se objeví Pokračovat.
10. [ ] Pozorovatelé stihnou během 60 s přijít a usadit se.
11. [ ] Na konci je čitelný kód, ukazatel „Data uložena ✓“ a stáhl se CSV soubor.
12. [ ] CSV se v Excelu otevře se správnými sloupci, diakritikou a desetinnými čárkami.
13. [ ] V tabulce je v `test_souhrn` sloupec `uspesnost_procent` a hodnoty sedí s tím, jak jste klikali (zkuste schválně pár chyb).
14. [ ] Při vypnuté Wi-Fi test doběhne, ukazatel ukáže selhání a admin stránka data po zapnutí Wi-Fi dopošle.
15. [ ] Ostrý běh (bez `?test=1`) má 80 + 80 položek a trvá rozumnou dobu (změřte).

---

## Předpoklady (rozhodnuto při vývoji, zadání je neřešilo)

1. **`datum_cas_startu`** = čas kliknutí na „Připravit test“ (ISO 8601, UTC).
2. Sloupec **`opustil_okno`** je přidaný jako **poslední** sloupec položkových dat (za `rozliseni_obrazovky`), aby zůstalo zachované pořadí z kap. 7.1.
3. Hodnoty `slovo`, `barva_pisma`, `odpoved` a `pohlavi` se zapisují **bez diakritiky** (`cervena`, `nechci_uvest` …) kvůli snadné analýze.
4. Konkrétní 80 položek: kongruentní ČERVENÁ, ORANŽOVÁ, ŽLUTÁ, ZELENÁ 7×, MODRÁ, FIALOVÁ 6×; inkongruentní všech 30 kombinací + 10 dalších zvolených tak, aby i v součtu všech 80 položek měla každá barva písma i každé slovo 13–14 výskytů.
5. **Testovací režim:** 6 položek na kolo = 3 kongruentní + 3 inkongruentní, náhodně vybrané ze sady (zvlášť pro každé kolo), se stejnými pravidly míchání.
6. **Reakční čas** se bere z časové značky události `pointerdown` (stejná časová osa jako `performance.now()`); počítá se jen levé tlačítko myši. Klávesnicí odpovídat nejde.
7. **Stav „odesláno, nepotvrzeno“** (režim `no-cors`) se na konci zobrazuje jako „Data odeslána (bez potvrzení), záloha v počítači ✓“ a admin stránka ho znovu neposílá, aby nevznikaly duplicity.
8. Odeslání: první pokus + 3 opakování s prodlevami 1,5 s, 4 s a 8 s.
9. **Kód účastníka** se vygeneruje znovu, kdyby vypadal jako číslo (např. `23456` nebo `2E345` – Excel/Sheets by ho převedly) nebo kolidoval s kódem uloženým na tomto počítači. V tabulce se kód ukládá jako text.
10. Pokud se video do 10 s vůbec nezačne načítat, zobrazí se textové instrukce (pojistka k události `error`). Video se po zobrazení obrazovky pokusí spustit samo; když to prohlížeč nedovolí, účastník klikne na Přehrát. Tlačítko pro celou obrazovku ve videu je vypnuté, aby video nerozbilo celoobrazovkový režim stránky.
11. Varování při zavření stránky platí od „Začít“ do konce testu, na konečné obrazovce už ne.
12. Klávesnice je během kol a odpočtu zablokovaná; Esc (opuštění celé obrazovky) prohlížeč zablokovat nedovolí – zapíše se jako `opustil_okno`.
13. CSV obsahuje na konci testu jen položkové řádky (jak zadání požaduje); souhrny jde stáhnout na admin stránce.
14. Zvonění: syntetický elektrický zvonek 3,5 s (cca 760 Hz, 18 úderů/s) přes Web Audio API; přednostně se použije `audio/zvonek.mp3`, pokud existuje.
15. Na přípravné obrazovce je kromě ukazatele Sheets a testu zvuku i malý odkaz „Administrace“.
