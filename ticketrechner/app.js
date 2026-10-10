/* Ticketrechner – Leisure Workspace
 * Rohertrag (Deckungsbeitrag) pro Ticket und Break-even aus Ticketpreis,
 * Umsatzsteuer (0/7/19 %), variablen und fixen Kosten.
 * Optional: Margenbesteuerung für Reiseleistungen nach § 25 UStG.
 * Alle Daten bleiben lokal (localStorage + JSON-Datei).
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'lw-ticketrechner-v1';
  const LANG_KEY = 'lw-ticketrechner-lang';
  const VAT_RATES = [19, 7, 0];

  // ─── i18n ─────────────────────────────────────────────
  const I18N = {
    de: {
      toolTitle: 'Ticketrechner',
      allTools: 'Alle Tools ↗',
      eyebrow: 'Zahlen verständlich machen',
      title: 'Ticketrechner',
      lead: 'Vom Ticketpreis zum Rohertrag: Umsatzsteuer herausrechnen, variable Kosten abziehen und sehen, ab wie vielen verkauften Tickets sich ein Angebot lohnt.',
      inputs: 'Eingaben',
      results: 'Ergebnis',
      priceHead: 'Ticketpreis & Umsatzsteuer',
      priceLabel: 'Ticketpreis (brutto, inkl. USt)',
      vatLabel: 'Umsatzsteuersatz',
      vatHint: '19 % Regelsatz · 7 % z. B. Museen, Zoos, Theater, Konzerte, Personennahverkehr · 0 % steuerfreie Leistungen (z. B. § 4 Nr. 20 UStG).',
      modeLabel: 'Besteuerungsart',
      modeStandard: 'Regelbesteuerung',
      modeMargin: 'Reiseleistung (§ 25 UStG)',
      modeHintStandard: 'Die Umsatzsteuer wird aus dem gesamten Bruttopreis herausgerechnet. Kosten bitte netto eingeben (Vorsteuer ist abziehbar).',
      modeHintMargin: 'Margenbesteuerung: Umsatzsteuer nur auf die Differenz zwischen Reisepreis und eingekauften Reisevorleistungen. Reisevorleistungen (Bus, Hotel, Eintritte Dritter …) markieren und brutto eingeben – Vorsteuerabzug ist dafür ausgeschlossen.',
      varHead: 'Variable Kosten pro Ticket',
      varHint: 'Kosten, die mit jedem verkauften Ticket anfallen – als Betrag in € oder als % vom Bruttopreis (z. B. Provisionen, Zahlungsgebühren).',
      fixHead: 'Fixe Kosten',
      fixHint: 'Kosten, die unabhängig von der Ticketanzahl anfallen – pro Veranstaltung, Reise oder Saison (z. B. Bus, Guide, Marketing).',
      addVar: '+ Variable Kosten hinzufügen',
      addFix: '+ Fixe Kosten hinzufügen',
      planHead: 'Planung (optional)',
      plannedLabel: 'Geplante Tickets',
      capacityLabel: 'Kapazität (max. Tickets)',
      import: 'Import',
      export: 'Export',
      importTitle: 'Eingaben aus einer Datei laden (.json)',
      exportTitle: 'Eingaben als Datei speichern (.json)',
      pdfTitle: 'Kalkulation als PDF speichern (1 Seite A4)',
      exported: 'Eingaben exportiert.',
      imported: '„{f}“ importiert.',
      pdfDone: 'PDF erstellt.',
      pdfError: 'Das PDF konnte nicht erstellt werden. Bitte Internetverbindung prüfen.',
      pdfCreated: 'erstellt am',
      pdfInputs: 'Eingaben',
      pdfBase: 'Preis, Steuer & Planung',
      pdfFooter: 'Vereinfachte Kalkulation ohne Gewähr. Keine Steuerberatung – Steuersätze und § 25 UStG im Einzelfall prüfen.',
      save: 'Speichern',
      load: 'Laden',
      print: 'Drucken / PDF',
      reset: 'Zurücksetzen',
      resetConfirm: 'Alle Eingaben zurücksetzen und mit leeren Feldern starten?',
      loadError: 'Die Datei konnte nicht gelesen werden. Bitte eine mit dem Ticketrechner exportierte .json-Datei wählen.',
      kpiDb: 'Rohertrag pro Ticket',
      beHead: 'Ab wann lohnt es sich?',
      beEmpty: 'Gib einen Ticketpreis ein, um den Break-even zu sehen.',
      beAnswer: 'Du musst mindestens {n} verkaufen, damit sich das Angebot rentiert.',
      beDetail: 'Bei {a} machst du noch {l} Verlust, ab {b} bist du mit {g} im Plus. Jedes weitere Ticket bringt {d} zusätzlich.',
      beCapacity: 'Das sind {p} deiner Kapazität von {c}.',
      beNever: 'Mit diesen Annahmen rentiert sich das Angebot nie: Jedes Ticket kostet mehr, als es netto einbringt.',
      beFromFirst: 'Es gibt keine Fixkosten, das Angebot lohnt sich ab dem ersten Ticket.',
      targetLabel: 'Zielgewinn (€)',
      targetAnswer: 'Für {z} Gewinn brauchst du {n}.',
      targetNever: 'Ein Gewinn von {z} ist mit diesen Annahmen nicht erreichbar.',
      targetOverCap: 'Das liegt über der Kapazität.',
      tagTarget: 'Ziel',
      cTickets: 'Tickets',
      cRevenue: 'Umsatz brutto',
      cResult: 'Ergebnis',
      kpiBe: 'Break-even ab',
      kpiNet: 'Nettoerlös pro Ticket',
      kpiPlan: 'Ergebnis bei Planmenge',
      ofNet: 'vom Nettoerlös',
      tickets: 'Tickets',
      ticket: 'Ticket',
      beRevenue: 'Umsatz (brutto)',
      ofCapacity: 'der Kapazität',
      noFix: 'keine Fixkosten – ab dem 1. Ticket',
      never: 'nie',
      neverSub: 'Rohertrag pro Ticket ≤ 0',
      vatPerTicket: 'USt pro Ticket',
      planMissing: 'Geplante Tickets eingeben',
      profit: 'Gewinn',
      loss: 'Verlust',
      perTicketFull: 'pro Ticket nach Fixkosten',
      schemeHead: 'Kalkulationsschema pro Ticket',
      sPrice: 'Ticketpreis brutto',
      sRvl: 'davon Reisevorleistungen (brutto)',
      sMargin: 'Marge brutto (Bemessungsgrundlage inkl. USt)',
      sVatStd: '− Umsatzsteuer {r} % (aus Bruttopreis)',
      sVatMargin: '− Umsatzsteuer {r} % (aus Marge)',
      sNet: '= Nettoerlös',
      sVar: '− Variable Kosten',
      sVarNone: '− Variable Kosten (keine erfasst)',
      sDb: '= Rohertrag pro Ticket',
      sFixSep: 'Fixkosten & Break-even',
      sFix: 'Fixkosten gesamt',
      sFixRelief: '− USt-Entlastung aus fixen Reisevorleistungen',
      sFixEff: '= Zu deckende Fixkosten',
      sBe: 'Break-even (Fixkosten ÷ Rohertrag pro Ticket)',
      sBeRev: 'Break-even-Umsatz (brutto)',
      sPlanSep: 'Bei {n} geplanten Tickets',
      sFixPer: 'Fixkostenanteil pro Ticket',
      sFull: 'Ergebnis pro Ticket (Vollkosten)',
      sTotal: 'Ergebnis gesamt',
      sMinPrice: 'Mindestpreis brutto für Kostendeckung',
      sUnreachable: 'nicht erreichbar',
      chartHead: 'Ergebnis nach verkauften Tickets',
      lgRev: 'Rohertrag gesamt',
      lgFix: 'Fixkosten',
      lgBe: 'Break-even',
      chartPlan: 'Plan',
      chartCap: 'Kapazität',
      chartEmpty: 'Gib einen Ticketpreis ein, um das Diagramm zu sehen.',
      cmpHead: 'Vergleich der Steuersätze',
      cmpHint: 'Gleicher Bruttopreis, gleiche Kosten – nur der Umsatzsteuersatz ändert sich.',
      cRate: 'USt-Satz',
      cVat: 'USt/Ticket',
      cNet: 'Netto/Ticket',
      cDb: 'Rohertrag/Ticket',
      cBe: 'Break-even',
      cPlan: 'Ergebnis Plan',
      methodHead: 'Methodik: So wird gerechnet',
      namePh: 'Bezeichnung',
      unitEur: '€',
      unitPct: '%',
      rvl: 'RVL',
      rvlTitle: 'Reisevorleistung (Leistung eines Dritten, die dem Reisenden unmittelbar zugutekommt) – mindert die Marge nach § 25 Abs. 3 UStG',
      del: 'Entfernen',
      emptyVar: 'Noch keine variablen Kosten erfasst.',
      emptyFix: 'Noch keine fixen Kosten erfasst.',
      warnBeCap: 'Der Break-even ({be} Tickets) liegt über der Kapazität ({cap} Tickets) – mit diesen Annahmen wird die Gewinnschwelle nicht erreicht.',
      warnDb: 'Der Rohertrag pro Ticket ist nicht positiv – jedes verkaufte Ticket vergrößert den Verlust. Preis erhöhen oder variable Kosten senken.',
      warnMargin7: 'Hinweis: Die Marge einer Reiseleistung nach § 25 UStG unterliegt grundsätzlich dem Regelsatz von 19 % (0 % nur für Reisevorleistungen außerhalb der EU, § 25 Abs. 2 UStG).',
      footerNote: 'Alle Eingaben bleiben lokal in deinem Browser. Keine steuerliche Beratung – Steuersätze und Anwendbarkeit von § 25 UStG im Einzelfall prüfen.',
      presetsVar: [
        { name: 'Eintritt / Leistungsträger', unit: 'eur', amount: 0, rvl: true },
        { name: 'Verpflegung', unit: 'eur', amount: 0, rvl: true },
        { name: 'Vertriebsprovision', unit: 'pct', amount: 10, rvl: false },
        { name: 'Zahlungsgebühr', unit: 'pct', amount: 1.5, rvl: false },
        { name: 'Ticketsystem-Gebühr', unit: 'eur', amount: 0.5, rvl: false },
        { name: 'Material / Give-away', unit: 'eur', amount: 0, rvl: false }
      ],
      presetsFix: [
        { name: 'Bus / Transfer', amount: 0, rvl: true },
        { name: 'Reiseleitung / Guide', amount: 0, rvl: false },
        { name: 'Personal', amount: 0, rvl: false },
        { name: 'Marketing', amount: 0, rvl: false },
        { name: 'Location / Miete', amount: 0, rvl: false },
        { name: 'Versicherung', amount: 0, rvl: false }
      ],
      example: {
        vars: [
          { name: 'Eintritt Freizeitpark', unit: 'eur', amount: 32, rvl: true },
          { name: 'Vertriebsprovision', unit: 'pct', amount: 8, rvl: false },
          { name: 'Zahlungsgebühr', unit: 'pct', amount: 1.5, rvl: false }
        ],
        fixes: [
          { name: 'Busanmietung', amount: 900, rvl: true },
          { name: 'Reiseleitung', amount: 180, rvl: false },
          { name: 'Marketing', amount: 250, rvl: false }
        ]
      },
      method: `
        <h4>1. Umsatzsteuer herausrechnen</h4>
        <p>Ticketpreise werden brutto angegeben. Die enthaltene Umsatzsteuer ist <code>Brutto × Satz ÷ (100 + Satz)</code> – bei 19 % also 15,97 % des Bruttopreises, bei 7 % 6,54 %. Was übrig bleibt, ist der <strong>Nettoerlös</strong>.</p>
        <h4>2. Reiseleistungen: Margenbesteuerung (§ 25 UStG)</h4>
        <p>Bündelt ein Unternehmen eingekaufte Leistungen Dritter (Bus, Hotel, Eintritte, Verpflegung) im eigenen Namen zu einer Reise, gilt die Sonderregelung für Reiseleistungen:</p>
        <ul>
          <li><strong>Bemessungsgrundlage</strong> ist nur die Marge: Reisepreis minus Aufwendungen für <strong>Reisevorleistungen</strong> (§ 25 Abs. 3). Die Umsatzsteuer ist darin enthalten: <code>USt = Marge × Satz ÷ (100 + Satz)</code>.</li>
          <li>Reisevorleistungen sind Leistungen Dritter, die dem Reisenden <em>unmittelbar</em> zugutekommen. Eigenleistungen (eigener Bus, eigene Reiseleitung) sind keine Reisevorleistungen und werden regulär besteuert.</li>
          <li>Aus Reisevorleistungen ist <strong>kein Vorsteuerabzug</strong> möglich (§ 25 Abs. 4) – deshalb brutto erfassen. Andere Kosten netto erfassen.</li>
          <li>Die Marge unterliegt dem <strong>Regelsatz 19 %</strong>; steuerfrei ist sie, soweit Reisevorleistungen im Drittland erbracht werden (§ 25 Abs. 2). Ein negativer Margenanteil führt nicht zu einer Erstattung.</li>
          <li>Fixe Reisevorleistungen (z. B. eine Busanmietung) mindern die Marge der gesamten Reise. Die dadurch eingesparte Umsatzsteuer wird im Rechner als <em>USt-Entlastung</em> von den Fixkosten abgezogen.</li>
        </ul>
        <h4>3. Rohertrag (Deckungsbeitrag) pro Ticket</h4>
        <p><code>Rohertrag = Nettoerlös − variable Kosten pro Ticket</code>. Prozentuale Kosten (Provision, Zahlungsgebühr) beziehen sich auf den Bruttopreis, weil sie in der Praxis auf den Verkaufspreis berechnet werden.</p>
        <h4>4. Break-even</h4>
        <p><code>Break-even-Menge = zu deckende Fixkosten ÷ Rohertrag pro Ticket</code>, aufgerundet auf ganze Tickets. Ab diesem Ticket ist das Angebot kostendeckend; jedes weitere Ticket bringt den vollen Rohertrag als Gewinn.</p>
        <h4>5. Planmenge & Mindestpreis</h4>
        <p>Bei einer geplanten Ticketzahl werden die Fixkosten auf die Tickets verteilt (Vollkosten) und der Bruttopreis ermittelt, ab dem genau diese Menge die Kosten deckt.</p>
        <p class="hint">Vereinfachtes Modell ohne Ertragsteuern, Finanzierung und Risikozuschläge. Keine Steuerberatung.</p>`
    },
    en: {
      toolTitle: 'Ticket Calculator',
      allTools: 'All tools ↗',
      eyebrow: 'Make the numbers make sense',
      title: 'Ticket Calculator',
      lead: 'From ticket price to gross profit: take out VAT, deduct variable costs and see how many tickets you need to sell before an offer pays off.',
      inputs: 'Inputs',
      results: 'Result',
      priceHead: 'Ticket price & VAT',
      priceLabel: 'Ticket price (gross, incl. VAT)',
      vatLabel: 'VAT rate',
      vatHint: '19 % standard rate · 7 % e.g. museums, zoos, theatres, concerts, local public transport · 0 % exempt services (e.g. Sec. 4 No. 20 German VAT Act).',
      modeLabel: 'Tax treatment',
      modeStandard: 'Standard taxation',
      modeMargin: 'Travel service (Sec. 25 UStG)',
      modeHintStandard: 'VAT is taken out of the full gross price. Enter costs net of VAT (input VAT is deductible).',
      modeHintMargin: 'Margin scheme: VAT only on the difference between the travel price and purchased travel services. Mark bought-in travel services (coach, hotel, third-party admissions …) and enter them gross – no input VAT deduction applies.',
      varHead: 'Variable costs per ticket',
      varHint: 'Costs incurred with every ticket sold – as an amount in € or as % of the gross price (e.g. commissions, payment fees).',
      fixHead: 'Fixed costs',
      fixHint: 'Costs incurred regardless of ticket volume – per event, trip or season (e.g. coach, guide, marketing).',
      addVar: '+ Add variable cost',
      addFix: '+ Add fixed cost',
      planHead: 'Planning (optional)',
      plannedLabel: 'Planned tickets',
      capacityLabel: 'Capacity (max. tickets)',
      import: 'Import',
      export: 'Export',
      importTitle: 'Load inputs from a file (.json)',
      exportTitle: 'Save inputs as a file (.json)',
      pdfTitle: 'Save calculation as PDF (1 page A4)',
      exported: 'Inputs exported.',
      imported: '“{f}” imported.',
      pdfDone: 'PDF created.',
      pdfError: 'The PDF could not be created. Please check your internet connection.',
      pdfCreated: 'created',
      pdfInputs: 'Inputs',
      pdfBase: 'Price, VAT & planning',
      pdfFooter: 'Simplified calculation without warranty. Not tax advice – check VAT rates and Sec. 25 UStG for your case.',
      save: 'Save',
      load: 'Open',
      print: 'Print / PDF',
      reset: 'Reset',
      resetConfirm: 'Reset all inputs and start with empty fields?',
      loadError: 'The file could not be read. Please choose a .json file exported from the Ticket Calculator.',
      kpiDb: 'Gross profit per ticket',
      beHead: 'When does it pay off?',
      beEmpty: 'Enter a ticket price to see the break-even point.',
      beAnswer: 'You need to sell at least {n} for the offer to pay off.',
      beDetail: 'At {a} you still make a loss of {l}; from {b} you are {g} in profit. Every further ticket adds {d}.',
      beCapacity: 'That is {p} of your capacity of {c}.',
      beNever: 'With these assumptions the offer never pays off: each ticket costs more than it brings in net.',
      beFromFirst: 'There are no fixed costs, so the offer pays off from the first ticket.',
      targetLabel: 'Target profit (€)',
      targetAnswer: 'For a profit of {z} you need {n}.',
      targetNever: 'A profit of {z} cannot be reached with these assumptions.',
      targetOverCap: 'That is above capacity.',
      tagTarget: 'Target',
      cTickets: 'Tickets',
      cRevenue: 'Revenue gross',
      cResult: 'Result',
      kpiBe: 'Break-even at',
      kpiNet: 'Net revenue per ticket',
      kpiPlan: 'Result at planned volume',
      ofNet: 'of net revenue',
      tickets: 'tickets',
      ticket: 'ticket',
      beRevenue: 'Revenue (gross)',
      ofCapacity: 'of capacity',
      noFix: 'no fixed costs – from the first ticket',
      never: 'never',
      neverSub: 'gross profit per ticket ≤ 0',
      vatPerTicket: 'VAT per ticket',
      planMissing: 'Enter planned tickets',
      profit: 'Profit',
      loss: 'Loss',
      perTicketFull: 'per ticket after fixed costs',
      schemeHead: 'Calculation per ticket',
      sPrice: 'Ticket price gross',
      sRvl: 'of which travel services bought in (gross)',
      sMargin: 'Gross margin (tax base incl. VAT)',
      sVatStd: '− VAT {r} % (from gross price)',
      sVatMargin: '− VAT {r} % (from margin)',
      sNet: '= Net revenue',
      sVar: '− Variable costs',
      sVarNone: '− Variable costs (none entered)',
      sDb: '= Gross profit per ticket',
      sFixSep: 'Fixed costs & break-even',
      sFix: 'Total fixed costs',
      sFixRelief: '− VAT relief from fixed travel services',
      sFixEff: '= Fixed costs to cover',
      sBe: 'Break-even (fixed costs ÷ gross profit per ticket)',
      sBeRev: 'Break-even revenue (gross)',
      sPlanSep: 'At {n} planned tickets',
      sFixPer: 'Fixed cost share per ticket',
      sFull: 'Result per ticket (full cost)',
      sTotal: 'Total result',
      sMinPrice: 'Minimum gross price to break even',
      sUnreachable: 'not reachable',
      chartHead: 'Result by tickets sold',
      lgRev: 'Total gross profit',
      lgFix: 'Fixed costs',
      lgBe: 'Break-even',
      chartPlan: 'Plan',
      chartCap: 'Capacity',
      chartEmpty: 'Enter a ticket price to see the chart.',
      cmpHead: 'VAT rate comparison',
      cmpHint: 'Same gross price, same costs – only the VAT rate changes.',
      cRate: 'VAT rate',
      cVat: 'VAT/ticket',
      cNet: 'Net/ticket',
      cDb: 'Gross profit/ticket',
      cBe: 'Break-even',
      cPlan: 'Plan result',
      methodHead: 'Method: how it is calculated',
      namePh: 'Description',
      unitEur: '€',
      unitPct: '%',
      rvl: 'TS',
      rvlTitle: 'Travel service bought in (third-party service directly benefiting the traveller) – reduces the margin under Sec. 25 (3) UStG',
      del: 'Remove',
      emptyVar: 'No variable costs entered yet.',
      emptyFix: 'No fixed costs entered yet.',
      warnBeCap: 'Break-even ({be} tickets) is above capacity ({cap} tickets) – with these assumptions the offer does not break even.',
      warnDb: 'Gross profit per ticket is not positive – every ticket sold increases the loss. Raise the price or reduce variable costs.',
      warnMargin7: 'Note: under Sec. 25 UStG the margin of a travel service is generally taxed at the standard rate of 19 % (0 % only for travel services performed outside the EU, Sec. 25 (2)).',
      footerNote: 'All inputs stay locally in your browser. Not tax advice – check VAT rates and the applicability of Sec. 25 UStG for your case.',
      presetsVar: [
        { name: 'Admission / supplier', unit: 'eur', amount: 0, rvl: true },
        { name: 'Catering', unit: 'eur', amount: 0, rvl: true },
        { name: 'Sales commission', unit: 'pct', amount: 10, rvl: false },
        { name: 'Payment fee', unit: 'pct', amount: 1.5, rvl: false },
        { name: 'Ticketing fee', unit: 'eur', amount: 0.5, rvl: false },
        { name: 'Material / give-away', unit: 'eur', amount: 0, rvl: false }
      ],
      presetsFix: [
        { name: 'Coach / transfer', amount: 0, rvl: true },
        { name: 'Tour guide', amount: 0, rvl: false },
        { name: 'Staff', amount: 0, rvl: false },
        { name: 'Marketing', amount: 0, rvl: false },
        { name: 'Venue / rent', amount: 0, rvl: false },
        { name: 'Insurance', amount: 0, rvl: false }
      ],
      example: {
        vars: [
          { name: 'Theme park admission', unit: 'eur', amount: 32, rvl: true },
          { name: 'Sales commission', unit: 'pct', amount: 8, rvl: false },
          { name: 'Payment fee', unit: 'pct', amount: 1.5, rvl: false }
        ],
        fixes: [
          { name: 'Coach hire', amount: 900, rvl: true },
          { name: 'Tour guide', amount: 180, rvl: false },
          { name: 'Marketing', amount: 250, rvl: false }
        ]
      },
      method: `
        <h4>1. Taking out VAT</h4>
        <p>Ticket prices are entered gross. The VAT included is <code>gross × rate ÷ (100 + rate)</code> – 15.97 % of the gross price at 19 %, 6.54 % at 7 %. What remains is <strong>net revenue</strong>.</p>
        <h4>2. Travel services: margin scheme (Sec. 25 German VAT Act)</h4>
        <p>When a business bundles bought-in third-party services (coach, hotel, admissions, catering) into a trip in its own name, the special rules for travel services apply:</p>
        <ul>
          <li>The <strong>tax base</strong> is only the margin: travel price minus the cost of <strong>travel services bought in</strong> (Sec. 25 (3)). VAT is included in it: <code>VAT = margin × rate ÷ (100 + rate)</code>.</li>
          <li>Bought-in travel services are third-party services that benefit the traveller <em>directly</em>. In-house services (own coach, own guide) are not and are taxed normally.</li>
          <li>Input VAT on bought-in travel services is <strong>not deductible</strong> (Sec. 25 (4)) – so enter them gross. Enter all other costs net.</li>
          <li>The margin is taxed at the <strong>standard rate of 19 %</strong>; it is exempt to the extent the travel services are performed outside the EU (Sec. 25 (2)). A negative margin does not lead to a refund.</li>
          <li>Fixed bought-in travel services (e.g. coach hire) reduce the margin of the whole trip. The VAT saved this way is deducted from fixed costs as <em>VAT relief</em>.</li>
        </ul>
        <h4>3. Gross profit (contribution margin) per ticket</h4>
        <p><code>Gross profit = net revenue − variable costs per ticket</code>. Percentage costs (commission, payment fee) are based on the gross price, as they are charged on the selling price in practice.</p>
        <h4>4. Break-even</h4>
        <p><code>Break-even volume = fixed costs to cover ÷ gross profit per ticket</code>, rounded up to whole tickets. From that ticket on the offer covers its costs; every additional ticket adds its full gross profit as profit.</p>
        <h4>5. Planned volume & minimum price</h4>
        <p>For a planned ticket volume, fixed costs are spread over the tickets (full cost) and the gross price at which exactly this volume covers all costs is shown.</p>
        <p class="hint">Simplified model without income taxes, financing or risk surcharges. Not tax advice.</p>`
    }
  };

  // ─── State ────────────────────────────────────────────
  let lang = loadLang();
  let state = loadState() || exampleState(lang);
  let uid = 1;
  state.vars.forEach(r => { r.id = uid++; });
  state.fixes.forEach(r => { r.id = uid++; });

  function t(key) { return I18N[lang][key] ?? I18N.de[key] ?? key; }

  function exampleState(l) {
    const ex = I18N[l].example;
    return {
      price: 85, vat: 19, mode: 'standard',
      vars: ex.vars.map(r => ({ ...r })),
      fixes: ex.fixes.map(r => ({ ...r })),
      planned: 45, capacity: 50, target: null
    };
  }
  function emptyState() {
    return { price: null, vat: 19, mode: 'standard', vars: [], fixes: [], planned: null, capacity: null, target: null };
  }

  function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* ignore */ } }

  function loadLang() {
    const saved = safeGet(LANG_KEY);
    if (saved === 'de' || saved === 'en') return saved;
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'de' || q === 'en') return q;
    return (navigator.language || 'de').toLowerCase().startsWith('de') ? 'de' : 'en';
  }
  function loadState() {
    const raw = safeGet(STORAGE_KEY);
    if (!raw) return null;
    try { return normalize(JSON.parse(raw)); } catch (e) { return null; }
  }
  function normalize(s) {
    if (!s || typeof s !== 'object') throw new Error('invalid');
    const num = v => (v === null || v === '' || v === undefined || !isFinite(+v)) ? null : +v;
    return {
      price: num(s.price),
      vat: VAT_RATES.includes(+s.vat) ? +s.vat : 19,
      mode: s.mode === 'margin' ? 'margin' : 'standard',
      vars: Array.isArray(s.vars) ? s.vars.map(r => ({
        name: String(r.name ?? ''), amount: num(r.amount), unit: r.unit === 'pct' ? 'pct' : 'eur', rvl: !!r.rvl
      })) : [],
      fixes: Array.isArray(s.fixes) ? s.fixes.map(r => ({
        name: String(r.name ?? ''), amount: num(r.amount), rvl: !!r.rvl
      })) : [],
      planned: num(s.planned),
      target: num(s.target),
      capacity: num(s.capacity)
    };
  }
  function serialize() {
    return {
      tool: 'leisureworkspace-ticketrechner', version: 1,
      price: state.price, vat: state.vat, mode: state.mode,
      vars: state.vars.map(({ name, amount, unit, rvl }) => ({ name, amount, unit, rvl })),
      fixes: state.fixes.map(({ name, amount, rvl }) => ({ name, amount, rvl })),
      planned: state.planned, capacity: state.capacity, target: state.target
    };
  }
  function persist() { safeSet(STORAGE_KEY, JSON.stringify(serialize())); }

  // ─── Calculation ──────────────────────────────────────
  function calculate(s, vatRate) {
    const P = Math.max(0, s.price || 0);
    const rate = vatRate ?? s.vat;
    const k = rate / (100 + rate);             // VAT share of a gross amount
    const margin = s.mode === 'margin';

    const varRows = s.vars.map(r => {
      const a = Math.max(0, r.amount || 0);
      const cost = r.unit === 'pct' ? P * a / 100 : a;
      return { name: r.name, unit: r.unit, amount: a, cost, rvl: margin && r.rvl };
    });
    const V = sum(varRows.map(r => r.cost));
    const rvlVar = sum(varRows.filter(r => r.rvl).map(r => r.cost));

    const F = sum(s.fixes.map(r => Math.max(0, r.amount || 0)));
    const rvlFix = margin ? sum(s.fixes.filter(r => r.rvl).map(r => Math.max(0, r.amount || 0))) : 0;

    // Per-ticket view: marginal VAT of one additional ticket.
    const marginGross = P - rvlVar;
    const vat = margin ? Math.max(0, marginGross) * k : P * k;
    const net = P - vat;
    const db = net - V;
    // Fixed travel services reduce the margin of the whole trip -> VAT saved.
    const relief = margin && marginGross > 0 ? rvlFix * k : 0;
    const Feff = F - relief;

    // Exact total result for N tickets (margin can't be negative overall).
    function result(N) {
      let totalVat;
      if (margin) totalVat = Math.max(0, N * marginGross - rvlFix) * k;
      else totalVat = N * P * k;
      return N * P - totalVat - N * V - F;
    }
    function contribution(N) { return result(N) + F; }

    // Smallest whole ticket count whose total result reaches `target` (null = unreachable).
    function ticketsFor(target) {
      if (result(0) >= target - 1e-9) return 0;
      if (db <= 0) return null;
      let hi = Math.max(1, Math.ceil((Feff + target) / db));
      let guard = 0;
      while (result(hi) < target - 1e-9 && guard++ < 60) hi *= 2;
      if (result(hi) < target - 1e-9) return null;
      let lo = 0;
      while (hi - lo > 1) {
        const mid = Math.floor((lo + hi) / 2);
        if (result(mid) >= target - 1e-9) hi = mid; else lo = mid;
      }
      return hi;
    }
    const be = F <= 0 ? 0 : ticketsFor(0);
    const target = s.target && s.target > 0 ? s.target : null;
    const targetTickets = target ? ticketsFor(target) : null;

    const N = s.planned && s.planned > 0 ? Math.floor(s.planned) : null;
    let plan = null;
    if (N) {
      const total = result(N);
      plan = {
        N, total,
        fixPer: F / N,
        fullPer: total / N,
        minPrice: minPrice(s, rate, N)
      };
    }

    return { P, rate, k, margin, varRows, V, rvlVar, F, rvlFix, marginGross, vat, net, db, relief, Feff, be, target, targetTickets, plan, result, contribution };
  }

  // Gross price at which N tickets exactly cover all costs (bisection).
  function minPrice(s, rate, N) {
    const f = p => calculate({ ...s, price: p, planned: null }, rate).result(N);
    let lo = 0, hi = Math.max(1, (s.price || 0) * 2);
    let guard = 0;
    while (f(hi) < 0 && guard++ < 40) hi *= 2;
    if (f(hi) < 0) return null;
    if (f(lo) >= 0) return 0;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (f(mid) >= 0) hi = mid; else lo = mid;
    }
    return Math.ceil(hi * 100) / 100;
  }

  function sum(a) { return a.reduce((x, y) => x + y, 0); }

  // ─── Formatting ───────────────────────────────────────
  const locale = () => (lang === 'de' ? 'de-DE' : 'en-GB');
  function eur(v) {
    if (v === null || !isFinite(v)) return '–';
    if (Math.abs(v) < 0.005) v = 0;
    return new Intl.NumberFormat(locale(), { style: 'currency', currency: 'EUR' }).format(v);
  }
  function eur0(v) {
    return new Intl.NumberFormat(locale(), { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
  }
  function int(v) { return new Intl.NumberFormat(locale()).format(v); }
  function pct(v, d = 1) {
    if (v === null || !isFinite(v)) return '–';
    return new Intl.NumberFormat(locale(), { style: 'percent', maximumFractionDigits: d, minimumFractionDigits: d }).format(v);
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function fill(str, map) { return str.replace(/\{(\w+)\}/g, (_, k) => map[k]); }
  function cls(v) { return v < -0.004 ? 'neg' : ''; }

  // ─── DOM refs ─────────────────────────────────────────
  const $ = id => document.getElementById(id);
  const el = {
    price: $('price'), planned: $('planned'), capacity: $('capacity'), target: $('target'),
    beBox: $('beBox'),
    vatGroup: $('vatGroup'), modeGroup: $('modeGroup'), modeHint: $('modeHint'),
    varList: $('varList'), fixList: $('fixList'), varChips: $('varChips'), fixChips: $('fixChips'),
    kpiDb: $('kpiDb'), kpiDbSub: $('kpiDbSub'), kpiBe: $('kpiBe'), kpiBeSub: $('kpiBeSub'),
    kpiNet: $('kpiNet'), kpiNetSub: $('kpiNetSub'), kpiPlan: $('kpiPlan'), kpiPlanSub: $('kpiPlanSub'),
    alert: $('alert'), scheme: $('scheme'), cmp: $('cmp'), chart: $('chart'), methodBody: $('methodBody')
  };

  // ─── Rendering: static texts ──────────────────────────
  function applyLang() {
    document.documentElement.lang = lang;
    document.title = t('toolTitle') + ' · Leisure Workspace';
    document.querySelectorAll('[data-i18n]').forEach(n => { n.textContent = t(n.dataset.i18n); });
    document.querySelectorAll('[data-i18n-title]').forEach(n => { n.title = t(n.dataset.i18nTitle); n.setAttribute('aria-label', n.title); });
    document.querySelectorAll('.nav-lang-opt').forEach(n => n.classList.toggle('active', n.dataset.lang === lang));
    el.methodBody.innerHTML = t('method');
    renderChips();
    renderRows();
    render();
  }

  function renderChips() {
    el.varChips.innerHTML = t('presetsVar').map((p, i) =>
      `<button type="button" class="chip" data-i="${i}">+ ${esc(p.name)}</button>`).join('');
    el.fixChips.innerHTML = t('presetsFix').map((p, i) =>
      `<button type="button" class="chip" data-i="${i}">+ ${esc(p.name)}</button>`).join('');
  }

  function renderControls() {
    el.vatGroup.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(+b.dataset.vat === state.vat)));
    el.modeGroup.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.mode === state.mode)));
    el.modeHint.textContent = state.mode === 'margin' ? t('modeHintMargin') : t('modeHintStandard');
  }

  function renderRows() {
    const margin = state.mode === 'margin';
    el.varList.innerHTML = state.vars.length ? state.vars.map(r => `
      <div class="cost-row is-var${margin ? ' margin' : ''}" data-id="${r.id}">
        <input type="text" class="c-name" data-f="name" value="${esc(r.name)}" placeholder="${esc(t('namePh'))}" aria-label="${esc(t('namePh'))}" />
        <input type="number" class="c-amount" data-f="amount" min="0" step="0.01" inputmode="decimal" value="${r.amount ?? ''}" aria-label="${esc(r.name || t('namePh'))}" />
        <select class="c-unit" data-f="unit" aria-label="Unit">
          <option value="eur"${r.unit === 'eur' ? ' selected' : ''}>${t('unitEur')}</option>
          <option value="pct"${r.unit === 'pct' ? ' selected' : ''}>${t('unitPct')}</option>
        </select>
        ${margin ? `<label class="rvl" title="${esc(t('rvlTitle'))}"><input type="checkbox" data-f="rvl"${r.rvl ? ' checked' : ''} />${t('rvl')}</label>` : ''}
        <button type="button" class="btn-del" data-del aria-label="${esc(t('del'))}" title="${esc(t('del'))}">×</button>
      </div>`).join('') : `<p class="empty">${esc(t('emptyVar'))}</p>`;

    el.fixList.innerHTML = state.fixes.length ? state.fixes.map(r => `
      <div class="cost-row is-fix${margin ? ' margin' : ''}" data-id="${r.id}">
        <input type="text" class="c-name" data-f="name" value="${esc(r.name)}" placeholder="${esc(t('namePh'))}" aria-label="${esc(t('namePh'))}" />
        <div class="input-unit input-unit-sm"><input type="number" class="c-amount" data-f="amount" min="0" step="0.01" inputmode="decimal" value="${r.amount ?? ''}" aria-label="${esc(r.name || t('namePh'))}" /><span>€</span></div>
        ${margin ? `<label class="rvl" title="${esc(t('rvlTitle'))}"><input type="checkbox" data-f="rvl"${r.rvl ? ' checked' : ''} />${t('rvl')}</label>` : ''}
        <button type="button" class="btn-del" data-del aria-label="${esc(t('del'))}" title="${esc(t('del'))}">×</button>
      </div>`).join('') : `<p class="empty">${esc(t('emptyFix'))}</p>`;
  }

  // ─── Rendering: results ───────────────────────────────
  function render() {
    renderControls();
    const c = calculate(state);
    const hasPrice = state.price !== null && state.price > 0;

    // KPIs
    if (!hasPrice) {
      ['kpiDb', 'kpiBe', 'kpiNet', 'kpiPlan'].forEach(k => { el[k].textContent = '–'; el[k].classList.remove('neg'); });
      ['kpiDbSub', 'kpiBeSub', 'kpiNetSub', 'kpiPlanSub'].forEach(k => { el[k].textContent = ''; });
    } else {
      setVal(el.kpiDb, eur(c.db), c.db);
      el.kpiDbSub.textContent = c.net > 0 ? `${pct(c.db / c.net)} ${t('ofNet')}` : '';

      if (c.be === null) {
        el.kpiBe.textContent = t('never');
        el.kpiBeSub.textContent = t('neverSub');
      } else if (c.F <= 0) {
        el.kpiBe.textContent = `1 ${t('ticket')}`;
        el.kpiBeSub.textContent = t('noFix');
      } else {
        el.kpiBe.textContent = `${int(c.be)} ${c.be === 1 ? t('ticket') : t('tickets')}`;
        let sub = `${t('beRevenue')}: ${eur0(c.be * c.P)}`;
        if (state.capacity > 0) sub += ` · ${pct(c.be / state.capacity, 0)} ${t('ofCapacity')}`;
        el.kpiBeSub.textContent = sub;
      }

      el.kpiNet.textContent = eur(c.net);
      el.kpiNetSub.textContent = `${t('vatPerTicket')}: ${eur(c.vat)}`;

      if (c.plan) {
        setVal(el.kpiPlan, eur(c.plan.total), c.plan.total);
        el.kpiPlanSub.textContent = `${int(c.plan.N)} ${t('tickets')} · ${eur(c.plan.fullPer)} ${t('perTicketFull')}`;
      } else {
        el.kpiPlan.textContent = '–';
        el.kpiPlan.classList.remove('neg');
        el.kpiPlanSub.textContent = t('planMissing');
      }
    }

    // Alerts
    const msgs = [];
    if (hasPrice && c.db <= 0) msgs.push(t('warnDb'));
    if (hasPrice && c.be !== null && c.F > 0 && state.capacity > 0 && c.be > state.capacity) {
      msgs.push(fill(t('warnBeCap'), { be: int(c.be), cap: int(state.capacity) }));
    }
    if (state.mode === 'margin' && state.vat === 7) msgs.push(t('warnMargin7'));
    el.alert.hidden = msgs.length === 0;
    el.alert.innerHTML = msgs.map(esc).join('<br />');

    renderBreakEven(c, hasPrice);
    renderScheme(c, hasPrice);
    renderCompare(hasPrice);
    renderChart(c, hasPrice);
  }

  function setVal(node, text, v) {
    node.textContent = text;
    node.classList.toggle('neg', v < -0.004);
  }

  function renderBreakEven(c, hasPrice) {
    if (!hasPrice) { el.beBox.innerHTML = `<p class="empty">${esc(t('beEmpty'))}</p>`; return; }
    const tk = n => `${int(n)} ${n === 1 ? t('ticket') : t('tickets')}`;
    let html = '';
    if (c.be === null) {
      html += `<p class="be-answer neg">${esc(t('beNever'))}</p>`;
    } else if (c.F <= 0) {
      html += `<p class="be-answer">${esc(t('beFromFirst'))}</p>`;
    } else {
      const before = c.result(c.be - 1), at = c.result(c.be);
      html += `<p class="be-answer">${fill(esc(t('beAnswer')), { n: `<strong>${tk(c.be)}</strong>` })}</p>`;
      html += `<p class="be-detail">${fill(esc(t('beDetail')), {
        a: tk(c.be - 1), l: `<span class="neg">${eur(Math.abs(before))}</span>`,
        b: tk(c.be), g: `<span class="pos">${eur(at)}</span>`, d: eur(c.db)
      })}</p>`;
      if (state.capacity > 0) {
        const share = c.be / state.capacity;
        html += `<div class="be-meter" role="img" aria-label="${esc(pct(share, 0))} ${esc(t('ofCapacity'))}"><span style="width:${Math.min(100, share * 100).toFixed(1)}%" class="${share > 1 ? 'over' : ''}"></span></div>`;
        html += `<p class="be-detail">${fill(esc(t('beCapacity')), { p: `<strong>${pct(share, 0)}</strong>`, c: tk(state.capacity) })}</p>`;
      }
    }
    if (c.target) {
      html += `<p class="be-detail be-target">${c.targetTickets === null
        ? fill(esc(t('targetNever')), { z: eur(c.target) })
        : fill(esc(t('targetAnswer')), { z: eur(c.target), n: `<strong>${tk(c.targetTickets)}</strong>` })
          + (state.capacity > 0 && c.targetTickets > state.capacity ? ` <span class="neg">${esc(t('targetOverCap'))}</span>` : '')}</p>`;
    }

    // Ticket ladder around the break-even point
    const pts = new Set([0]);
    const top = Math.max(state.capacity || 0, c.plan ? c.plan.N : 0, c.be ? Math.ceil(c.be * 1.5) : 0, c.targetTickets || 0, 10);
    for (let i = 1; i <= 4; i++) pts.add(Math.round(top * i / 4));
    if (c.be) { pts.add(Math.max(0, c.be - 1)); pts.add(c.be); }
    if (c.plan) pts.add(c.plan.N);
    if (state.capacity > 0) pts.add(Math.floor(state.capacity));
    if (c.targetTickets) pts.add(c.targetTickets);
    const rows = [...pts].sort((a, b) => a - b).map(n => {
      const r = c.result(n);
      const tags = [];
      if (c.be && n === c.be && c.F > 0) tags.push(`<span class="tag tag-be">${esc(t('lgBe'))}</span>`);
      if (c.plan && n === c.plan.N) tags.push(`<span class="tag">${esc(t('chartPlan'))}</span>`);
      if (state.capacity > 0 && n === Math.floor(state.capacity)) tags.push(`<span class="tag">${esc(t('chartCap'))}</span>`);
      if (c.targetTickets && n === c.targetTickets) tags.push(`<span class="tag">${esc(t('tagTarget'))}</span>`);
      return `<tr class="${c.be && n === c.be && c.F > 0 ? 'is-be' : ''}"><td>${int(n)} ${tags.join(' ')}</td><td>${eur0(n * c.P)}</td><td>${eur0(c.contribution(n))}</td><td>${eur0(c.F)}</td><td class="${r < -0.004 ? 'neg' : 'pos'}">${eur0(r)}</td></tr>`;
    }).join('');
    html += `<div class="table-wrap"><table class="ladder"><thead><tr><th>${esc(t('cTickets'))}</th><th>${esc(t('cRevenue'))}</th><th>${esc(t('lgRev'))}</th><th>${esc(t('lgFix'))}</th><th>${esc(t('cResult'))}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    el.beBox.innerHTML = html;
  }

  // Calculation rows as data; `sec` links each row to its input step (s1–s4).
  function schemeRows(c, hasPrice) {
    const share = v => (c.P > 0 ? pct(v / c.P) : '');
    const rows = [];
    const row = (label, value, extra, kind, sec) => rows.push({ label, value, extra: extra || '', kind: kind || '', sec: sec || '' });

    row(t('sPrice'), c.P, hasPrice ? share(c.P) : '', 'strong', 's1');
    if (c.margin) {
      row(t('sRvl'), c.rvlVar, share(c.rvlVar), 'sub', 's1');
      row(t('sMargin'), c.marginGross, share(c.marginGross), 'sub', 's1');
    }
    row(fill(c.margin ? t('sVatMargin') : t('sVatStd'), { r: c.rate }), -c.vat, share(c.vat), '', 's1');
    row(t('sNet'), c.net, share(c.net), 'strong', 's1');
    if (c.varRows.length) {
      row(t('sVar'), -c.V, share(c.V), '', 's2');
      c.varRows.filter(r => r.name || r.cost).forEach(r => {
        const label = (r.name || '–') + (r.unit === 'pct' ? ` (${new Intl.NumberFormat(locale()).format(r.amount)} %)` : '') + (r.rvl ? ` · ${t('rvl')}` : '');
        row(label, -r.cost, '', 'sub', 's2');
      });
    } else {
      row(t('sVarNone'), 0, '', '', 's2');
    }
    row(t('sDb'), c.db, share(c.db), 'hl');

    row(t('sFixSep'), null, '', 'sep');
    row(t('sFix'), c.F, '', '', 's3');
    if (c.relief > 0) {
      row(t('sFixRelief'), -c.relief, '', 'sub', 's3');
      row(t('sFixEff'), c.Feff, '', 'strong', 's3');
    }
    const beText = !hasPrice ? '–' : c.be === null ? t('never') : `${int(c.be)} ${c.be === 1 ? t('ticket') : t('tickets')}`;
    row(t('sBe'), beText, '', 'total');
    if (hasPrice && c.be !== null && c.F > 0) row(t('sBeRev'), c.be * c.P, '', 'sub');

    if (c.plan && hasPrice) {
      row(fill(t('sPlanSep'), { n: int(c.plan.N) }), null, '', 'sep');
      row(t('sFixPer'), -c.plan.fixPer, '', '', 's4');
      row(t('sFull'), c.plan.fullPer, '', 'strong', 's4');
      row(t('sTotal'), c.plan.total, '', 'hl');
      row(t('sMinPrice'), c.plan.minPrice === null ? t('sUnreachable') : c.plan.minPrice, '', '', 's4');
    }
    return rows;
  }
  const fmtVal = v => (typeof v === 'number' ? eur(v) : v);

  function renderScheme(c, hasPrice) {
    el.scheme.innerHTML = schemeRows(c, hasPrice).map(r => r.kind === 'sep'
      ? `<tr class="sep"><td colspan="3">${esc(r.label)}</td></tr>`
      : `<tr class="${r.kind} ${r.sec}"><td>${esc(r.label)}</td><td class="${typeof r.value === 'number' ? cls(r.value) : ''}">${esc(fmtVal(r.value))}</td><td>${r.extra}</td></tr>`
    ).join('');
  }

  function renderCompare(hasPrice) {
    const head = `<thead><tr><th>${esc(t('cRate'))}</th><th>${esc(t('cVat'))}</th><th>${esc(t('cNet'))}</th><th>${esc(t('cDb'))}</th><th>${esc(t('cBe'))}</th><th>${esc(t('cPlan'))}</th></tr></thead>`;
    const body = VAT_RATES.map(r => {
      const c = calculate(state, r);
      const be = !hasPrice ? '–' : c.be === null ? t('never') : (c.F <= 0 ? '1' : int(c.be));
      const plan = c.plan && hasPrice ? `<span class="${cls(c.plan.total)}">${eur(c.plan.total)}</span>` : '–';
      return `<tr class="${r === state.vat ? 'active' : ''}"><td>${r} %</td><td>${hasPrice ? eur(c.vat) : '–'}</td><td>${hasPrice ? eur(c.net) : '–'}</td><td class="${hasPrice ? cls(c.db) : ''}">${hasPrice ? eur(c.db) : '–'}</td><td>${be}</td><td>${plan}</td></tr>`;
    }).join('');
    el.cmp.innerHTML = head + `<tbody>${body}</tbody>`;
  }

  function renderChart(c, hasPrice) {
    if (!hasPrice) { el.chart.innerHTML = `<p class="empty">${esc(t('chartEmpty'))}</p>`; return; }
    const cap = state.capacity > 0 ? state.capacity : 0;
    const plan = c.plan ? c.plan.N : 0;
    const beX = c.be !== null && c.F > 0 ? c.be : 0;
    let xMax = Math.max(cap, plan, beX * 1.4, 10);
    xMax = niceCeil(xMax);

    const W = 600, H = 260, L = 64, R = 14, T = 14, B = 34;
    const iw = W - L - R, ih = H - T - B;
    const steps = 60;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const n = xMax * i / steps;
      pts.push([n, c.contribution(n)]);
    }
    const yVals = pts.map(p => p[1]).concat([c.F, 0]);
    let yMin = Math.min(...yVals), yMaxV = Math.max(...yVals);
    if (yMaxV === yMin) yMaxV = yMin + 1;
    const pad = (yMaxV - yMin) * 0.06;
    yMin = Math.min(0, yMin - pad); yMaxV += pad;

    const x = n => L + (n / xMax) * iw;
    const y = v => T + ih - ((v - yMin) / (yMaxV - yMin)) * ih;

    const ticksY = niceTicks(yMin, yMaxV, 5);
    const ticksX = niceTicks(0, xMax, 6);
    const grid = ticksY.map(v => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#DDE4DF" stroke-width="1"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${eur0(v)}</text>`).join('');
    const xl = ticksX.map(v => `<text x="${x(v)}" y="${H - B + 16}" text-anchor="middle">${int(v)}</text>`).join('');

    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p[0]).toFixed(1)} ${y(p[1]).toFixed(1)}`).join(' ');
    // Profit zone: area between contribution and fixed cost line, where contribution > F
    const fixY = y(c.F);
    const area = `M${x(0)} ${fixY} ` + pts.map(p => `L${x(p[0]).toFixed(1)} ${Math.min(y(p[1]), fixY).toFixed(1)}`).join(' ') + ` L${x(xMax)} ${fixY} Z`;

    let marks = '';
    const vline = (n, label, color, dash, left) => {
      if (!(n > 0) || n > xMax) return '';
      const flip = left || x(n) > W - R - 70;
      return `<line x1="${x(n)}" x2="${x(n)}" y1="${T}" y2="${T + ih}" stroke="${color}" stroke-width="1.5" ${dash ? 'stroke-dasharray="4 4"' : ''}/><text x="${x(n) + (flip ? -4 : 4)}" y="${T + 11}" text-anchor="${flip ? 'end' : 'start'}" style="fill:${color};font-weight:700">${esc(label)}</text>`;
    };
    marks += vline(cap, t('chartCap'), '#58686C', true);
    if (plan && plan !== cap) marks += vline(plan, t('chartPlan'), '#087E83', true, cap > plan && x(cap) - x(plan) < 70);
    let beDot = '';
    if (beX > 0 && beX <= xMax) {
      beDot = `<circle cx="${x(beX)}" cy="${y(c.contribution(beX))}" r="6.5" fill="#FFCA19" stroke="#172B3A" stroke-width="2"/>`
        + `<text x="${x(beX)}" y="${y(c.contribution(beX)) + 22}" text-anchor="middle" style="fill:#172B3A;font-weight:700">${int(beX)}</text>`;
    }

    el.chart.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t('chartHead'))}">
      ${grid}
      <line x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}" stroke="#172B3A" stroke-width="1"/>
      <path d="${area}" fill="#BDE3D1" opacity=".55"/>
      <line x1="${L}" x2="${W - R}" y1="${fixY}" y2="${fixY}" stroke="#172B3A" stroke-width="2.5"/>
      <path d="${line}" fill="none" stroke="#087E83" stroke-width="3" stroke-linejoin="round"/>
      ${marks}${beDot}${xl}
      <text x="${W - R}" y="${H - 2}" text-anchor="end">${esc(t('tickets'))}</text>
    </svg>`;
  }

  function niceCeil(v) {
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const m = v / p;
    const n = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
    return n * p;
  }
  function niceTicks(min, max, count) {
    const span = max - min;
    if (span <= 0) return [min];
    const raw = span / count;
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const m = raw / p;
    const step = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
    const out = [];
    for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6 || 0);
    return out;
  }

  // ─── Events ───────────────────────────────────────────
  function numVal(input) { return input.value === '' ? null : +input.value; }
  function update() { persist(); render(); }

  el.price.addEventListener('input', () => { state.price = numVal(el.price); update(); });
  el.planned.addEventListener('input', () => { state.planned = numVal(el.planned); update(); });
  el.capacity.addEventListener('input', () => { state.capacity = numVal(el.capacity); update(); });
  el.target.addEventListener('input', () => { state.target = numVal(el.target); update(); });

  el.vatGroup.addEventListener('click', e => {
    const b = e.target.closest('button[data-vat]');
    if (!b) return;
    state.vat = +b.dataset.vat; update();
  });
  el.modeGroup.addEventListener('click', e => {
    const b = e.target.closest('button[data-mode]');
    if (!b) return;
    state.mode = b.dataset.mode; renderRows(); update();
  });
  [el.vatGroup, el.modeGroup].forEach(g => g.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const btns = [...g.querySelectorAll('button')];
    const i = btns.indexOf(document.activeElement);
    if (i < 0) return;
    const next = btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length];
    next.focus(); next.click();
  }));

  function bindList(container, list) {
    container.addEventListener('input', e => {
      const rowEl = e.target.closest('.cost-row');
      if (!rowEl) return;
      const r = state[list].find(x => x.id === +rowEl.dataset.id);
      const f = e.target.dataset.f;
      if (!r || !f) return;
      if (f === 'name') r.name = e.target.value;
      else if (f === 'amount') r.amount = numVal(e.target);
      else if (f === 'unit') r.unit = e.target.value;
      else if (f === 'rvl') r.rvl = e.target.checked;
      update();
    });
    container.addEventListener('click', e => {
      if (!e.target.closest('[data-del]')) return;
      const rowEl = e.target.closest('.cost-row');
      state[list] = state[list].filter(x => x.id !== +rowEl.dataset.id);
      renderRows(); update();
    });
  }
  bindList(el.varList, 'vars');
  bindList(el.fixList, 'fixes');

  function addRow(list, preset) {
    const r = list === 'vars'
      ? { id: uid++, name: '', amount: null, unit: 'eur', rvl: false, ...preset }
      : { id: uid++, name: '', amount: null, rvl: false, ...preset };
    if (r.amount === 0) r.amount = null;
    state[list].push(r);
    renderRows(); update();
    const container = list === 'vars' ? el.varList : el.fixList;
    const rowEl = container.querySelector(`.cost-row[data-id="${r.id}"]`);
    const focus = rowEl && (r.name ? rowEl.querySelector('.c-amount') : rowEl.querySelector('.c-name'));
    if (focus) focus.focus();
  }
  $('addVar').addEventListener('click', () => addRow('vars'));
  $('addFix').addEventListener('click', () => addRow('fixes'));
  el.varChips.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    addRow('vars', { ...t('presetsVar')[+b.dataset.i] });
  });
  el.fixChips.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    addRow('fixes', { ...t('presetsFix')[+b.dataset.i] });
  });

  document.querySelectorAll('.nav-lang-opt').forEach(n => n.addEventListener('click', e => {
    e.stopPropagation();
    lang = n.dataset.lang; safeSet(LANG_KEY, lang); applyLang();
  }));

  // Toast instead of alert(): works in every embedding.
  let toastTimer;
  function toast(msg, isErr) {
    const n = $('toast');
    n.textContent = msg; n.classList.toggle('err', !!isErr); n.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { n.hidden = true; }, 3200);
  }

  function stamp() { return new Date().toISOString().slice(0, 10); }
  // Inside the claude.ai preview, files go through the viewer's download prompt;
  // on the website a plain download link is used. Resolves false if not saved.
  async function saveBlob(blob, filename) {
    if (window.claude && typeof window.claude.use === 'function') {
      const dl = await window.claude.use('downloads').catch(() => null);
      if (dl) {
        try { await dl.save({ filename, data: blob }); return true; } catch (e) { return false; }
      }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    return true;
  }

  // Import / export of the input data (JSON)
  $('exportBtn').addEventListener('click', async () => {
    const ok = await saveBlob(new Blob([JSON.stringify(serialize(), null, 2)], { type: 'application/json' }), `ticketrechner-${stamp()}.json`);
    if (ok) toast(t('exported'));
  });
  $('importBtn').addEventListener('click', () => $('loadFile').click());
  $('loadFile').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state = normalize(JSON.parse(reader.result));
        state.vars.forEach(r => { r.id = uid++; });
        state.fixes.forEach(r => { r.id = uid++; });
        syncInputs(); renderRows(); update();
        toast(fill(t('imported'), { f: file.name }));
      } catch (err) { toast(t('loadError'), true); }
      e.target.value = '';
    };
    reader.readAsText(file);
  });

  // ─── PDF export (one A4 page) ─────────────────────────
  const PDF_LIBS = [
    ['https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js'],
    ['https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js']
  ];
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const sc = document.createElement('script');
      sc.src = src; sc.onload = resolve; sc.onerror = () => { sc.remove(); reject(new Error(src)); };
      document.head.appendChild(sc);
    });
  }
  async function ensurePdfLibs() {
    if (!(window.jspdf && window.jspdf.jsPDF)) {
      let ok = false;
      for (const u of PDF_LIBS[0]) { try { await loadScript(u); ok = true; break; } catch (e) { /* next */ } }
      if (!ok) throw new Error('jspdf');
    }
    if (!window.jspdf.jsPDF.API.autoTable) {
      let ok = false;
      for (const u of PDF_LIBS[1]) { try { await loadScript(u); ok = true; break; } catch (e) { /* next */ } }
      if (!ok) throw new Error('autotable');
    }
    return window.jspdf.jsPDF;
  }

  // Standard PDF fonts only cover WinAnsi – map the few symbols outside it.
  const pdfText = v => String(v ?? '')
    .replace(/−/g, '-').replace(/÷/g, ':').replace(/≤/g, '<=').replace(/ /g, ' ').replace(/[↗→]/g, '');
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const PDFC = {
    navy: hex('#172B3A'), teal: hex('#087E83'), yellow: hex('#FFCA19'), mint: hex('#BDE3D1'),
    ivory: hex('#F5F6F0'), muted: hex('#58686C'), line: hex('#DDE4DF'), neg: hex('#B42318'), white: [255, 255, 255],
    s1: hex('#E8F0F4'), s2: hex('#E4F3EC'), s3: hex('#FFF5D3'), s4: hex('#F1EEE6'),
    b1: hex('#172B3A'), b2: hex('#087E83'), b3: hex('#FFCA19'), b4: hex('#58686C')
  };

  function buildPdf(JsPDF, scale) {
    const doc = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const W = 210, H = 297, M = 13, CW = W - 2 * M;
    const fs = n => n * scale;
    const c = calculate(state);
    const hasPrice = state.price !== null && state.price > 0;
    const dateStr = new Date().toLocaleDateString(locale(), { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Header band
    doc.setFillColor(...PDFC.navy); doc.rect(0, 0, W, 20, 'F');
    doc.setFillColor(...PDFC.yellow); doc.rect(0, 20, W, 1.2, 'F');
    doc.setTextColor(...PDFC.white);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text(pdfText(t('toolTitle')), M, 12.5);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    doc.text(pdfText(`Leisure Workspace · ${t('pdfCreated')} ${dateStr}`), W - M, 12.5, { align: 'right' });
    let y = 28;

    // KPI boxes
    const kpis = [
      { label: t('kpiDb'), value: hasPrice ? eur(c.db) : '–', sub: hasPrice && c.net > 0 ? `${pct(c.db / c.net)} ${t('ofNet')}` : '', fill: PDFC.navy, ink: PDFC.white },
      { label: t('kpiBe'), value: !hasPrice ? '–' : c.be === null ? t('never') : `${int(Math.max(c.be, c.F > 0 ? c.be : 1))} ${t('tickets')}`, sub: hasPrice && c.be && c.F > 0 ? `${t('beRevenue')}: ${eur0(c.be * c.P)}` : '', fill: PDFC.yellow, ink: PDFC.navy },
      { label: t('kpiNet'), value: hasPrice ? eur(c.net) : '–', sub: hasPrice ? `${t('vatPerTicket')}: ${eur(c.vat)}` : '', fill: PDFC.ivory, ink: PDFC.navy },
      { label: t('kpiPlan'), value: c.plan && hasPrice ? eur(c.plan.total) : '–', sub: c.plan ? `${int(c.plan.N)} ${t('tickets')}` : t('planMissing'), fill: PDFC.ivory, ink: PDFC.navy, neg: c.plan && c.plan.total < 0 }
    ];
    const gap = 3, kw = (CW - 3 * gap) / 4, ks = Math.max(scale, 0.85), kh = 19 * ks;
    kpis.forEach((k, i) => {
      const x = M + i * (kw + gap);
      doc.setFillColor(...k.fill); doc.roundedRect(x, y, kw, kh, 2, 2, 'F');
      doc.setTextColor(...k.ink);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5 * ks);
      doc.text(pdfText(k.label.toUpperCase()), x + 3, y + 5 * ks);
      doc.setFontSize(13 * ks);
      if (k.neg) doc.setTextColor(...PDFC.neg);
      doc.text(pdfText(k.value), x + 3, y + 11 * ks);
      doc.setTextColor(...k.ink);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8 * ks);
      doc.text(pdfText(k.sub), x + 3, y + kh - 2.5 * ks, { maxWidth: kw - 5 });
    });
    y += kh + 5;

    // Break-even sentence
    doc.setTextColor(...PDFC.navy); doc.setFont('helvetica', 'bold'); doc.setFontSize(fs(10));
    let beLine;
    if (!hasPrice) beLine = t('beEmpty');
    else if (c.be === null) beLine = t('beNever');
    else if (c.F <= 0) beLine = t('beFromFirst');
    else beLine = fill(t('beAnswer'), { n: `${int(c.be)} ${c.be === 1 ? t('ticket') : t('tickets')}` });
    const beLines = doc.splitTextToSize(pdfText(beLine), CW);
    doc.text(beLines, M, y); y += beLines.length * fs(4.4);
    if (hasPrice && c.be && c.F > 0) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(fs(8.2)); doc.setTextColor(...PDFC.muted);
      const tk = n => `${int(n)} ${n === 1 ? t('ticket') : t('tickets')}`;
      let d = fill(t('beDetail'), { a: tk(c.be - 1), l: eur(Math.abs(c.result(c.be - 1))), b: tk(c.be), g: eur(c.result(c.be)), d: eur(c.db) });
      if (state.capacity > 0) d += ' ' + fill(t('beCapacity'), { p: pct(c.be / state.capacity, 0), c: tk(state.capacity) });
      if (c.target) d += ' ' + (c.targetTickets === null ? fill(t('targetNever'), { z: eur(c.target) }) : fill(t('targetAnswer'), { z: eur(c.target), n: tk(c.targetTickets) }));
      const dl = doc.splitTextToSize(pdfText(d), CW);
      doc.text(dl, M, y + 0.5); y += dl.length * fs(3.6) + 1;
    }
    y += 2;

    // Section heading helper
    const heading = (txt, yy) => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(fs(9.5)); doc.setTextColor(...PDFC.teal);
      doc.text(pdfText(txt.toUpperCase()), M, yy);
      doc.setDrawColor(...PDFC.line); doc.setLineWidth(0.3); doc.line(M, yy + 1.6, W - M, yy + 1.6);
      return yy + 4;
    };

    // Calculation table
    y = heading(t('schemeHead'), y);
    const rows = schemeRows(c, hasPrice);
    doc.autoTable({
      startY: y, margin: { left: M, right: M }, theme: 'plain',
      body: rows.map(r => r.kind === 'sep'
        ? [{ content: pdfText(r.label.toUpperCase()), colSpan: 3 }]
        : [pdfText(r.label), pdfText(fmtVal(r.value)), pdfText(r.extra)]),
      styles: { font: 'helvetica', fontSize: fs(8.2), cellPadding: { top: fs(1.05), bottom: fs(1.05), left: 2.2, right: 2.2 }, textColor: PDFC.navy, lineColor: PDFC.white, lineWidth: { bottom: 0.25 } },
      columnStyles: { 0: { cellWidth: 'auto' }, 1: { halign: 'right', cellWidth: 34 }, 2: { halign: 'right', cellWidth: 17, textColor: PDFC.muted, fontSize: fs(7) } },
      didParseCell: d => {
        const r = rows[d.row.index];
        if (!r) return;
        if (r.sec) d.cell.styles.fillColor = PDFC[r.sec];
        if (r.kind === 'strong') d.cell.styles.fontStyle = 'bold';
        if (r.kind === 'sub' && d.column.index === 0) { d.cell.styles.cellPadding = { ...d.cell.styles.cellPadding, left: 6 }; d.cell.styles.textColor = PDFC.muted; }
        if (r.kind === 'hl') { d.cell.styles.fillColor = PDFC.navy; d.cell.styles.textColor = PDFC.white; d.cell.styles.fontStyle = 'bold'; }
        if (r.kind === 'total') { d.cell.styles.fontStyle = 'bold'; d.cell.styles.lineColor = PDFC.navy; d.cell.styles.lineWidth = { top: 0.5 }; }
        if (r.kind === 'sep') { d.cell.styles.textColor = PDFC.teal; d.cell.styles.fontStyle = 'bold'; d.cell.styles.fontSize = fs(7); d.cell.styles.cellPadding = { top: fs(2.4), bottom: fs(0.8), left: 0, right: 0 }; }
        if (d.column.index === 1 && typeof r.value === 'number' && r.value < -0.004 && r.kind !== 'hl') d.cell.styles.textColor = PDFC.neg;
      }
    });
    y = doc.lastAutoTable.finalY + 6;

    // Inputs: three tables side by side
    y = heading(t('pdfInputs'), y);
    const colGap = 4, colW = (CW - 2 * colGap) / 3;
    const mode = state.mode === 'margin' ? t('modeMargin') : t('modeStandard');
    const opt = v => (v === null || v === undefined || v === '' ? '–' : v);
    const base = [
      [t('priceLabel'), hasPrice ? eur(state.price) : '–', 's1'],
      [t('vatLabel'), `${state.vat} %`, 's1'],
      [t('modeLabel'), mode, 's1'],
      [t('plannedLabel'), opt(state.planned && int(state.planned)), 's4'],
      [t('capacityLabel'), opt(state.capacity && int(state.capacity)), 's4'],
      [t('targetLabel'), opt(state.target && eur(state.target)), 's4']
    ];
    const margin = state.mode === 'margin';
    const varRowsUsed = state.vars.filter(r => r.name || r.amount);
    const fixRowsUsed = state.fixes.filter(r => r.name || r.amount);
    const varBody = varRowsUsed.length ? varRowsUsed.map(r => [
      (r.name || '–') + (margin && r.rvl ? ` (${t('rvl')})` : ''),
      r.amount === null ? '–' : (r.unit === 'pct' ? `${new Intl.NumberFormat(locale()).format(r.amount)} %` : eur(r.amount))
    ]) : [[t('emptyVar'), '']];
    const fixBody = fixRowsUsed.length ? fixRowsUsed.map(r => [
      (r.name || '–') + (margin && r.rvl ? ` (${t('rvl')})` : ''),
      r.amount === null ? '–' : eur(r.amount)
    ]) : [[t('emptyFix'), '']];
    if (fixRowsUsed.length) fixBody.push([t('sFix'), eur(c.F), 'sum']);
    if (varRowsUsed.length && hasPrice) varBody.push([t('sVar'), eur(c.V), 'sum']);

    const tableAt = (idx, title, badge, ink, fillC, body, secFor) => {
      doc.autoTable({
        startY: y, margin: { left: M + idx * (colW + colGap) }, tableWidth: colW, theme: 'plain',
        head: [[{ content: pdfText(title), colSpan: 2 }]],
        body: body.map(r => [pdfText(r[0]), pdfText(r[1])]),
        styles: { font: 'helvetica', fontSize: fs(7.4), cellPadding: { top: fs(1), bottom: fs(1), left: 2, right: 2 }, textColor: PDFC.navy, lineColor: PDFC.white, lineWidth: { bottom: 0.25 }, overflow: 'linebreak' },
        headStyles: { fillColor: badge, textColor: ink, fontStyle: 'bold', fontSize: fs(7.6) },
        columnStyles: { 1: { halign: 'right', cellWidth: colW * 0.38 } },
        didParseCell: d => {
          if (d.section !== 'body') return;
          const r = body[d.row.index];
          d.cell.styles.fillColor = PDFC[secFor(r)] || fillC;
          if (r[2] === 'sum') d.cell.styles.fontStyle = 'bold';
        }
      });
      return doc.lastAutoTable.finalY;
    };
    const y1 = tableAt(0, `1 + 4 · ${t('pdfBase')}`, PDFC.b1, PDFC.white, PDFC.s1, base, r => r[2]);
    const y2 = tableAt(1, `2 · ${t('varHead')}`, PDFC.b2, PDFC.white, PDFC.s2, varBody, () => 's2');
    const y3 = tableAt(2, `3 · ${t('fixHead')}`, PDFC.b3, PDFC.navy, PDFC.s3, fixBody, () => 's3');
    y = Math.max(y1, y2, y3);

    // Footer
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8); doc.setTextColor(...PDFC.muted);
    doc.setDrawColor(...PDFC.line); doc.line(M, H - 12, W - M, H - 12);
    doc.text(pdfText(t('pdfFooter')), M, H - 8, { maxWidth: CW - 40 });
    doc.text('leisureworkspace.com/ticketrechner', W - M, H - 8, { align: 'right' });

    return { doc, fits: doc.getNumberOfPages() === 1 && y <= H - 15 };
  }

  $('pdfBtn').addEventListener('click', async () => {
    const btn = $('pdfBtn');
    if (btn.getAttribute('aria-busy') === 'true') return;
    btn.setAttribute('aria-busy', 'true');
    try {
      const JsPDF = await ensurePdfLibs();
      let out;
      for (const sc of [1, 0.92, 0.84, 0.76, 0.68, 0.6, 0.52]) {
        out = buildPdf(JsPDF, sc);
        if (out.fits) break;
      }
      if (out.doc.getNumberOfPages() > 1) {
        for (let i = out.doc.getNumberOfPages(); i > 1; i--) out.doc.deletePage(i);
      }
      if (await saveBlob(out.doc.output('blob'), `ticketrechner-${stamp()}.pdf`)) toast(t('pdfDone'));
    } catch (err) {
      toast(t('pdfError'), true);
    } finally {
      btn.removeAttribute('aria-busy');
    }
  });

  $('resetBtn').addEventListener('click', () => {
    if (!confirm(t('resetConfirm'))) return;
    state = emptyState();
    syncInputs(); renderRows(); update();
    el.price.focus();
  });

  function syncInputs() {
    el.price.value = state.price ?? '';
    el.planned.value = state.planned ?? '';
    el.target.value = state.target ?? '';
    el.capacity.value = state.capacity ?? '';
  }

  // Init
  syncInputs();
  applyLang();

  // Expose for tests
  window.__ticketrechner = { calculate, normalize };
})();
