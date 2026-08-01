# BugBoard26 - Frontend 🐛

## 📖 Descrizione del Progetto
BugBoard26 è una piattaforma per la gestione collaborativa di issue,domande o bug. Il sistema consente a team di sviluppo di segnalare problemi relativi a un progetto, monitorarne lo stato, assegnarli a membri del team e tenere traccia delle attività di risoluzione.

Questo repository contiene il **Front-end** dell'applicazione, progettato per comunicare esclusivamente tramite API REST con un Back-end indipendente.

## 👥 Chi Siamo
* **Luigi De Falchi** -.
* **Simone Catenaccio** -
Entrambi studenti dell'Università degli Studi di Napoli Federico II.


## ✨ Funzionalità Implementate
In conformità con le specifiche del progetto, questo applicativo implementa le seguenti funzionalità:
* **Autenticazione Sicura (Req. 1):** Sistema di autenticazione semplice e sicuro basato su email e password. Include la gestione di account standard e di account amministratore, essenziali per preservare l'integrità delle informazioni aziendali.
* **Gestione Segnalazioni (Req. 2):** Gli utenti autenticati possono creare issue specificando titolo, descrizione e opzionalmente priorità e immagini. Le tipologie supportate sono *question*, *bug*, *documentation* e *feature*, e vengono inizializzate nello stato "todo".
* **Visualizzazione e Filtri (Req. 3):** È presente una vista riepilogativa delle issue che offre la possibilità di filtrare o ordinare i risultati in base a tipologia, stato e priorità.
* **Sistema di Commenti (Req. 5):** Sezione dedicata associata a ciascun bug dove tutti gli utenti possono scambiarsi messaggi, fornire aggiornamenti o chiedere chiarimenti.
* **Etichette Personalizzate (Req. 10):** Il sistema permette di associare un numero variabile di etichette personalizzabili (come ad esempio "frontend", "urgente" o "sicurezza") ai singoli bug.

## 🛠️ Stack Tecnologico
* **Front-end:** React, TypeScript, Vite
* **Back-end:** Java, SpringBoot (Gestito in un repository separato).

## 🚀 Come avviare il progetto localmente

1) Assicurati di avere [Node.js](https://nodejs.org/en/download) installato sul tuo computer.

2) Installa le dipendenze (bash):
    npm install
3) Avvia il progetto (bash):
    npm run dev
4) Apri l'applicazione :
   Visita http://localhost:5173 nel tuo browser. 
   **Nota: Assicurati che il Back-end SpringBoot sia in esecuzione parallela affinché le API REST rispondano correttamente per il login e il caricamento dei dati.**