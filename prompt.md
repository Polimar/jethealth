# Prompt esteso per progettare e sviluppare JetHealth

Crea una web app healthcare chiamata **JetHealth**, pensata per aiutare gli utenti del Lazio a capire rapidamente quale sia il percorso sanitario più appropriato in base ai sintomi inseriti.

JetHealth non deve sostituire un medico, non deve formulare diagnosi definitive e non deve incoraggiare l’automedicazione rischiosa. Deve essere un sistema di **orientamento sanitario e triage digitale prudente**, capace di distinguere tra situazioni lievi, moderate e gravi, indirizzando l’utente verso la soluzione più adatta: autocura guidata, medico di base, continuità assistenziale, farmacia, teleconsulto, ambulatorio, oppure pronto soccorso.

## Visione del prodotto

JetHealth deve ridurre gli accessi inutili al pronto soccorso e, allo stesso tempo, aiutare chi ha sintomi gravi a raggiungere rapidamente la struttura più adatta.

L’obiettivo è creare una web app semplice, veloce e rassicurante, con un’interfaccia moderna e mobile-first. L’utente deve poter descrivere i propri sintomi in linguaggio naturale oppure tramite domande guidate. L’app analizza il livello di urgenza, mostra una spiegazione comprensibile e propone il percorso migliore.

Per sintomi lievi, JetHealth deve scoraggiare l’accesso improprio al pronto soccorso e proporre alternative: monitoraggio dei sintomi, contatto con medico di base, guardia medica, farmacia, teleconsulto o strutture territoriali.

Per sintomi potenzialmente gravi, JetHealth deve consigliare di chiamare il 112/118 o recarsi al pronto soccorso, mostrando le strutture più adatte sulla base di posizione, distanza, tempi di attesa, numero di pazienti in attesa, disponibilità e rilevanza clinica.

## Target utenti

La web app è pensata per:

* cittadini residenti nel Lazio;
* turisti o persone temporaneamente presenti a Roma e nel Lazio;
* caregiver che devono aiutare familiari anziani o bambini;
* persone che non sanno se andare in pronto soccorso;
* utenti che vogliono capire quale servizio sanitario territoriale sia più appropriato.

## Funzionalità principali

### 1. Inserimento sintomi

L’utente può inserire i sintomi in due modi:

1. Campo libero in linguaggio naturale, per esempio:
   “Ho febbre a 38,5, mal di gola e tosse da due giorni”
   “Ho dolore al petto e difficoltà a respirare”
   “Mio figlio ha vomito e diarrea da stamattina”

2. Percorso guidato con domande progressive:

   * Età del paziente
   * Sesso, se rilevante
   * Durata dei sintomi
   * Intensità del dolore da 1 a 10
   * Presenza di febbre
   * Difficoltà respiratorie
   * Dolore toracico
   * Perdita di coscienza
   * Trauma recente
   * Gravidanza
   * Patologie note
   * Farmaci assunti
   * Allergie note
   * Peggioramento rapido
   * Sintomi neurologici come confusione, difficoltà a parlare, debolezza improvvisa

L’interfaccia deve essere estremamente chiara, con tono empatico e rassicurante.

### 2. Classificazione dell’urgenza

JetHealth deve classificare ogni caso in una delle seguenti categorie:

**Bassa urgenza**
Sintomi lievi, stabili, senza red flag. L’app deve suggerire di non andare in pronto soccorso e proporre alternative sicure: monitoraggio, medico di base, farmacia, continuità assistenziale o teleconsulto.

**Media urgenza**
Sintomi non immediatamente critici ma che richiedono attenzione medica entro un certo tempo. L’app deve suggerire medico di base, continuità assistenziale, ambulatorio, centro specialistico o eventualmente pronto soccorso solo se i sintomi peggiorano.

**Alta urgenza**
Sintomi potenzialmente gravi. L’app deve consigliare di chiamare il 112/118 o andare rapidamente in pronto soccorso. Deve mostrare i PS più adatti in base alla posizione dell’utente, ai tempi di attesa e alla tipologia di emergenza.

**Emergenza immediata**
Sintomi critici come dolore toracico intenso, difficoltà respiratoria grave, perdita di coscienza, segni di ictus, trauma importante, emorragia importante, reazione allergica grave, convulsioni, confusione improvvisa, peggioramento rapido. In questi casi l’app non deve far perdere tempo all’utente: deve mostrare immediatamente un messaggio evidente con invito a chiamare il 112/118.

### 3. Logica di sicurezza clinica

La logica di triage deve essere conservativa. In caso di dubbio, JetHealth deve scegliere l’opzione più sicura.

L’app deve sempre mostrare un disclaimer visibile:

“JetHealth non sostituisce il parere di un medico. In caso di emergenza o peggioramento rapido, chiama subito il 112/118.”

La web app non deve mai dire “non hai nulla” o “non andare assolutamente dal medico”. Deve invece usare formule prudenti come:

* “I sintomi sembrano compatibili con una situazione a bassa urgenza, salvo peggioramento.”
* “Al momento potrebbe non essere necessario andare in pronto soccorso.”
* “Ti consigliamo di contattare il medico di base o la continuità assistenziale.”
* “Se compaiono difficoltà respiratorie, dolore toracico, confusione, svenimento o peggioramento rapido, chiama subito il 112/118.”

### 4. Raccomandazione del percorso migliore

Dopo l’analisi dei sintomi, JetHealth deve mostrare una schermata di risultato con:

* Livello di urgenza
* Spiegazione semplice
* Azione consigliata
* Cosa fare ora
* Cosa monitorare
* Quando preoccuparsi
* Alternative al pronto soccorso
* Eventuale lista dei pronto soccorso più adatti
* Pulsante “Chiama 112/118” nei casi gravi
* Pulsante “Trova struttura vicina”
* Pulsante “Invia riepilogo al medico”
* Pulsante “Salva riepilogo”

### 5. Integrazione con API Regione Lazio / Salute Lazio

JetHealth deve integrare le API pubbliche o autorizzate del sistema Salute Lazio per recuperare strutture sanitarie, posizione, disponibilità, numero di persone in attesa e tempi stimati.

Esempio di endpoint disponibile:

`https://server.salutelazio.it/server/external-services/facilities/structures/list`

Parametri di esempio:

* `westLng`
* `southLat`
* `eastLng`
* `northLat`
* `zoom`
* `lang`
* `page`
* `limit`
* `originLat`
* `originLng`
* `facilityTypeIds`

L’app deve avere un modulo API adapter chiamato `LazioHealthApiService`, responsabile di:

* costruire la query in base alla posizione utente;
* recuperare strutture sanitarie nel raggio utile;
* filtrare per tipologia di struttura;
* distinguere tra studi medici, ambulatori, ospedali e pronto soccorso;
* recuperare eventuali dati di attesa se disponibili;
* normalizzare la risposta API;
* gestire errori, timeout e dati mancanti;
* mostrare fallback utili se l’API non risponde.

La risposta normalizzata per ogni struttura deve includere:

* nome struttura;
* indirizzo;
* telefono;
* coordinate;
* distanza in km;
* tipologia struttura;
* eventuale ID organizzazione emergenza;
* numero pazienti in attesa;
* tempo medio stimato;
* disponibilità;
* link o URL struttura;
* punteggio di raccomandazione.

### 6. Ranking dei pronto soccorso

Quando l’utente presenta sintomi gravi, JetHealth deve classificare i pronto soccorso in base a un punteggio composito.

Il ranking deve considerare:

* distanza dall’utente;
* tempo di percorrenza stimato;
* numero di pazienti in attesa;
* tempi di attesa stimati;
* gravità dei sintomi;
* specializzazione della struttura;
* presenza di pediatria, cardiologia, neurologia, trauma center o maternità, se rilevante;
* affidabilità e aggiornamento del dato;
* possibilità di contatto telefonico;
* disponibilità di servizi di emergenza.

Esempio di logica:

* Per sintomi neurologici, dare priorità a strutture idonee per ictus o neurologia.
* Per sintomi cardiaci, dare priorità a strutture con cardiologia/emodinamica se disponibili.
* Per bambini, dare priorità a pronto soccorso pediatrico.
* Per gravidanza, dare priorità a strutture con ostetricia/ginecologia.
* Per trauma, dare priorità a ospedali adatti alla gestione traumatologica.

Il risultato non deve limitarsi al PS con meno attesa. Deve bilanciare attesa, distanza e adeguatezza clinica.

### 7. UI/UX della web app

La web app deve essere mobile-first, veloce e accessibile.

Stile visivo:

* nome: JetHealth;
* tono: moderno, affidabile, pulito;
* colori: bianco, blu sanitario, verde per basso rischio, giallo/arancio per attenzione, rosso per emergenza;
* design: card, stepper, icone semplici, mappa interattiva;
* font leggibile;
* massima accessibilità per utenti anziani.

Schermate principali:

1. **Home**

   * Headline: “Capisci dove andare, prima di andare in pronto soccorso.”
   * CTA: “Analizza i miei sintomi”
   * CTA secondaria: “Trova pronto soccorso vicino”
   * Disclaimer medico breve

2. **Symptom Intake**

   * Input testuale
   * Domande guidate
   * Selezione età/paziente
   * Pulsante “Continua”

3. **Red Flag Check**

   * Domande rapide su emergenze immediate
   * Se emergenza, interrompere il flusso e mostrare invito a chiamare 112/118

4. **Risultato Triage**

   * Livello di urgenza
   * Spiegazione
   * Azione raccomandata
   * Alternative
   * Warning signs

5. **Mappa Strutture**

   * Lista strutture ordinate per raccomandazione
   * Mappa con marker
   * Distanza
   * Tempi di attesa
   * Numero persone in attesa
   * Pulsante “Apri navigazione”

6. **Dettaglio Struttura**

   * Nome
   * Indirizzo
   * Telefono
   * Orari
   * Tipologia
   * Tempi stimati
   * Indicazioni stradali
   * Avviso: “In emergenza chiama 112/118”

7. **Riepilogo per medico**

   * Sintomi
   * Durata
   * intensità
   * fattori di rischio
   * raccomandazione JetHealth
   * timestamp
   * possibilità di esportare PDF o condividere

### 8. User flow principale

1. L’utente apre JetHealth.
2. Inserisce sintomi e posizione.
3. L’app chiede domande essenziali per identificare red flag.
4. L’app classifica l’urgenza.
5. Se bassa urgenza, suggerisce alternative al pronto soccorso.
6. Se media urgenza, propone medico, continuità assistenziale o struttura territoriale.
7. Se alta urgenza, recupera i pronto soccorso tramite API Regione Lazio.
8. L’app ordina le strutture per adeguatezza.
9. L’utente sceglie la struttura, avvia navigazione o chiama emergenza.
10. L’app genera un riepilogo condivisibile.

### 9. Requisiti tecnici

Costruire una web app moderna con:

* frontend responsive;
* backend API layer;
* integrazione geolocalizzazione browser;
* servizio per chiamate API Salute Lazio;
* servizio di triage;
* sistema di ranking;
* gestione errori;
* logging privacy-safe;
* interfaccia admin opzionale;
* analytics anonimi per capire quante persone vengono reindirizzate fuori dal pronto soccorso.

Architettura suggerita:

Frontend:

* React, Next.js o equivalente;
* componenti modulari;
* mappa interattiva;
* form guidati;
* stato utente temporaneo.

Backend:

* Node.js, Python FastAPI o equivalente;
* endpoint `/triage`;
* endpoint `/facilities`;
* endpoint `/recommendation`;
* adapter API Lazio;
* cache temporanea per dati strutture;
* rate limiting;
* validazione input.

AI layer:

* classificazione sintomi;
* generazione spiegazione semplice;
* non formulare diagnosi definitiva;
* output strutturato JSON;
* sempre includere safety warnings.

Database opzionale:

* strutture normalizzate;
* log anonimi;
* feedback utenti;
* configurazione regole triage.

### 10. Output AI strutturato

Il motore AI deve restituire un JSON simile:

```json
{
  "urgencyLevel": "low | medium | high | emergency",
  "recommendedAction": "self_care | doctor | continuity_care | pharmacy | urgent_care | emergency_room | call_112_118",
  "plainLanguageExplanation": "...",
  "redFlagsDetected": [],
  "questionsAsked": [],
  "nextSteps": [],
  "watchFor": [],
  "facilitySearchRequired": true,
  "preferredFacilityTypes": [],
  "specialtyNeeds": [],
  "confidence": "low | medium | high",
  "safetyDisclaimer": "JetHealth non sostituisce il parere di un medico..."
}
```

### 11. Privacy, sicurezza e compliance

JetHealth tratta dati potenzialmente sanitari. Deve quindi applicare privacy by design.

Requisiti:

* raccogliere solo dati necessari;
* consenso esplicito prima di trattare dati sanitari;
* possibilità di usare l’app senza creare account;
* evitare salvataggio non necessario dei sintomi;
* anonimizzare analytics;
* cifrare dati sensibili;
* informativa privacy chiara;
* possibilità di cancellare i dati;
* evitare invio dati a terze parti non necessarie;
* separare dati clinici da dati tecnici;
* valutare se il prodotto rientra in normative su dispositivi medici software.

### 12. Tono di voce

Il tono deve essere:

* chiaro;
* empatico;
* calmo;
* non allarmistico;
* prudente;
* diretto nei casi gravi.

Esempi:

Per sintomi lievi:
“Dai sintomi indicati non emergono segnali di emergenza immediata. Al momento potrebbe non essere necessario andare in pronto soccorso. Ti consigliamo di monitorare i sintomi e contattare il medico di base o la continuità assistenziale se persistono o peggiorano.”

Per sintomi gravi:
“I sintomi che hai indicato possono richiedere assistenza urgente. Ti consigliamo di chiamare subito il 112/118 o recarti al pronto soccorso. Qui sotto trovi le strutture più vicine e potenzialmente più adatte.”

Per emergenza:
“Potrebbe trattarsi di un’emergenza. Chiama subito il 112/118. Non guidare da solo se hai sintomi gravi.”

### 13. Differenziazione del prodotto

JetHealth deve posizionarsi come:

“Il navigatore intelligente per scegliere il percorso sanitario giusto.”

Non è solo un symptom checker. È un sistema che combina:

* triage digitale;
* dati real-time su strutture e tempi di attesa;
* geolocalizzazione;
* alternative territoriali;
* mappa sanitaria;
* riduzione degli accessi impropri;
* orientamento rapido nei momenti di ansia.

### 14. MVP

La prima versione deve includere:

* landing page;
* input sintomi;
* red flag check;
* classificazione urgenza;
* raccomandazione percorso;
* geolocalizzazione;
* lista strutture Lazio tramite API;
* ranking base per distanza e dati di attesa;
* pagina dettaglio struttura;
* disclaimer medico;
* feedback utente.

### 15. Versione futura

Le versioni successive possono includere:

* login opzionale;
* profilo sanitario base;
* caregiver mode;
* pediatria;
* gravidanza;
* integrazione farmacie;
* telemedicina;
* PDF per medico;
* notifiche di follow-up;
* dashboard per strutture sanitarie;
* dashboard anonima per Regione/ASL;
* previsione dei picchi di affluenza;
* integrazione con fascicolo sanitario, se autorizzata;
* supporto multilingua per turisti;
* accessibilità vocale per anziani.

### 16. Feature addizionale: dashboard anonima per Regione/ASL

Come funzionalità futura e non primaria, JetHealth può includere una dashboard istituzionale per Regione, ASL o soggetti sanitari autorizzati, basata esclusivamente su dati aggregati e anonimizzati.

L’obiettivo non è monitorare singoli cittadini, ma offrire insight di sanità pubblica utili per capire in tempo quasi reale l’andamento dei bisogni sanitari sul territorio.

La dashboard può mostrare:

* zone con aumento anomalo di sintomi respiratori, gastrointestinali, febbrili o neurologici;
* trend temporali anonimi dei sintomi segnalati;
* possibili segnali precoci di picchi influenzali, epidemici o stagionali;
* aumento della domanda sanitaria per area geografica;
* distribuzione dei bisogni tra pronto soccorso, medico di base, continuità assistenziale, farmacia e teleconsulto;
* stima degli accessi evitati al pronto soccorso grazie al reindirizzamento verso percorsi più appropriati;
* alert aggregati su possibili cluster territoriali di sintomi compatibili con malattie rilevanti;
* serie storiche utilizzabili per modelli di machine learning o modelli statistici di early prediction dei picchi di malattia.

Questa funzionalità deve essere progettata con vincoli forti:

* nessun dato identificativo personale;
* nessuna possibilità di risalire a un singolo utente;
* aggregazione per soglie minime di numerosità;
* minimizzazione dei dati raccolti;
* consenso chiaro ove necessario;
* governance pubblica e auditabilità degli algoritmi;
* uso esclusivo per finalità di salute pubblica, pianificazione sanitaria e prevenzione.

La dashboard deve restare secondaria rispetto alla missione principale di JetHealth, che è aiutare il singolo utente a scegliere il percorso sanitario più appropriato in modo sicuro e prudente.
