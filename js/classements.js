// js/classements.js
// Version complète et commentée, incluant :
// - Section Équipes triées par Victoires/Podiums/Top5/Top10/tie-breaker général
// - Section Coureurs triée de même façon
// - Nouvelle section "Historique des victoires" listant, par ordre chronologique, chaque victoire d’étape
//
// Prérequis dans HTML :
//   <script src="js/etapes.js"></script>        // définit const ETAPES = [{ numero, pays, ville1, ville2 }, ...]
//   <script src="js/team_jerseys.js"></script> // définit const TEAM_JERSEYS = { "Nom Équipe": "chemin.png", ... }
//   <script src="js/classements.js"></script>   // ce fichier
//
// Note : Veillez à charger etapes.js et team_jerseys.js avant ce script.

document.addEventListener('DOMContentLoaded', () => {
    // ========================================================================
    // 1. Sélection des éléments DOM principaux
    // ========================================================================
    const etapeSelect       = document.getElementById('etapeSelect');     // <select> pour choisir l’étape
    const btnEtape          = document.getElementById('btnEtape');        // bouton vue Étape
    const btnGeneral        = document.getElementById('btnGeneral');      // bouton vue Général
    const btnHall           = document.getElementById('btnHall');         // bouton vue Hall of Fame
    const prevBtn           = document.getElementById('prevEtape');       // bouton étape précédente
    const nextBtn           = document.getElementById('nextEtape');       // bouton étape suivante
    const tabButtons        = document.querySelectorAll('.tab-button');   // onglets Temps/Points/Montagne/Jeune/Équipe
    const etapeControl      = document.querySelector('.etape-control');   // conteneur flèches + select étape
    const tabsContainer     = document.querySelector('.tabs');           // conteneur des onglets
    const container         = document.getElementById('tabContent');      // conteneur principal pour afficher tableaux ou Hall
    const maillotContainer  = document.getElementById('maillotContainer');// conteneur pour afficher maillot de l’équipe leader de la vue
    const searchInput       = document.getElementById('searchInput');     // champ de recherche nom coureur (facultatif)
    const teamFilter        = document.getElementById('teamFilter');      // <select> filtre par équipe (facultatif)
    const TEAM_STAGES = [18, 25, 44];
    const LEADER_NAMES = [
    "riccardo ricco", "clim atizer", "yves gêle", "naruto uzumaki", "uwe pilsner",
    "otta kringer", "heine ken", "grim bergen", "lance armstrong", "snoop dog",
    "elon musk", "diego maradona", "n'golo comté", "cam ambert", "gou da",
    "mozza rella", "matt houston", "mi loud", "aurel san", "gilles tarot",
    "richard virenque", "henoc beausejour", "jan ullrich", "saint emilion"
];



    console.log('[classements.js] Initialisation DOMContentLoaded');

    if (!etapeSelect) console.error('[classements.js] ERREUR : élément #etapeSelect introuvable.');
    if (!container) console.error('[classements.js] ERREUR : élément #tabContent introuvable.');

    // Type de vue actif: 'etape', 'general', 'hall'
    let viewType = 'etape';

    // Stockage temporaire des leaders généraux pour l’étape sélectionnée
    let generalLeaders = { temps: null, points: null, montagne: null, jeune: null };

    // ------------------------------------------------------------------------
    // Vérification ETAPES défini et non vide
    // ------------------------------------------------------------------------
    if (typeof ETAPES === 'undefined') {
        console.error('[classements.js] ERREUR FATALE : ETAPES est indéfini. Vérifiez que js/etapes.js est chargé avant ce script.');
        if (etapeSelect) {
            etapeSelect.innerHTML = '<option value="">Erreur: pas de données d\'étapes</option>';
        }
        return;
    }
    if (!Array.isArray(ETAPES) || ETAPES.length === 0) {
        console.warn('[classements.js] ETAPES est défini mais vide ou non-tableau.');
        if (etapeSelect) {
            etapeSelect.innerHTML = '<option value="">Aucune étape définie</option>';
        }
    } else {
        console.log(`[classements.js] ETAPES défini avec ${ETAPES.length} éléments.`);
    }

    // ========================================================================
    // 2. Fonctions utilitaires
    // ========================================================================

    /** Capitalise la première lettre d'une chaîne. */
    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ------------------------------------------------------------------------
    // 2.1 Gestion des maillots d’équipe: TEAM_JERSEYS mapping
    // ------------------------------------------------------------------------
    let TEAM_JERSEYS_NORM = {};
    if (typeof TEAM_JERSEYS !== 'undefined') {
        Object.keys(TEAM_JERSEYS).forEach(name => {
            const norm = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            TEAM_JERSEYS_NORM[norm] = TEAM_JERSEYS[name];
        });
        console.log('[classements.js] TEAM_JERSEYS détecté, clés :', Object.keys(TEAM_JERSEYS));
    } else {
        console.warn('[classements.js] TEAM_JERSEYS non défini. Pas d’affichage de maillots.');
    }

    /** Retourne le chemin de l’image du maillot pour une équipe donnée (ou null si absent). */
    function getJerseyPath(teamNameRaw) {
        if (!teamNameRaw) return null;
        const teamName = teamNameRaw.trim();
        if (typeof TEAM_JERSEYS !== 'undefined' && TEAM_JERSEYS[teamName]) {
            return TEAM_JERSEYS[teamName];
        }
        const norm = teamName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (TEAM_JERSEYS_NORM[norm]) {
            return TEAM_JERSEYS_NORM[norm];
        }
        return null;
    }

    /** Affiche le maillot de l’équipe leader dans #maillotContainer. */
    function afficherMaillotEquipe(equipeNameRaw) {
        if (!maillotContainer) return;
        maillotContainer.innerHTML = '';
        const path = getJerseyPath(equipeNameRaw);
        if (path) {
            const img = document.createElement('img');
            img.src = path;
            img.alt = `Maillot ${equipeNameRaw.trim()}`;
            img.classList.add('maillot-img', 'leader-maillot');
            img.loading = 'lazy';
            maillotContainer.appendChild(img);
        }
    }

    // ------------------------------------------------------------------------
    // 2.2 Parsing de temps
    // ------------------------------------------------------------------------
    function parseTimeToSeconds(timeStr) {
        if (typeof timeStr !== 'string') return NaN;
        const parts = timeStr.split(':').map(p => parseInt(p, 10));
        if (parts.some(isNaN)) return NaN;
        if (parts.length === 2) {
            const [mm, ss] = parts;
            return mm * 60 + ss;
        } else if (parts.length === 3) {
            const [h, m, s] = parts;
            return h * 3600 + m * 60 + s;
        }
        return NaN;
    }
    function formatSecondsToHMS(sec) {
        if (isNaN(sec) || sec < 0) return '';
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        if (h > 0) {
            return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        } else {
            return `${m}:${String(s).padStart(2,'0')}`;
        }
    }

    // ------------------------------------------------------------------------
    // 2.3 Filtrage du tableau (recherche + filtre équipe)
    // ------------------------------------------------------------------------
    function applyFilters() {
        if (!searchInput && !teamFilter) return;
        const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const selectedTeam = teamFilter ? teamFilter.value.trim().toLowerCase() : '';
        const leaderCheckbox = document.getElementById("leaderFilter");
        const filterLeaderOnly = leaderCheckbox && leaderCheckbox.checked;

        const table = container.querySelector('table');
        if (!table) return;
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        // Trouver index colonnes Nom et Équipe
        const ths = table.querySelectorAll('thead th');
        let idxNom = -1, idxEquipe = -1;
        ths.forEach((th, idx) => {
            const txt = th.textContent.trim().toLowerCase();
            if (txt === 'nom') idxNom = idx;
            if (txt === 'équipe' || txt === 'equipe') idxEquipe = idx;
        });
        Array.from(tbody.rows).forEach(row => {
            let texteNom = '', texteEquipe = '';
            if (idxNom >= 0) {
                const cell = row.cells[idxNom];
                if (cell) texteNom = cell.textContent.trim().toLowerCase();
            }
            if (idxEquipe >= 0) {
                const cellEq = row.cells[idxEquipe];
                if (cellEq) texteEquipe = cellEq.textContent.trim().toLowerCase();
            }
            let visible = true;

if (filterLeaderOnly) {
    if (!LEADER_NAMES.includes(texteNom)) visible = false;
}

if (visible && searchText) {
    if (!texteNom.includes(searchText)) visible = false;
}

if (visible && selectedTeam) {
    if (!texteEquipe || texteEquipe !== selectedTeam) visible = false;
}

            row.style.display = visible ? '' : 'none';
        });
    }

    // ------------------------------------------------------------------------
    // 2.4 Icônes maillots généraux (leaders)
    // ------------------------------------------------------------------------
    const CLASSIFY_JERSEY_PATHS = {
        temps:    'images/jerseys/leader_gc.png',
        points:   'images/jerseys/leader_points.png',
        montagne: 'images/jerseys/leader_montagne.png',
        jeune:    'images/jerseys/leader_jeune.png'
    };

    // ------------------------------------------------------------------------
    // 2.5 Récupération leaders généraux
    // ------------------------------------------------------------------------
    async function fetchGeneralLeaderObj(numStr, suffixe) {
        const fileName = `data/classements/general_etape_${numStr}_${suffixe}.json`;
        try {
            const resp = await fetch(fileName);
            if (!resp.ok) {
                console.warn(`[classements.js] général JSON introuvable : ${fileName} (status ${resp.status})`);
                return null;
            }
            const dataList = await resp.json();
            if (!Array.isArray(dataList) || dataList.length === 0) {
                console.warn(`[classements.js] général JSON vide pour ${suffixe}`);
                return null;
            }
            const entry = dataList[0];
            return { nom: entry.nom || null, equipe: entry.equipe || null };
        } catch (err) {
            console.error(`[classements.js] Erreur fetch général JSON ${fileName}:`, err);
            return null;
        }
    }
    async function fetchGeneralLeaderTeamObj(numStr) {
        const fileName = `data/classements/general_etape_${numStr}_equipe.json`;
        try {
            const resp = await fetch(fileName);
            if (!resp.ok) {
                console.warn(`[classements.js] général équipe JSON introuvable : ${fileName} (status ${resp.status})`);
                return null;
            }
            const dataList = await resp.json();
            if (!Array.isArray(dataList) || dataList.length === 0) {
                console.warn(`[classements.js] général équipe JSON vide pour étape ${numStr}`);
                return null;
            }
            const entry = dataList[0];
            return { equipe: entry.equipe || null };
        } catch (err) {
            console.error(`[classements.js] Erreur fetch général équipe JSON ${fileName}:`, err);
            return null;
        }
    }

    // ------------------------------------------------------------------------
    // 2.6 Récupération classement général des coureurs pour tie-breaker
    // ------------------------------------------------------------------------
    async function fetchGeneralClassementTemps(numStr) {
        const fileName = `data/classements/general_etape_${numStr}_temps.json`;
        try {
            const resp = await fetch(fileName);
            if (!resp.ok) {
                console.warn(`[classements.js] général classement JSON introuvable : ${fileName} (status ${resp.status})`);
                return null;
            }
            const dataList = await resp.json();
            if (!Array.isArray(dataList)) {
                console.warn(`[classements.js] format inattendu pour général classement ${fileName}`);
                return null;
            }
            return dataList;
        } catch (err) {
            console.error(`[classements.js] Erreur fetch général classement JSON ${fileName}:`, err);
            return null;
        }
    }

    // ========================================================================
    // 3. Fonctions Hall of Fame
    // ========================================================================
    async function etapeTermineeExiste(numStr) {
        const file = `data/classements/etape_${numStr}_temps.json`;
        try {
            const resp = await fetch(file);
            if (!resp.ok) return false;
            await resp.json();
            return true;
        } catch (e) {
            console.warn(`[Hall] échec chargement ${file} :`, e);
            return false;
        }
    }
    async function chargerResultatsEtape(numStr) {
        const file = `data/classements/etape_${numStr}_temps.json`;
        try {
            const resp = await fetch(file);
            if (!resp.ok) {
                console.warn(`[Hall] résultats non trouvés pour étape ${numStr}: status ${resp.status}`);
                return null;
            }
            const data = await resp.json();
            if (!Array.isArray(data)) {
                console.warn(`[Hall] format inattendu JSON pour étape ${numStr}`);
                return null;
            }
            return data;
        } catch (e) {
            console.error(`[Hall] erreur fetch/parsing étape ${numStr}:`, e);
            return null;
        }
    }

    /**
     * Agrège les stats du tour en cours sur les étapes terminées,
     * pour Hall of Fame : équipes ET coureurs.
     * Retourne un objet contenant :
     *   - totalEtapes: nombre total d’étapes
     *   - etapesTerminees: nombre d’étapes terminées
     *   - etapes: array des étapes terminées { numero, pays, ville1, ville2, winner:{nom,equipe,temps} }
     *   - leadersActuels: { GC:{nom,equipe}|null, Points:..., Montagne:..., Jeune:... }
     *   - leaderEquipeActuel: { equipe }|null issu classement général équipe de la dernière étape
     *   - statsTeams: array de { equipe, victories, podiums, top5, top10, bestGeneralPos } trié
     *   - statsRiders: array de { nom, equipe, victories, podiums, top5, top10, generalPos } trié
     */
    async function computeCurrentTourStats() {
        const totalEtapes = ETAPES.length;
        const etapesTermineesList = [];

        // 3.1 Déterminer étapes terminées
        for (let item of ETAPES) {
            const numStr = String(item.numero).padStart(2, '0');
            const existe = await etapeTermineeExiste(numStr);
            if (existe) {
                const dataRes = await chargerResultatsEtape(numStr);
                if (dataRes) {
                    etapesTermineesList.push({ item, dataRes });
                }
            }
        }
        const etapesTerminees = etapesTermineesList.length;

        // 3.2 Accumulation brute des stats par équipe et par coureur
        const etapes = [];
        const teamMap  = new Map();  // equipe -> { victories, rawTop3, rawTop5, rawTop10 }
        const riderMap = new Map();  // nom -> { equipe, victories, rawTop3, rawTop5, rawTop10 }
        for (let { item, dataRes } of etapesTermineesList) {
    const num = item.numero;

    // --- Historique et comptage victoire ---
    if (TEAM_STAGES.includes(num)) {
        // Étape par équipes : on lit le classement équipe au lieu du classement temps
        const fileTeam = `data/classements/etape_${String(num).padStart(2,'0')}_equipe.json`;
        const teamList = await fetch(fileTeam)
                              .then(r => r.ok ? r.json() : [])
                              .catch(() => []);
        const winTeam = teamList.find(e => parseInt(e.position,10) === 1) || { equipe: '' };

        // Historique : on n’affiche que l’équipe
        etapes.push({
            numero: num,
            pays: item.pays,
            ville1: item.ville1,
            ville2: item.ville2 || '',
            winner: { nom: null, equipe: winTeam.equipe, temps: null }
        });

        // Stats équipes : +1 victoire à l’équipe gagnante
        if (winTeam.equipe) {
            if (!teamMap.has(winTeam.equipe)) {
                teamMap.set(winTeam.equipe, { victories: 0, rawTop3: 0, rawTop5: 0, rawTop10: 0 });
            }
            teamMap.get(winTeam.equipe).victories++;
        }
        // **On n’incrémente pas riderMap** pour cette étape.
    }
    else {
        // Étape classique individuelle
        const winnerEntry = dataRes.find(e => e.position === 1) || dataRes[0];
        const nomW    = winnerEntry.nom    || '';
        const equipeW = winnerEntry.equipe || '';
        const tempsW  = winnerEntry.temps  || '';
        const joueurW  = winnerEntry.joueur || '';   // ← on récupère le joueur

        etapes.push({
            numero: num,
            pays: item.pays,
            ville1: item.ville1,
            ville2: item.ville2 || '',
            winner: { nom: nomW, equipe: equipeW, temps: tempsW, joueur: joueurW}
        });

        // Parcours de chaque coureur pour stats individuelles et équipes
        for (let entry of dataRes) {
            const pos    = entry.position;
            const nom    = entry.nom    || '';
            const equipe = entry.equipe || '';

            // Initialisation
            if (!riderMap.has(nom)) {
                riderMap.set(nom, { equipe: equipe, victories: 0, rawTop3: 0, rawTop5: 0, rawTop10: 0 });
            }
            if (!teamMap.has(equipe)) {
                teamMap.set(equipe, { victories: 0, rawTop3: 0, rawTop5: 0, rawTop10: 0 });
            }
            const rStat = riderMap.get(nom);
            const tStat = teamMap.get(equipe);

            // Victoire / podium / top5 / top10
            if (pos === 1) {
                rStat.victories++;
                tStat.victories++;
            }
            if (pos >= 1 && pos <= 3) {
                rStat.rawTop3++;
                tStat.rawTop3++;
            }
            if (pos >= 1 && pos <= 5) {
                rStat.rawTop5++;
                tStat.rawTop5++;
            }
            if (pos >= 1 && pos <= 10) {
                rStat.rawTop10++;
                tStat.rawTop10++;
            }
        }
    }
}

        // 3.3 Récupérer leaders coureurs et équipe pour la dernière étape terminée
        let leadersActuels = { GC: null, Points: null, Montagne: null, Jeune: null };
        let leaderEquipeActuel = null;
        let generalClassementList = null; // pour tie-breaker
        if (etapesTermineesList.length > 0) {
            const lastItem = etapesTermineesList[etapesTermineesList.length - 1].item;
            const numStrLast = String(lastItem.numero).padStart(2, '0');
            const [gcL, ptsL, mntL, jnL, eqL, generalList] = await Promise.all([
                fetchGeneralLeaderObj(numStrLast, 'temps'),
                fetchGeneralLeaderObj(numStrLast, 'points'),
                fetchGeneralLeaderObj(numStrLast, 'montagne'),
                fetchGeneralLeaderObj(numStrLast, 'jeune'),
                fetchGeneralLeaderTeamObj(numStrLast),
                fetchGeneralClassementTemps(numStrLast)
            ]);
            leadersActuels.GC = gcL;
            leadersActuels.Points = ptsL;
            leadersActuels.Montagne = mntL;
            leadersActuels.Jeune = jnL;
            leaderEquipeActuel = eqL; // { equipe } or null
            generalClassementList = generalList; // array or null
        }

        // 3.4 Construire map de position générale pour coureurs: nom->position
        const riderGeneralPos = new Map();
        if (Array.isArray(generalClassementList)) {
            generalClassementList.forEach(entry => {
                if (entry.nom != null && entry.position != null) {
                    if (!riderGeneralPos.has(entry.nom)) {
                        riderGeneralPos.set(entry.nom, entry.position);
                    }
                }
            });
        }
        // 3.5 Construire map de position générale pour équipes: équipe -> meilleur position d’un coureur
        const teamGeneralPos = new Map();
        if (Array.isArray(generalClassementList)) {
            generalClassementList.forEach(entry => {
                const team = entry.equipe || '';
                const pos = entry.position;
                if (!team) return;
                if (!teamGeneralPos.has(team) || pos < teamGeneralPos.get(team)) {
                    teamGeneralPos.set(team, pos);
                }
            });
        }

        // 3.6 Calcul dérivé statsTeams et tri avec tie-breaker
        const statsTeams = [];
        for (let [equipe, stat] of teamMap.entries()) {
            const victories = stat.victories;
            const podiums = stat.rawTop3 - stat.victories;    // places 2-3
            const top5    = stat.rawTop5 - stat.rawTop3;      // places 4-5
            const top10   = stat.rawTop10 - stat.rawTop5;     // places 6-10
            const bestGeneralPos = teamGeneralPos.has(equipe) ? teamGeneralPos.get(equipe) : Infinity;
            statsTeams.push({ equipe, victories, podiums, top5, top10, bestGeneralPos });
        }
        // Tri : victoires desc, podiums desc, top5 desc, top10 desc, tie-breaker bestGeneralPos asc
        statsTeams.sort((a, b) => {
            if (b.victories !== a.victories) return b.victories - a.victories;
            if (b.podiums  !== a.podiums)  return b.podiums  - a.podiums;
            if (b.top5     !== a.top5)     return b.top5     - a.top5;
            if (b.top10    !== a.top10)    return b.top10    - a.top10;
            return (a.bestGeneralPos || Infinity) - (b.bestGeneralPos || Infinity);
        });

        // 3.7 Calcul dérivé statsRiders et tri avec tie-breaker
        const statsRiders = [];
        for (let [nom, stat] of riderMap.entries()) {
            if (stat.rawTop10 > 0) { // inclure seulement si au moins un top10
                const victories = stat.victories;
                const podiums = stat.rawTop3 - stat.victories;
                const top5    = stat.rawTop5 - stat.rawTop3;
                const top10   = stat.rawTop10 - stat.rawTop5;
                const generalPos = riderGeneralPos.has(nom) ? riderGeneralPos.get(nom) : Infinity;
                statsRiders.push({ nom, equipe: stat.equipe, victories, podiums, top5, top10, generalPos });
            }
        }
        // Tri : victoires desc, podiums desc, top5 desc, top10 desc, tie-breaker generalPos asc
        statsRiders.sort((a, b) => {
            if (b.victories !== a.victories) return b.victories - a.victories;
            if (b.podiums  !== a.podiums)  return b.podiums  - a.podiums;
            if (b.top5     !== a.top5)     return b.top5     - a.top5;
            if (b.top10    !== a.top10)    return b.top10    - a.top10;
            return (a.generalPos || Infinity) - (b.generalPos || Infinity);
        });
                    // … juste après le tri de statsRiders …

    // 3.9 Calcul du Hall of Fame (porteurs de maillots cumulés)
    // On commence par reconstruire la liste des leaders à chaque étape
    const stageLeaders = [];
    for (let { item } of etapesTermineesList) {
        const numStr = String(item.numero).padStart(2, '0');
        const [gc, pts, mnt, jn, eq] = await Promise.all([
            fetchGeneralLeaderObj(numStr, 'temps'),
            fetchGeneralLeaderObj(numStr, 'points'),
            fetchGeneralLeaderObj(numStr, 'montagne'),
            fetchGeneralLeaderObj(numStr, 'jeune'),
            fetchGeneralLeaderTeamObj(numStr)
        ]);
        stageLeaders.push({
            GC:    gc,    // { nom, equipe }
            Points: pts,
            Montagne: mnt,
            Jeune: jn,
            Equipe: eq   // { equipe }
        });
    }

    const hallLeaders = {};
    const categories = ['GC','Points','Montagne','Jeune','Equipe'];
    for (let cat of categories) {
        const stats = {}, keys = [];
        let prevKey = null;

        stageLeaders.forEach((leadObj, idx) => {
            const leader = leadObj[cat];
            if (!leader || (!leader.nom && !leader.equipe)) return;
            // pour Équipe, on n’a pas leader.nom, on l’appelle leader.equipe
            const name = cat==='Equipe' ? leader.equipe : leader.nom;
            const team = cat==='Equipe' ? leader.equipe : leader.equipe;
            if (!stats[name]) {
                stats[name] = { nom: name, equipe: team||'', jours:0, streakMax:0, currentStreak:0 };
                keys.push(name);
            }
            stats[name].jours++;
            if (prevKey===name) {
                stats[name].currentStreak++;
            } else {
                if (prevKey && stats[prevKey]) {
                    stats[prevKey].streakMax = Math.max(stats[prevKey].streakMax, stats[prevKey].currentStreak);
                }
                stats[name].currentStreak = 1;
            }
            prevKey = name;
        });
        // clôture de la dernière série
        if (prevKey && stats[prevKey]) {
            stats[prevKey].streakMax = Math.max(stats[prevKey].streakMax, stats[prevKey].currentStreak);
        }
        // tri et Top 3
        hallLeaders[cat] = keys
            .map(k => ({
                nom: stats[k].nom,
                equipe: stats[k].equipe,
                jours: stats[k].jours,
                consecutifs: stats[k].streakMax
            }))
            .sort((a,b) => b.jours - a.jours || b.consecutifs - a.consecutifs)
            .slice(0,3);
    }

    // 3.10 Retourner tout, ajouté hallLeaders
    return {
        totalEtapes,
        etapesTerminees,
        etapes,              // liste des étapes terminées, avec winner info
        leadersActuels,
        leaderEquipeActuel,
        statsTeams,
        statsRiders,
        hallLeaders         // <==== nouveau champ
    };
}


    /**
     * Affiche la vue Hall of Fame réorganisée dans #tabContent.
     * - Section Résumé du tour
     * - Section Équipes (cartes)
     * - Section Coureurs (tableau)
     * - Section Historique des victoires (tableau chronologique)
     * - Bouton Télécharger JSON Fame
     */
    async function renderHallOfFameCurrentTour() {
        container.innerHTML = '';
        const data = await computeCurrentTourStats();
        console.log("🔍 Exemple d'étape :", data.etapes?.[0]);


        // Conteneur principal Hall
        const hallDiv = document.createElement('div');
        hallDiv.classList.add('hall-container');


  

// --- Résumé du tour en 6 colonnes ---
const summaryDiv = document.createElement('div');
summaryDiv.classList.add('hall-summary');

// Démarrage HTML
let html = `<h2>Résumé du tour en cours</h2>`;
html += `<div class="hof-resume-grid">`;

// Colonne 1 : Infos générales + leaders actuels avec le maillot de l'équipe
html += `<div class="hof-col">
    <p><strong>Étapes terminées :</strong> ${data.etapesTerminees} / ${data.totalEtapes}</p>
    <ul style="list-style: none; padding-left:0; margin:0;">`;

function getTeamJerseyHTML(equipe) {
    const path = getJerseyPath(equipe);
    return path ? `<img src="${path}" class="team-maillot" alt="${equipe}">` : '';
}

if (data.leadersActuels.GC) {
    const l = data.leadersActuels.GC;
    html += `<li><strong>Leader GC :</strong> ${getTeamJerseyHTML(l.equipe)} ${l.nom || '-'}${l.equipe ? ', ' + l.equipe : ''}</li>`;
}
if (data.leadersActuels.Points) {
    const l = data.leadersActuels.Points;
    html += `<li><strong>Leader Points :</strong> ${getTeamJerseyHTML(l.equipe)} ${l.nom || '-'}${l.equipe ? ', ' + l.equipe : ''}</li>`;
}
if (data.leadersActuels.Montagne) {
    const l = data.leadersActuels.Montagne;
    html += `<li><strong>Leader Montagne :</strong> ${getTeamJerseyHTML(l.equipe)} ${l.nom || '-'}${l.equipe ? ', ' + l.equipe : ''}</li>`;
}
if (data.leadersActuels.Jeune) {
    const l = data.leadersActuels.Jeune;
    html += `<li><strong>Leader Jeune :</strong> ${getTeamJerseyHTML(l.equipe)} ${l.nom || '-'}${l.equipe ? ', ' + l.equipe : ''}</li>`;
}
if (data.leaderEquipeActuel && data.leaderEquipeActuel.equipe) {
    html += `<li><strong>Leader Équipe :</strong> ${getTeamJerseyHTML(data.leaderEquipeActuel.equipe)} ${data.leaderEquipeActuel.equipe}</li>`;
}
html += `</ul></div>`;

function buildJerseyCol(title, jerseyFilename, key) {
    let col = `<div class="hof-col">
        <img src="images/jerseys/${jerseyFilename}" class="jersey-img" alt="${title}">
        <h4>${title}</h4>`;
    const leaders = data.hallLeaders[key] || [];
    leaders.slice(0, 3).forEach(l => {
        const teamIcon = getJerseyPath(l.equipe);
        col += `<div class="leader-entry">
            ${teamIcon ? `<img src="${teamIcon}" class="team-icon" alt="${l.equipe}">` : ''}
            ${l.nom} — ${l.jours} jours (max ${l.consecutifs} jours d’affilés)
        </div>`;
    });
    col += `</div>`;
    return col;
}



// Colonnes 2 à 6
html += buildJerseyCol("Maillot Jaune", "leader_gc.png", "GC");
html += buildJerseyCol("Maillot Vert", "leader_points.png", "Points");
html += buildJerseyCol("Maillot à Pois", "leader_montagne.png", "Montagne");
html += buildJerseyCol("Maillot Blanc", "leader_jeune.png", "Jeune");
html += buildJerseyCol("Meilleure Équipe", "leader_equipe.png", "Equipe");


html += `</div>`; // fin de .hof-resume-grid

summaryDiv.innerHTML = html;
hallDiv.appendChild(summaryDiv);



        // --- 2) Section Équipes ---
        const teamsSection = document.createElement('div');
        teamsSection.classList.add('hall-section');
        // Titre de la section
        const titleTeams = document.createElement('h3');
        titleTeams.textContent = 'Classement des équipes';
        teamsSection.appendChild(titleTeams);

        // Container cartes équipes
        const cardsContainer = document.createElement('div');
        cardsContainer.classList.add('team-cards-container');
        data.statsTeams.forEach(teamStat => {
            const card = document.createElement('div');
            card.classList.add('team-card');
            // En-tête carte: maillot + nom
            const header = document.createElement('div');
            header.classList.add('team-card-header');
            const imgPath = getJerseyPath(teamStat.equipe);
            if (imgPath) {
                const img = document.createElement('img');
                img.src = imgPath;
                img.alt = `Maillot ${teamStat.equipe}`;
                img.classList.add('team-card-jersey');
                img.loading = 'lazy';
                header.appendChild(img);
            }
            const nameEl = document.createElement('span');
            nameEl.classList.add('team-card-name');
            nameEl.textContent = teamStat.equipe;
            header.appendChild(nameEl);
            card.appendChild(header);
            // Corps: Victoires, Podiums, Top5, Top10
            const body = document.createElement('div');
            body.classList.add('team-card-body');
            // Victoires
            const lineV = document.createElement('div');
            lineV.classList.add('team-card-line');
            lineV.innerHTML = `<span class="team-card-label">Victoires :</span> <span class="team-card-value">${teamStat.victories}</span>`;
            body.appendChild(lineV);
            // Podiums
            const lineP = document.createElement('div');
            lineP.classList.add('team-card-line');
            lineP.innerHTML = `<span class="team-card-label">Podiums :</span> <span class="team-card-value">${teamStat.podiums}</span>`;
            body.appendChild(lineP);
            // Top 5
            const line5 = document.createElement('div');
            line5.classList.add('team-card-line');
            line5.innerHTML = `<span class="team-card-label">Top 5 :</span> <span class="team-card-value">${teamStat.top5}</span>`;
            body.appendChild(line5);
            // Top 10
            const line10 = document.createElement('div');
            line10.classList.add('team-card-line');
            line10.innerHTML = `<span class="team-card-label">Top 10 :</span> <span class="team-card-value">${teamStat.top10}</span>`;
            body.appendChild(line10);

            card.appendChild(body);
            cardsContainer.appendChild(card);
        });
        teamsSection.appendChild(cardsContainer);
        hallDiv.appendChild(teamsSection);

        // --- 3) Section Coureurs ---
        const ridersSection = document.createElement('div');
        ridersSection.classList.add('hall-section');
        // Titre section
        const titleRiders = document.createElement('h3');
        titleRiders.textContent = 'Classement des coureurs';
        ridersSection.appendChild(titleRiders);

        // Tableaux coureurs
        const tableR = document.createElement('table');
        tableR.classList.add('hall-table');
        // Thead
        const theadR = document.createElement('thead');
        const trHR = document.createElement('tr');
        ['#', 'Nom', 'Équipe', 'Victoires', 'Podiums', 'Top 5', 'Top 10'].forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    // Optionnel : centrer la colonne "#"
    if (h === '#') th.style.width = '40px';
    trHR.appendChild(th);
});

        theadR.appendChild(trHR);
        tableR.appendChild(theadR);
        // Tbody
        const tbodyR = document.createElement('tbody');
        data.statsRiders.forEach((r,i) => {
            const tr = document.createElement('tr');
            // Colonne "#"
    const tdNum = document.createElement('td');
    tdNum.textContent = (i + 1).toString();
    tdNum.classList.add('row-number'); // facultatif pour styler
    tr.appendChild(tdNum);
            // Nom (avec icônes leaders si applicable)
            const tdN = document.createElement('td');
            const nameContainer = document.createElement('div');
            nameContainer.classList.add('name-cell');
            ['temps','points','montagne','jeune'].forEach(suffix => {
                const leaderObj = generalLeaders[suffix];
                if (leaderObj && leaderObj.nom === r.nom) {
                    const img = document.createElement('img');
                    img.src = CLASSIFY_JERSEY_PATHS[suffix];
                    let altTxt = '';
                    if (suffix === 'temps') altTxt = 'Leader GC';
                    else if (suffix === 'points') altTxt = 'Leader Points';
                    else if (suffix === 'montagne') altTxt = 'Leader Montagne';
                    else if (suffix === 'jeune') altTxt = 'Leader Jeune';
                    img.alt = altTxt;
                    img.classList.add('leader-classify-img');
                    img.loading = 'lazy';
                    nameContainer.appendChild(img);
                }
            });
            const spanName = document.createElement('span');
            spanName.textContent = r.nom;
            nameContainer.appendChild(spanName);
            tdN.appendChild(nameContainer);
            tr.appendChild(tdN);
            /// Équipe + maillot
const tdE = document.createElement('td');
const teamWrapper = document.createElement('div');
teamWrapper.classList.add('team-cell');

// Maillot devant le nom
const jerseyPath = getJerseyPath(r.equipe);
if (jerseyPath) {
  const img = document.createElement('img');
  img.src = jerseyPath;
  img.alt = `Maillot ${r.equipe}`;
  img.classList.add('maillot-img');
  img.loading = 'lazy';
  teamWrapper.appendChild(img);
}

// Nom de l'équipe
const spanTeam = document.createElement('span');
spanTeam.textContent = r.equipe || '-';
teamWrapper.appendChild(spanTeam);

tdE.appendChild(teamWrapper);
tr.appendChild(tdE);
            // Victoires
            const tdV = document.createElement('td');
            tdV.textContent = r.victories;
            tr.appendChild(tdV);
            // Podiums
            const tdP = document.createElement('td');
            tdP.textContent = r.podiums;
            tr.appendChild(tdP);
            // Top 5
            const td5 = document.createElement('td');
            td5.textContent = r.top5;
            tr.appendChild(td5);
            // Top 10
            const td10 = document.createElement('td');
            td10.textContent = r.top10;
            tr.appendChild(td10);

            tbodyR.appendChild(tr);
        });
        tableR.appendChild(tbodyR);
        ridersSection.appendChild(tableR);
        hallDiv.appendChild(ridersSection);

        // --- 4) Section Historique des victoires ---
        const historySection = document.createElement('div');
        historySection.classList.add('hall-section');
        // Titre section
        const titleHistory = document.createElement('h3');
        titleHistory.textContent = 'Historique des victoires';
        historySection.appendChild(titleHistory);

        // Table historique
        const tableH = document.createElement('table');
        tableH.classList.add('hall-table');
        // Thead
        const theadH = document.createElement('thead');
        const trHH = document.createElement('tr');
        ['Étape', 'Pays', 'Ville 1', 'Ville 2', 'Coureur', 'Équipe','Joueur', 'Temps'].forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            trHH.appendChild(th);
        });
        theadH.appendChild(trHH);
        tableH.appendChild(theadH);
        // Tbody
        const tbodyH = document.createElement('tbody');
        // Itérer data.etapes (déjà ordonné par numéro ascendant) pour chaque étape terminée
        data.etapes.forEach(ep => {
            const tr = document.createElement('tr');
            // Étape (numéro)
            const tdNum = document.createElement('td');
            tdNum.textContent = `Étape ${String(ep.numero).padStart(2, '0')}`;
            tr.appendChild(tdNum);
            // Pays
            const tdPays = document.createElement('td');
            tdPays.textContent = ep.pays || '-';
            tr.appendChild(tdPays);
            // Ville 1
            const tdV1 = document.createElement('td');
            tdV1.textContent = ep.ville1 || '-';
            tr.appendChild(tdV1);
            // Ville 2
            const tdV2 = document.createElement('td');
            tdV2.textContent = ep.ville2 || '-';
            tr.appendChild(tdV2);
            // Coureur gagnant
            const tdNom = document.createElement('td');
            tdNom.textContent = ep.winner?.nom || '-';
            tr.appendChild(tdNom);
            // Équipe gagnant + maillot
const tdEquipe = document.createElement('td');
const teamWrapper = document.createElement('div');
teamWrapper.classList.add('team-cell');

// Maillot
const jerseyPath = getJerseyPath(ep.winner?.equipe);
if (jerseyPath) {
  const img = document.createElement('img');
  img.src = jerseyPath;
  img.alt = `Maillot ${ep.winner.equipe}`;
  img.classList.add('maillot-img');
  img.loading = 'lazy';
  teamWrapper.appendChild(img);
}

// Nom de l'équipe
const spanTeam = document.createElement('span');
spanTeam.textContent = ep.winner?.equipe || '-';
teamWrapper.appendChild(spanTeam);

tdEquipe.appendChild(teamWrapper);
tr.appendChild(tdEquipe);
// === Nouvelle colonne Joueur ===
const tdJoueur = document.createElement('td');
tdJoueur.textContent = ep.winner?.joueur || '-';
tr.appendChild(tdJoueur);
            // Temps du gagnant
            const tdTemps = document.createElement('td');
            tdTemps.textContent = ep.winner?.temps || '-';
            tr.appendChild(tdTemps);

            tbodyH.appendChild(tr);
        });
        tableH.appendChild(tbodyH);
        historySection.appendChild(tableH);
        hallDiv.appendChild(historySection);

       // --- 5) Bouton Télécharger JSON Fame ---
const btnDownload = document.createElement('button');
btnDownload.textContent = 'Télécharger JSON Fame';
btnDownload.addEventListener('click', async () => {
    const TEAM_STAGES = [18, 25, 44];
    const suffixes   = ['temps', 'points', 'montagne', 'jeune', 'equipe'];

    // 1) Pour chaque étape, on récupère un top10 pour chaque suffixe
    const top10ParEtape = await Promise.all(data.etapes.map(async ep => {
        const numStr = String(ep.numero).padStart(2, '0');
        const entry  = { numero: ep.numero };

        await Promise.all(suffixes.map(async suffix => {
            //  Choix du fichier JSON
            let file;
            if (suffix === 'equipe' || (TEAM_STAGES.includes(ep.numero) && suffix === 'temps')) {
                // pour les étapes par équipes on force équipe.json
                file = `data/classements/etape_${numStr}_equipe.json`;
            } else {
                file = `data/classements/etape_${numStr}_${suffix}.json`;
            }
            try {
                const resp = await fetch(file);
                if (!resp.ok) throw new Error(`Status ${resp.status}`);
                const list = await resp.json();
                entry[`top10_${suffix}`] = Array.isArray(list) ? list.slice(0, 10) : [];
            } catch (e) {
                console.warn(`Impossible de charger ${suffix} pour étape ${ep.numero}`, e);
                entry[`top10_${suffix}`] = [];
            }
        }));

        return entry;
    }));

    // 2) Construction du JSON complet
    const obj = {
        tour: {
            totalEtapes:        data.totalEtapes,
            etapesTerminees:    data.etapesTerminees,
            etapes:             data.etapes,
            leadersActuels:     data.leadersActuels,
            leaderEquipeActuel: data.leaderEquipeActuel
        },
        statsTeams:   data.statsTeams.map(t => ({
            equipe:          t.equipe,
            victories:       t.victories,
            podiums:         t.podiums,
            top5:            t.top5,
            top10:           t.top10,
            bestGeneralPos:  t.bestGeneralPos
        })),
        statsRiders:  data.statsRiders.map(r => ({
            nom:        r.nom,
            equipe:     r.equipe,
            victories:  r.victories,
            podiums:    r.podiums,
            top5:       r.top5,
            top10:      r.top10,
            generalPos: r.generalPos
        })),
        historique:   data.etapes.map(ep => ({
            numero: ep.numero,
            pays:   ep.pays,
            ville1: ep.ville1,
            ville2: ep.ville2,
            winner: ep.winner
        })),
        top10ParEtape
    };

    // 3) Générer et déclencher le téléchargement
    const str  = JSON.stringify(obj, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'fame.json';
    a.click();
    URL.revokeObjectURL(url);
});
hallDiv.appendChild(btnDownload);


        // Insérer tout dans le conteneur principal
        container.appendChild(hallDiv);
    }

    // ========================================================================
    // 4. Fonction principale d’affichage Étape / Général / Hall
    // ========================================================================
    async function updateContent() {
        container.innerHTML = '';
        if (searchInput) searchInput.value = '';
        if (teamFilter) teamFilter.innerHTML = '<option value="">Toutes équipes</option>';

        if (viewType === 'hall') {
            if (etapeControl) etapeControl.style.display = 'none';
            if (tabsContainer) tabsContainer.style.display = 'none';
            if (maillotContainer) maillotContainer.innerHTML = '';
            const loadingDiv = document.createElement('div');
            loadingDiv.textContent = 'Chargement Hall of Fame...';
            container.appendChild(loadingDiv);
            await renderHallOfFameCurrentTour();
            return;
        } else {
            if (etapeControl) etapeControl.style.display = '';
            if (tabsContainer) tabsContainer.style.display = 'flex';
        }

        // --- 4.1 Récupérer leaders généraux pour icônes inline ---
        if (etapeSelect) {
            const curEtape = etapeSelect.value;
            generalLeaders = {
                temps: await fetchGeneralLeaderObj(curEtape, 'temps'),
                points: await fetchGeneralLeaderObj(curEtape, 'points'),
                montagne: await fetchGeneralLeaderObj(curEtape, 'montagne'),
                jeune: await fetchGeneralLeaderObj(curEtape, 'jeune')
            };
            console.log('[classements.js] generalLeaders pour étape', curEtape, generalLeaders);
        }
        // --- 4.2 Déterminer étape sélectionnée ---
        if (!etapeSelect) return;
        const val = etapeSelect.value;
        if (!val) console.warn('[classements.js] updateContent: etapeSelect.value est vide');
        const item = ETAPES.find(e => e.numero.toString().padStart(2, '0') === val);
        if (!item) {
            console.warn(`[classements.js] updateContent: Aucune étape dans ETAPES pour valeur "${val}"`);
            container.textContent = 'Étape non trouvée';
            if (maillotContainer) maillotContainer.innerHTML = '';
            return;
        }
        // --- 4.3 Onglet actif ---
        const activeTabBtn = document.querySelector('.tab-button.active');
        const activeTab = activeTabBtn ? activeTabBtn.dataset.tab : null;
        if (!activeTab) {
            console.warn('[classements.js] updateContent: Onglet non défini');
            container.textContent = 'Onglet non défini';
            if (maillotContainer) maillotContainer.innerHTML = '';
            return;
        }
        // --- 4.4 Titre ---
        let titleText;
        if (viewType === 'general') {
            titleText = `Classement général - Étape ${val}: ${item.pays} (${item.ville1}${item.ville2 ? ' – ' + item.ville2 : ''})`;
        } else {
            titleText = `Étape ${val} - Classement ${capitalize(activeTab)} (${item.pays}: ${item.ville1}${item.ville2 ? ' – ' + item.ville2 : ''})`;
        }
        const title = document.createElement('div');
        title.className = 'section-title';
        title.textContent = titleText;
        container.appendChild(title);

        // --- 4.5 En-têtes & suffixe JSON ---
        let headers = [], dataFileSuffix = '';
        if (activeTab === 'equipe') {
            headers = ['Position', 'Équipe', 'Temps', 'Joueur']; dataFileSuffix = 'equipe';
        } else if (activeTab === 'temps') {
            headers = ['Position', 'Nom', 'Équipe', 'Temps', 'Joueur']; dataFileSuffix = 'temps';
        } else if (activeTab === 'points') {
            headers = ['Position', 'Nom', 'Équipe', 'Points', 'Joueur']; dataFileSuffix = 'points';
        } else if (activeTab === 'montagne') {
            headers = ['Position', 'Nom', 'Équipe', 'Montagne', 'Joueur']; dataFileSuffix = 'montagne';
        } else if (activeTab === 'jeune') {
            headers = ['Position', 'Nom', 'Équipe', 'Temps', 'Joueur']; dataFileSuffix = 'jeune';
        } else {
            headers = ['Position', 'Nom', 'Équipe', capitalize(activeTab), 'Joueur']; dataFileSuffix = activeTab;
        }

        // --- 4.6 Création du tableau ---
        const table = document.createElement('table');
        // Colgroup pour largeurs
        const colgroup = document.createElement('colgroup');
        headers.forEach(hdr => {
            const col = document.createElement('col');
            const key = hdr.toLowerCase();
            if (key === 'position') col.style.width = '50px';
            else if (key === 'nom') col.style.width = '150px';
            else if (key === 'équipe' || key === 'equipe') col.style.width = '200px';
            else if (['temps','points','montagne','jeune'].includes(key)) col.style.width = '80px';
            else if (key === 'joueur') col.style.width = '150px';
            else col.style.width = '100px';
            colgroup.appendChild(col);
        });
        table.appendChild(colgroup);
        // Thead
        const thead = document.createElement('thead');
        const trH = document.createElement('tr');
        headers.forEach(t => {
            const th = document.createElement('th');
            th.textContent = t;
            trH.appendChild(th);
        });
        thead.appendChild(trH);
        table.appendChild(thead);
        // Tbody chargement
        const tbody = document.createElement('tbody');
        const trLoad = document.createElement('tr');
        const tdLoad = document.createElement('td');
        tdLoad.colSpan = headers.length;
        tdLoad.textContent = 'Chargement...';
        trLoad.appendChild(tdLoad);
        tbody.appendChild(trLoad);
        table.appendChild(tbody);
        container.appendChild(table);

        // --- 4.7 Construire URL JSON ---
        let fileName;
        if (viewType === 'general') {
            fileName = `data/classements/general_etape_${val}_${dataFileSuffix}.json`;
        } else {
            fileName = `data/classements/etape_${val}_${dataFileSuffix}.json`;
        }
        console.log('[classements.js] Récupération JSON depuis', fileName);
        // === 1) Charger le classement précédent pour calculer l’évolution ===
        let prevRankByName = {};
if (viewType === 'general') {
    const prevNum = String(parseInt(etapeSelect.value, 10) - 1).padStart(2, '0');
    // Choisir le bon fichier selon l’onglet actif : équipes ou coureurs
    let prevFile;
    if (activeTab === 'equipe') {
        prevFile = `data/classements/general_etape_${prevNum}_equipe.json`;
    } else {
        // pour 'temps', 'jeune', etc., on utilise le JSON coureurs
        prevFile = `data/classements/general_etape_${prevNum}_${dataFileSuffix}.json`;
        // Remarque : dataFileSuffix vaut 'temps' ou 'jeune' selon activeTab
    }
    try {
        const prevResp = await fetch(prevFile);
        if (prevResp.ok) {
            const prevList = await prevResp.json();
            prevList.forEach(e => {
                if (activeTab === 'equipe') {
                    // indexer par nom d’équipe
                    if (e.equipe) {
                        prevRankByName[e.equipe] = parseInt(e.position, 10);
                    }
                } else {
                    // indexer par nom de coureur
                    if (e.nom) {
                        prevRankByName[e.nom] = parseInt(e.position, 10);
                    }
                }
            });
        }
    } catch (e) {
        console.warn('Évolution: impossible de charger', prevFile, e);
    }
}

        // --- 4.8 Fetch et remplissage ---
        fetch(fileName)
            .then(resp => {
                if (!resp.ok) throw new Error(`Status ${resp.status}`);
                return resp.json();
            })
            .then(dataList => {
                console.log('Points JSON chargé pour', fileName, dataList);
                if (!Array.isArray(dataList)) {
                    console.error('[classements.js] JSON retourné n’est pas un tableau pour', fileName);
                    dataList = [];
                }
                // 1) Tri et filtrage spécifique pour les onglets Étape Points et Montagne
                if (viewType === 'etape' && activeTab === 'points') {
                    // exclure zéros et trier points décroissants
                    dataList = dataList.filter(e => parseInt(e.points, 10) > 0);
                    dataList.sort((a, b) => parseInt(b.points, 10) - parseInt(a.points, 10));
                } else if (viewType === 'etape' && activeTab === 'montagne') {
                    // exclure zéros et trier montagne décroissant
                    dataList = dataList.filter(e => parseInt(e.montagne, 10) > 0);
                    dataList.sort((a, b) => parseInt(b.montagne, 10) - parseInt(a.montagne, 10));
                } else {
                    // tri par position croissante par défaut
                    dataList.sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10));
                }

                
                // Filtre équipe
                const equipesUtilisees = Array.from(new Set(dataList.map(e => (e.equipe||'').trim()))).filter(s => s);
                if (teamFilter) {
                    teamFilter.innerHTML = '<option value="">Toutes équipes</option>';
                    equipesUtilisees.forEach(name => {
                        const opt = document.createElement('option');
                        opt.value = name; opt.textContent = name;
                        teamFilter.appendChild(opt);
                    });
                }
                
                
                
                // Références écart
               // let leaderTimeSec = NaN, leaderJeuneSec = NaN, leaderPoints = NaN, leaderMontagne = NaN;
                //if ((activeTab === 'temps' || activeTab === 'equipe' || activeTab === 'jeune') && dataList.length > 0) {
                //    leaderTimeSec = parseTimeToSeconds(dataList[0].temps);
                //}
                //if (activeTab === 'points' && dataList.length > 0) {
                 //   leaderPoints = parseInt(dataList[0].points, 10);
                //}
                //if (activeTab === 'montagne' && dataList.length > 0) {
                 //   leaderMontagne = parseInt(dataList[0].montagne, 10);
               // }
                // Vider tbody
                tbody.innerHTML = '';
                if (dataList.length === 0) {
                    const trE = document.createElement('tr');
                    const tdE = document.createElement('td');
                    tdE.colSpan = headers.length;
                    tdE.textContent = 'Aucun résultat disponible.';
                    trE.appendChild(tdE);
                    tbody.appendChild(trE);
                    if (maillotContainer) maillotContainer.innerHTML = '';
                    return;
                }
                // Parcours entrées
                dataList.forEach(entry => {
                    const tr = document.createElement('tr');
                    headers.forEach(hdr => {
                        const td = document.createElement('td');
                        let key = hdr.toLowerCase();
                        if (key === 'équipe') key = 'equipe';
                        if (key === 'position') key = 'position';
                        if (key === 'nom') key = 'nom';
                        if (key === 'temps') key = 'temps';
                        if (key === 'points') key = 'points';
                        if (key === 'montagne') key = 'montagne';
                        if (key === 'jeune') key = 'jeune';
                        if (key === 'joueur') key = 'joueur';
if (key === 'position') {
    // === Affichage du rang + flèche d’évolution uniquement pour le général ===
    td.textContent = entry.position;
    if (viewType === 'general') {
        const current = parseInt(entry.position, 10);
        // Choisir la clé selon l’onglet : équipe ou coureur
        let previous;
        if (activeTab === 'equipe') {
            previous = prevRankByName[entry.equipe] || Infinity;
        } else {
            previous = prevRankByName[entry.nom] || Infinity;
        }
        const delta = previous - current;
        let cls, char;
        if (delta > 0) { cls = 'evolution-up';   char = '▲'; }
        else if (delta < 0) { cls = 'evolution-down'; char = '▼'; }
        else                { cls = 'evolution-same'; char = '—'; }
        const span = document.createElement('span');
        span.classList.add(cls);
        span.textContent = char;
        td.appendChild(span);
        // nombre de places perdues/gagnées
        if (delta !== 0) {
            const spanNum = document.createElement('span');
            spanNum.classList.add(cls);
            spanNum.style.marginLeft = '2px';
            spanNum.textContent = Math.abs(delta);
            td.appendChild(spanNum);
        }
    }

                        } else if (key === 'temps' && (activeTab === 'temps' || activeTab === 'equipe' || activeTab === 'jeune')) {
                            // Affichage du temps total et de l’écart issu du JSON (entry.ecart)
                            const timeStr = entry.temps || '';
                            const ecartStr = entry.ecart || '';
                            const cellDiv = document.createElement('div');
                            cellDiv.classList.add('time-cell');

                            // Optionnel : si vous souhaitez afficher "Leader" pour position === 1, décommentez :
                            // const posNum = parseInt(entry.position, 10);
                            // if (!isNaN(posNum) && posNum === 1) {
                            //     const spanLeader = document.createElement('span');
                            //     spanLeader.classList.add('time-gap', 'leader-label');
                            //     spanLeader.textContent = 'Leader';
                            //     cellDiv.appendChild(spanLeader);
                            // }

                            if (ecartStr) {
                                const spanGap = document.createElement('span');
                                spanGap.classList.add('time-gap');
                                spanGap.textContent = ecartStr;
                                cellDiv.appendChild(spanGap);
                            }
                            if (timeStr) {
                                const spanTotal = document.createElement('span');
                                spanTotal.classList.add('time-total');
                                spanTotal.textContent = timeStr;
                                cellDiv.appendChild(spanTotal);
                            }
                            td.appendChild(cellDiv);
                        } else if (key === 'points') {
    // Afficher la valeur et l'écart tel que fourni dans le JSON
    const ptsRaw = entry.points;
    const pts = ptsRaw != null ? parseInt(ptsRaw, 10) : NaN;
    const ecartPts = entry.ecart || '';
    const divVal = document.createElement('div');
    divVal.classList.add('value-cell');
    const spanMain = document.createElement('span');
    spanMain.classList.add('value-main');
    spanMain.textContent = (!isNaN(pts) ? pts : (ptsRaw || '-'));
    divVal.appendChild(spanMain);
    if (ecartPts) {
        const spanGap = document.createElement('span');
        spanGap.classList.add('value-gap');
        spanGap.textContent = ecartPts;
        divVal.appendChild(spanGap);
    }
    td.appendChild(divVal);
} else if (key === 'montagne') {
    // Affichage de la valeur "montagne" et de l'écart tel que fourni dans JSON
    const mgRaw = entry.montagne;
    const mg = mgRaw != null ? parseInt(mgRaw, 10) : NaN;
    const ecartM = entry.ecart || ''; // champ "ecart" dans le JSON pour montagne, ex. "Leader Montagne" ou "+5"
    const divVal = document.createElement('div');
    divVal.classList.add('value-cell');
    // Valeur principale
    const spanMain = document.createElement('span');
    spanMain.classList.add('value-main');
    spanMain.textContent = (!isNaN(mg) ? mg : (mgRaw || '-'));
    divVal.appendChild(spanMain);
    // Afficher l'écart si présent
    if (ecartM) {
        const spanGap = document.createElement('span');
        spanGap.classList.add('value-gap');
        spanGap.textContent = ecartM;
        divVal.appendChild(spanGap);
    }
    td.appendChild(divVal);
}
 else if (key === 'equipe') {
                            // Équipe avec maillot
                            const raw = entry.equipe || '';
                            const wrapper = document.createElement('div');
                            wrapper.classList.add('team-cell');
                            const imgPath = getJerseyPath(raw.trim());
                            if (imgPath) {
                                const img = document.createElement('img');
                                img.src = imgPath;
                                img.alt = `Maillot ${raw.trim()}`;
                                img.classList.add('maillot-img');
                                img.loading = 'lazy';
                                wrapper.appendChild(img);
                            }
                            const span = document.createElement('span');
                            span.textContent = raw || '-';
                            wrapper.appendChild(span);
                            td.appendChild(wrapper);
                        } else if (key === 'nom') {
                            // Nom avec icônes leaders
                            const raw = entry.nom || '';
                            const nameContainer = document.createElement('div');
                            nameContainer.classList.add('name-cell');
                            ['temps','points','montagne','jeune'].forEach(suffix => {
                                const leaderObj = generalLeaders[suffix];
                                if (leaderObj && leaderObj.nom === raw) {
                                    const img = document.createElement('img');
                                    img.src = CLASSIFY_JERSEY_PATHS[suffix];
                                    img.alt = suffix === 'temps' ? 'Leader GC' : suffix === 'points' ? 'Leader Points' : suffix === 'montagne' ? 'Leader Montagne' : 'Leader Jeune';
                                    img.classList.add('leader-classify-img');
                                    img.loading = 'lazy';
                                    nameContainer.appendChild(img);
                                }
                            });
                            const spanName = document.createElement('span');
                            spanName.textContent = raw || '-';
                            nameContainer.appendChild(spanName);
                            td.appendChild(nameContainer);
                        } else {
                            // Colonnes simples
                            const val = entry[key];
                            td.textContent = val != null ? val : '-';
                        }
                        tr.appendChild(td);
                    });
                    tbody.appendChild(tr);
                });
                // Afficher maillot de l’équipe leader de la vue
                const first = dataList[0];
                if (first && first.equipe) {
                    afficherMaillotEquipe(first.equipe);
                } else {
                    if (maillotContainer) maillotContainer.innerHTML = '';
                }
                applyFilters();
            })
            .catch(err => {
                console.error('[classements.js] Erreur fetch/parsing JSON :', err);
                tbody.innerHTML = '';
                const trErr = document.createElement('tr');
                const tdErr = document.createElement('td');
                tdErr.colSpan = headers.length;
                tdErr.textContent = 'Erreur de chargement des données.';
                trErr.appendChild(tdErr);
                tbody.appendChild(trErr);
                if (maillotContainer) maillotContainer.innerHTML = '';
            });
    }

    // ========================================================================
    // 5. Listeners
    // ========================================================================
    if (searchInput) {
        searchInput.addEventListener('input', () => applyFilters());
    }
    if (teamFilter) {
        teamFilter.addEventListener('change', () => applyFilters());
    }
    const leaderFilter = document.getElementById('leaderFilter');
if (leaderFilter) {
    leaderFilter.addEventListener('change', () => applyFilters());
}

    if (btnEtape) {
        btnEtape.addEventListener('click', () => {
            if (viewType !== 'etape') {
                viewType = 'etape';
                btnEtape.classList.add('active');
                btnGeneral.classList.remove('active');
                if (btnHall) btnHall.classList.remove('active');
                updateContent();
            }
        });
    }
    if (btnGeneral) {
        btnGeneral.addEventListener('click', () => {
            if (viewType !== 'general') {
                viewType = 'general';
                btnGeneral.classList.add('active');
                btnEtape.classList.remove('active');
                if (btnHall) btnHall.classList.remove('active');
                updateContent();
            }
        });
    }
    if (btnHall) {
        btnHall.addEventListener('click', () => {
            if (viewType !== 'hall') {
                viewType = 'hall';
                btnHall.classList.add('active');
                btnEtape.classList.remove('active');
                btnGeneral.classList.remove('active');
                updateContent();
            }
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (!etapeSelect) return;
            const val = etapeSelect.value;
            const idx = ETAPES.findIndex(item => item.numero.toString().padStart(2, '0') === val);
            const newIdx = idx > 0 ? idx - 1 : ETAPES.length - 1;
            etapeSelect.value = ETAPES[newIdx].numero.toString().padStart(2, '0');
            updateContent();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (!etapeSelect) return;
            const val = etapeSelect.value;
            const idx = ETAPES.findIndex(item => item.numero.toString().padStart(2, '0') === val);
            const newIdx = (idx >= 0 && idx < ETAPES.length - 1) ? idx + 1 : 0;
            etapeSelect.value = ETAPES[newIdx].numero.toString().padStart(2, '0');
            updateContent();
        });
    }
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const cur = document.querySelector('.tab-button.active');
            if (cur) cur.classList.remove('active');
            btn.classList.add('active');
            updateContent();
        });
    });
    if (etapeSelect) {
        etapeSelect.addEventListener('change', () => updateContent());
    }

    // ========================================================================
    // 6. Initialisation: remplir etapeSelect puis afficher
    // ========================================================================
    (async () => {
        await selectLatestEtape();
        updateContent();
    })();

    /** Sélectionne la dernière étape ayant JSON disponible, et remplit le <select> */
    async function selectLatestEtape() {
        if (!etapeSelect) return null;
        // Remplir options
        populateSelect();
        // Tester existence JSON
        for (let idx = ETAPES.length - 1; idx >= 0; idx--) {
            const numero = ETAPES[idx].numero;
            const numStr = numero.toString().padStart(2, '0');
            const fileName = `data/classements/etape_${numStr}_temps.json`;
            try {
                let resp = await fetch(fileName, { method: 'HEAD' });
                if (!resp.ok) resp = await fetch(fileName, { method: 'GET' });
                if (resp.ok) {
                    etapeSelect.value = numStr;
                    console.log(`[classements.js] selectLatestEtape: étape trouvée ${numStr}`);
                    return numStr;
                }
            } catch (err) {
                console.warn('[classements.js] selectLatestEtape erreur fetch HEAD/GET:', err);
            }
        }
        // Aucune trouvée
        if (etapeSelect.options.length > 0) {
            console.log('[classements.js] selectLatestEtape: aucune étape JSON trouvée, sélection de la première option');
            etapeSelect.value = etapeSelect.options[0].value;
            return etapeSelect.value;
        }
        console.warn('[classements.js] selectLatestEtape: pas d’options dans etapeSelect');
        return null;
    }
    /** Remplit etapeSelect à partir de ETAPES */
    function populateSelect() {
        if (!etapeSelect) return;
        etapeSelect.innerHTML = '';
        if (!Array.isArray(ETAPES) || ETAPES.length === 0) {
            console.warn('[classements.js] populateSelect: ETAPES vide, rien à remplir.');
            return;
        }
        ETAPES.forEach(item => {
            const opt = document.createElement('option');
            const numStr = item.numero.toString().padStart(2, '0');
            opt.value = numStr;
            let label = `Étape ${numStr}: ${item.pays} (${item.ville1}`;
            if (item.ville2) label += ` – ${item.ville2}`;
            label += ')';
            opt.textContent = label;
            etapeSelect.appendChild(opt);
        });
        console.log(`[classements.js] populateSelect: ajouté ${ETAPES.length} options dans #etapeSelect`);
    }

}); // fin DOMContentLoaded