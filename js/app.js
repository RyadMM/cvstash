// Main app initialization and orchestration

import * as storage from './storage.js';
import { loadI18n, setLang, updateLanguageUI, updateLanguageButtons, t, getLang } from './i18n.js';
import { initEditor, loadContent, getContent } from './editor.js';
import { updatePreview, checkContentLength, setScaleMode } from './preview.js';
import { downloadPDF } from './pdf.js';
import { initOnboarding, showHelpModal, showWizard } from './onboarding.js';
import { escapeHtml, showRenameModal, closeMobileMenu, toggleMobileMenu, toggleSidebar as uiToggleSidebar, initSidebar as uiInitSidebar, showBatchDeleteModal, hideBatchDeleteModal, showProgressOverlay, hideProgressOverlay, updateProgress, getDeleteCallback } from './ui.js';
import * as sidebar from './sidebar.js';
import { toggleSelectionMode, toggleCVSelection, selectAll, batchDownloadMD, batchDownloadPDF, batchDelete, clearSelection, getSelectedCVs } from './selection.js';
import { initSwipeGesture, destroySwipeGesture, initPanelSwipe } from './swipe.js';
import { initTheme, setTheme, applyCVColor } from './theme.js';
import { executeCommand, undo, redo } from './history.js';
import { RenameCommand, EditCommand } from './commands.js';
import { showToast } from './toast.js';
import { BREAKPOINT_MOBILE, CHAR_LIMIT, EDIT_TRACK_DEBOUNCE_MS, LETTER_WIDTH_PX } from './constants.js';

let renamingCVId = null;
let zoomLevel = 1.0;
let sampleIndex = 0;

// Edit tracking for undo
let editTimeout = null;
let lastEditContent = '';
let lastEditCVId = null;

const sampleCVs = {
    en: [
        // Sample 1: Bakery
        `# Jane "Caramel" Donut

Sugarville, Glazed Kingdom
+1 555-BE-TTER · jane.donut@bakerydreams.com

## Summary

Passionate and detail-oriented pastry enthusiast. Experience in sweet case management, recipe documentation, and hungry customer service. Autonomy, organizational skills, quality glaze verification, and adherence to baking procedures.

## Key Skills

- Rigor in temperatures, attention to detail, and chocolate consistency
- Autonomy, utensil organization, and respect for proofing times
- Order management, flour deliveries, and sweet priorities
- Recipe documentation and clear baking instructions
- Customer service (email / phone / in person / with samples)
- Comfort with digital tools (connected scale, recipe apps)

## Experience

### Cupcake Solutions Coordinator — Sweet Dreams Bakery (Sugarville)
*March 2024 — Present*

- Handles client requests via email and phone with courteous and delicious service.
- Ensures order follow-up, performs follow-up calls, and documents necessary icing information.
- Verifies frosting designs and validates compliance with client requirements (colors, flavors, edible typography, etc.) before final delivery.
- Plans seasonal themes and coordinates relevant pastry teams in advance.
- Processes approximately **10 to 15 orders per day** and prioritizes based on freshness urgency and deadlines.

### Pastry Chef — The Enchanted Bakery
*September 2016 — January 2020*

- Prepares stations and instruments according to cleanliness protocols and established procedures.
- Anticipates unexpected issues (rush periods, last-minute orders) and adapts quickly to ensure smooth production progression.
- Performs verifications and follow-ups related to recipes (temperatures, baking times) with scientific rigor.
- Schedules tasting appointments, documents relevant information, and performs post-delivery follow-ups.

### Pastry Apprentice — The Magic Oven
*March 2008 — September 2016*

- Prepares ingredients for daily recipes and assists during mass productions.
- Sterilizes and maintains instruments and equipment according to hygiene standards.

## Education

- Technical Training — Advanced French Pastry (Cordon Bleu School), 2019
- D.E.P. Pastry, 2008

## Languages

- French (native) · English (intermediate) · Language of Croissants (fluent)
`,

        // Sample 2: Space
        `# Captain "Stardust" Nova

Mars Colony Alpha, Sector 7
+1 555-SPA-CED · stardust@cosmicvoyages.net

## Summary

Bold explorer of the cosmic frontier with 5 years of experience in interplanetary logistics and zero-gravity hospitality. Passionate about making the galaxy feel smaller, one light-year at a time. Excellent at troubleshooting communication satellites while drinking zero-G coffee.

## Key Skills

- Zero-gravity customer service with a smile
- Interstellar route optimization and fuel efficiency
- Diplomatic relations with 47 different alien species
- Crisis management during solar flare events
- Fluency in 12 galactic languages including Binary and Morse
- Advanced repair of quantum propulsion systems

## Experience

### Hospitality Officer — Galactic Cruises (Orbiting Earth)
*June 2022 — Present*

- Manage passenger comfort for 2,000+ travelers across the solar system
- Coordinate with space station operations for smooth docking procedures
- Handle emergency situations with calm and professionalism
- Maintain 98% customer satisfaction rating in post-flight surveys

### Cargo Logistics Specialist — Mars Supply Chain
*January 2019 — May 2022*

- Oversaw transportation of essential supplies from Earth to Mars colony
- Reduced delivery time by 15% through optimized flight trajectories
- Managed inventory of oxygen, food, and water supplies for 500+ colonists
- Trained new recruits on zero-G cargo handling procedures

## Education

- Bachelor's in Interstellar Business — Mars University, 2018
- Certified Space Traffic Controller — Galactic Federation, 2017

## Languages

- Earth English (native) · Martian Creole (conversational) · Robot-Speak (fluent)
`,

        // Sample 3: Gaming
        `# Alex "Pixel" Chen

Level 99, San Francisco
+1 555-GA-MING · alex@pixelstudios.io

## Summary

Full-stack game developer with 7 years of experience creating immersive gaming experiences. Passionate about pixel art, procedurally generated worlds, and writing code that doesn't break. Known for turning coffee into code and bugs into features.

## Key Skills

- Game development with Unity and Unreal Engine 5
- Procedural generation and AI behavior trees
- Multiplayer networking and server optimization
- Pixel art and 2D animation
- Community management and Discord moderation
- Writing bug reports that sound like feature requests

## Experience

### Lead Game Developer — Indie Studio (Remote)
*March 2021 — Present*

- Led development of "Cosmic Harvest", a farming sim with 500K+ downloads
- Managed team of 5 developers across 3 time zones
- Implemented daily challenges and seasonal events
- Respond to community feedback and balance game mechanics

### Junior Developer — AAA Games Studio
*June 2018 — February 2021*

- Contributed to "Fantasy Quest XII", which sold 3 million copies
- Worked on UI/UX design and inventory systems
- Fixed memory leaks and optimized loading times by 40%

## Education

- B.S. Computer Science (Game Design) — UC Berkeley, 2018
- Certificate in 3D Modeling — Art Institute, 2017

## Languages

- C++, C#, JavaScript, Python, SQL, Lua
- English (native) · Japanese (basic) · Klingon (for roleplay events)
`,

        // Sample 4: Cat Cafe
        `# Luna "Whiskers" Martinez

Purrfect Cafe, Meow District
+1 555-CAT-SPA · luna@whiskersandbeans.com

## Summary

Dedicated cat cafe manager with 4 years of experience in feline hospitality and human-cat mediation. Expert at interpreting meow frequencies, tail positions, and purr volumes. Passionate about creating the perfect environment where cats can thrive and humans can receive unconditional love.

## Key Skills

- Feline behavior interpretation and translation
- Cat nap optimization and comfort zone arrangement
- Grooming techniques for 47 different breeds
- Organic catnip sourcing and treat preparation
- Laser pointer operation and toy maintenance
- Human-to-cat diplomacy and conflict resolution

## Experience

### Head Cat Wrangler — Purrfect Cafe
*June 2020 — Present*

- Manage daily care of 18 resident cats and coordinate 30+ foster placements
- Train new staff on proper cat handling and treat distribution protocols
- Organize monthly adoption events that found homes for 200+ cats
- Maintain 5-star rating on "CatTourist" review platform

### Pet Sitter — Self-Employed
*January 2018 — May 2020*

- Provided in-home care for 50+ pets including cats, dogs, and one very confused hamster
- Administered medications, maintained feeding schedules, and provided daily updates to owners
- Built reputation for reliability through detailed photo updates and communication

## Education

- Certified Feline Training Specialist — Cat Academy Online, 2019
- Workshop: "Understanding the Slow Blink" — Feline Psychology Institute, 2018

## Languages

- English (native) · Cat (fluent) · Dog (conversational)
`,

        // Sample 5: Detective
        `# Sam "Clue" Hunter

Noir City, Shadows District
+1 555-MYS-TERY · sam@sleuthagency.com

## Summary

Gritty private investigator with a knack for finding lost things and people who don't want to be found. 12 years of experience solving cases that range from missing heirlooms to uncovering corporate espionage. Always gets their person, eventually. Has a complicated relationship with doors.

## Key Skills

- Surveillance and stakeout operations (can wait 48 hours without bathroom break)
- Interrogation and suspect interviewing
- Forensic photography and evidence collection
- Undercover disguise and voice modulation
- Database searching and background investigation
- Coffee brewing in a office setting

## Experience

### Private Investigator — Hunter Detective Agency
*March 2016 — Present*

- Solved 200+ cases including missing persons, corporate fraud, and finding lost keys
- Built network of informants across the city
- Maintained 85% case closure rate
- Regularly consulted by local law enforcement on difficult cases

### Police Detective — Noir City Police Department
*January 2012 — February 2016*

- Investigated homicides, robberies, and suspicious activities
- Collaborated with district attorneys on case prosecution
- Received commendation for bravery during stakeout operation

## Education

- Criminal Justice Certificate — City College, 2011
- Private Investigator License — State Board, 2012

## Languages

- English (native) · Sarcasm (fluent) · Legalese (conversational)
`
    ],
    fr: [
        // French Sample 1: Boulangerie
        `# Jean "Caramel" Dupont

Sucrerie, Royaume Glacé
+1 555-BE-TTER · jean.dupont@boulangeriedevs.com

## Résumé

Boulanger passionné et attentif aux détails. Expérience en gestion de sucrerie, documentation de recettes, et service client gourmand. Autonomie, compétences organisationnelles, vérification de la qualité du glaçage, et respect des procédures de fabrication.

## Compétences Clés

- Rigueur dans les températures, souci du détail, et constance du chocolat
- Autonomie, organisation des ustensiles, et respect des temps de pousse
- Gestion des commandes, livraisons de farine, et priorités sucrées
- Documentation de recettes et instructions de pâtisserie claires
- Service client (email / téléphone / en personne / avec échantillons)
- Confort avec les outils numériques (balance connectée, applications de recettes)

## Expérience

### Coordinateur Solutions Cupcakes — Boulangerie des Rêves (Sucrerie)
*Mars 2024 — Présent*

- Gère les demandes des clients par email et téléphone avec un service courtois et délicieux.
- Assure le suivi des commandes, effectue des appels de suivi et documente les informations de glaçage nécessaires.
- Vérifie les designs de glaçage et valide la conformité avec les exigences des clients.
- Planifie des saisons thématiques et coordonne les équipes de pâtisserie pertinentes à l'avance.
- Traite environ **10 à 15 commandes par jour** et priorise en fonction de l'urgence de fraîcheur.

### Chef Pâtissier — La Boulangerie Enchantée
*Septembre 2016 — Janvier 2020*

- Prépare les stations et les instruments selon les protocoles de propreté et les procédures établies.
- Anticipe les problèmes inattendus (périodes de pointe, commandes de dernière minute) et s'adapte rapidement pour assurer une progression fluide de la production.
- Effectue des vérifications et des suivis liés aux recettes (températures, temps de cuisson) avec rigueur scientifique.
- Planifie des rendez-vous de dégustation, documente les informations pertinentes et effectue des suivis après livraison.

### Apprenti Pâtissier — Le Four Magique
*Mars 2008 — Septembre 2016*

- Prépare les ingrédients pour les recettes quotidiennes et assiste lors des productions de masse.
- Stérilise et maintient les instruments et l'équipement conformément aux normes d'hygiène.

## Formation

- Formation Technique — Pâtisserie Française Avancée (École Cordon Bleu), 2019
- D.E.P. Pâtisserie, 2008

## Langues

- Français (natif) · Anglais (intermédiaire) · Langue des Croissants (courant)
`,

        // French Sample 2: Espace
        `# Capitaine "Stardust" Nova

Colonie Mars Alpha, Secteur 7
+1 555-SPA-CED · stardust@voyagescosmiques.net

## Résumé

Explorateur audacieux de la frontière cosmique avec 5 ans d'expérience en logistique interplanétaire et hospitalité en apesanteur. Passionné par rendre la galaxie plus petite, une année-lumière à la fois. Excellent pour dépanner les satellites de communication tout en buvant du café en apesanteur.

## Compétences Clés

- Service client en apesanteur avec le sourire
- Optimisation des trajectoires interstellaires et efficacité énergétique
- Relations diplomatiques avec 47 espèces extraterrestres différentes
- Gestion de crise pendant les éruptions solaires
- Courance en 12 langues galactiques incluant le binaire et le morse
- Réparation avancée des systèmes de propulsion quantique

## Expérience

### Officier d'Hospitalité — Croisières Galactiques (Orbite Terrestre)
*Juin 2022 — Présent*

- Gère le confort des passagers pour 2000+ voyageurs à travers le système solaire
- Coordonne avec les opérations de la station spatiale pour des procédures d'amarrage fluides
- Gère les situations d'urgence avec calme et professionnalisme
- Maintient un taux de satisfaction client de 98% dans les sondages post-vol

### Spécialiste Logistique Cargo — Chaîne d'Approvisionnement Mars
*Janvier 2019 — Mai 2022*

- A supervisé le transport de fournitures essentielles de la Terre vers la colonie martienne
- Réduit le temps de livraison de 15% grâce à des trajectoires de vol optimisées
- Géré l'inventaire en oxygène, nourriture et eau pour 500+ colons
- Formé des nouveaux recrues sur les procédures de manutention de cargo en apesanteur

## Formation

- Licence en Commerce Interstellaire — Université de Mars, 2018
- Contrôleur de Trafic Spatial Certifié — Fédération Galactique, 2017

## Langues

- Anglais Terrien (natif) — Créole Martien (conversationnel) — Robot-Speak (courant)
`,

        // French Sample 3: Gaming
        `# Alex "Pixel" Chen

Niveau 99, San Francisco
+1 555-GA-MING · alex@pixelstudios.io

## Résumé

Développeur de jeux full-stack avec 7 ans d'expérience créant des expériences de jeu immersives. Passionné par le pixel art, les mondes générés procéduralement, et l'écriture de code qui ne plante pas. Réputé pour transformer le café en code et les bugs en fonctionnalités.

## Compétences Clés

- Développement de jeux avec Unity et Unreal Engine 5
- Génération procédurale et arbres de comportement IA
- Mise en réseau multijoueur et optimisation de serveur
- Pixel art et animation 2D
- Gestion de communauté et modération Discord
- Rédaction de rapports de bugs qui sonnent comme des demandes de fonctionnalités

## Expérience

### Développeur de Jeux Principal — Studio Indie (Télétravail)
*Mars 2021 — Présent*

- Dirigé le développement de "Cosmic Harvest", un simulateur de ferme avec 500K+ téléchargements
- Géré une équipe de 5 développeurs sur 3 fuseaux horaires
- Implémenté des défis quotidiens et des événements saisonniers
- Répondu aux retours de la communauté et équilibré les mécaniques de jeu

### Développeur Junior — Studio AAA Games
*Juin 2018 — Février 2021*

- Contribué à "Fantasy Quest XII", qui s'est vendu à 3 millions d'exemplaires
- Travail sur l'interface utilisateur et les systèmes d'inventaire
- Corrigé les fuites de mémoire et optimisé les temps de chargement de 40%

## Formation

- Licence en Informatique (Design de Jeux) — UC Berkeley, 2018
- Certificat en Modélisation 3D — Institut d'Art, 2017

## Langues

- C++, C#, JavaScript, Python, SQL, Lua
- Anglais (natif) — Japonais (bases) — Klingon (pour les événements de jeu de rôle)
`,

        // French Sample 4: Café Chats
        `# Luna "Mustache" Martinez

Café Parfait, Quartier des Miaulements
+1 555-CAT-SPA · luna@mustachesetbiscottes.com

## Résumé

Gérant de café à chats dévoué avec 4 ans d'expérience en hospitalité féline et médiation humain-chat. Expert en interprétation des fréquences de miaulement, des positions de queue, et des volumes de ronronnement. Passionné par créer l'environnement parfait où les chats peuvent s'épanouir et les humains peuvent recevoir de l'amour inconditionnel.

## Compétences Clés

- Interprétation du comportement félin et traduction
- Optimisation des siestes et arrangement des zones de confort
- Techniques de toilettage pour 47 races différentes
- Approvisionnement en herbe à chat et préparation de friandises
- Manipulation de pointeur laser et maintenance de jouets
- Diplomatie humain-chat et résolution de conflits

## Expérience

### Responsable de Zone des Chats — Café Parfait
*Juin 2020 — Présent*

- Gère les soins quotidiens de 18 chats résidents et coordonne 30+ placements en famille d'accueil
- Forme le nouveau personnel sur la manipulation appropriée des chats et les protocoles de distribution de friandises
- Organise des événements d'adoption mensuels qui ont trouvé des maisons pour 200+ chats
- Maintient une note de 5 étoiles sur la plateforme d'avis "ChatTouriste"

### Gardien d'animaux — Indépendant
*Janvier 2018 — Mai 2020*

- A fourni des soins à domicile pour 50+ animaux incluant chats, chiens, et un hamster très confus
- Administré des médicaments, maintenu des programmes d'alimentation, et fourni des mises à jour quotidiennes aux propriétaires
- Construit une réputation de fiabilité grâce à des mises à jour photo détaillées et une communication constante

## Formation

- Spécialiste en Dressage Félin Certifié — Académie des Chats en Ligne, 2019
- Atelier: "Comprendre le Clignement Lent" — Institut de Psychologie Féline, 2018

## Langues

- Anglais (natif) — Chat (courant) — Chien (conversationnel)
`,

        // French Sample 5: Détective
        `# Sam "Indice" Hunter

Ville Noire, Quartier des Ombres
+1 555-MYS-TERY · sam@agencededetection.com

## Résumé

Enquêteur privé tenace avec un don pour trouver les choses perdues et les personnes qui ne veulent pas être trouvées. 12 ans d'expérience à résoudre des cas allant des héritages perdus à l'espionnage industrielle. Trouve toujours la personne, éventuellement. Relation compliquée avec les portes.

## Compétences Clés

- Surveillance et opérations de filature (peut attendre 48 heures sans pause toilette)
- Interrogatoire et entrevue de suspects
- Photographie médico-légale et collecte de preuves
- Déguisement et modulation vocale
- Recherche dans les bases de données et investigation d'antécédents
- Préparation de café dans un environnement de bureau

## Expérience

### Enquêteur Privé — Agence de Détection Hunter
*Mars 2016 — Présent*

- Résolu 200+ cas incluant des personnes disparues, fraudes corporatives, et clés perdues
- Construit un réseau d'informateurs à travers la ville
- Maintenu un taux de résolution de 85% des cas
- Régulièrement consulté par les forces de l'ordre locales sur les affaires difficiles

### Détective de Police — Département de Police de Ville Noire
*Janvier 2012 — Février 2016*

- Enquêté sur des homicides, vols, et activités suspectes
- Collaboré avec les procureurs sur la poursuite des cas
- Reçu une mention pour bravoure pendant une opération de filature

## Formation

- Certificat en Justice Criminelle — Collège de la Ville, 2011
- Licence d'Enquêteur Privé — Conseil d'État, 2012

## Langues

- Anglais (natif) — Sarcaste (courant) — Juridique (conversationnel)
`
    ]
};

// Use existing sample templates for new CV creation
const templateCV = `# Jane "Caramel" Donut

Sugarville, Glazed Kingdom
+1 555-BE-TTER · jane.donut@bakerydreams.com

## Summary

Passionate and detail-oriented pastry enthusiast. Experience in sweet case management, recipe documentation, and hungry customer service. Autonomy, organizational skills, quality glaze verification, and adherence to baking procedures.

## Key Skills

- Rigor in temperatures, attention to detail, and chocolate consistency
- Autonomy, utensil organization, and respect for proofing times
- Order management, flour deliveries, and sweet priorities
- Recipe documentation and clear baking instructions
- Customer service (email / phone / in person / with samples)
- Comfort with digital tools (connected scale, recipe apps)

## Experience

### Cupcake Solutions Coordinator — Sweet Dreams Bakery (Sugarville)
*March 2024 — Present*

- Handles client requests via email and phone with courteous and delicious service.
- Ensures order follow-up, performs follow-up calls, and documents necessary icing information.
- Verifies frosting designs and validates compliance with client requirements (colors, flavors, edible typography, etc.) before final delivery.
- Plans seasonal themes and coordinates relevant pastry teams in advance.
- Processes approximately **10 to 15 orders per day** and prioritizes based on freshness urgency and deadlines.

### Pastry Chef — The Enchanted Bakery
*September 2016 — January 2020*

- Prepares stations and instruments according to cleanliness protocols and established procedures.
- Anticipates unexpected issues (rush periods, last-minute orders) and adapts quickly to ensure smooth production progression.
- Performs verifications and follow-ups related to recipes (temperatures, baking times) with scientific rigor.
- Schedules tasting appointments, documents relevant information, and performs post-delivery follow-ups.

### Pastry Apprentice — The Magic Oven
*March 2008 — September 2016*

- Prepares ingredients for daily recipes and assists during mass productions.
- Sterilizes and maintains instruments and equipment according to hygiene standards.

## Education

- Technical Training — Advanced French Pastry (Cordon Bleu School), 2019
- D.E.P. Pastry, 2008

## Languages

- French (native) · English (intermediate) · Language of Croissants (fluent)
`;

function getNextSampleCV() {
    const lang = getLang();
    const samples = sampleCVs[lang];
    const content = samples[sampleIndex % samples.length];
    sampleIndex++;
    return content;
}

async function init() {
    console.log('CV Stash init() starting...');

    const lang = storage.loadLanguage();
    setLang(lang);
    await loadI18n();
    updateLanguageUI();
    updateLanguageButtons();

    uiInitSidebar();

    const cvs = storage.loadCVs();
    sidebar.initSidebar(cvs);
    sidebar.setAfterDeleteCallback(() => updateViewState());

    initEditor(handleEditorInput);
    initSwipeGesture();
    initPanelSwipe(switchTab);

    setupEventListeners();
    updateViewState();
    initTabs();

    initTheme();

    // Apply current CV's color to the theme
    const currentCV = sidebar.getCurrentCV();
    if (currentCV) {
        applyCVColor(currentCV);
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }

    initOnboarding();
    requestInitialZoom();

    console.log('CV Stash initialized successfully');
}

function setupEventListeners() {
    console.log('Setting up event listeners...');

    document.getElementById('lang-en').addEventListener('click', () => handleLanguageChange('en'));
    document.getElementById('lang-fr').addEventListener('click', () => handleLanguageChange('fr'));

    document.getElementById('download-btn').addEventListener('click', handleDownloadPDF);
    document.getElementById('import-btn').addEventListener('click', handleImport);
    document.getElementById('export-btn').addEventListener('click', handleExport);
    document.getElementById('editor-copy-btn').addEventListener('click', handleCopyToClipboard);
    document.getElementById('file-input').addEventListener('change', handleFileImport);
    document.getElementById('zoom-out-btn').addEventListener('click', handleZoomOut);
    document.getElementById('zoom-in-btn').addEventListener('click', handleZoomIn);
    document.getElementById('scale-select').addEventListener('change', (e) => {
        setScaleMode(e.target.value);
    });

    document.getElementById('help-btn').addEventListener('click', showHelpModal);
    document.getElementById('empty-state-tour').addEventListener('click', showWizard);

    document.getElementById('sidebar-toggle').addEventListener('click', () => {
        uiToggleSidebar();
        clearSelection();
    });

    document.getElementById('selection-mode-btn').addEventListener('click', () => {
        toggleSelectionMode();
    });

    document.getElementById('new-cv-btn').addEventListener('click', handleCreateNewCV);
    document.getElementById('new-cv-btn-collapsed').addEventListener('click', handleCreateNewCV);

    document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu);
    document.getElementById('mobile-overlay').addEventListener('click', closeMobileMenu);

    // Tab switching
    document.getElementById('editor-tab').addEventListener('click', () => switchTab('editor'));
    document.getElementById('preview-tab').addEventListener('click', () => switchTab('preview'));

    document.getElementById('empty-state-new-cv').addEventListener('click', handleCreateNewCV);

    document.getElementById('select-all-btn').addEventListener('click', handleSelectAll);
    document.getElementById('batch-download-md-btn').addEventListener('click', handleBatchDownloadMD);
    document.getElementById('batch-download-pdf-btn').addEventListener('click', handleBatchDownloadPDF);
    document.getElementById('batch-delete-btn').addEventListener('click', handleShowBatchDeleteModal);
    document.getElementById('progress-cancel').addEventListener('click', handleCancelBatchOperation);

    // Template picker
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            createCVFromTemplate(card.dataset.template);
        });
    });
    document.getElementById('template-picker-modal').addEventListener('click', (e) => {
        if (e.target.id === 'template-picker-modal') hideTemplatePicker();
    });

    document.getElementById('delete-confirm').addEventListener('click', () => {
        const checkbox = document.getElementById('delete-dont-show');
        if (checkbox && checkbox.checked) {
            localStorage.setItem('skipDeleteConfirm', 'true');
        }
        const callback = getDeleteCallback();
        if (callback) callback.onConfirm();
    });

    document.getElementById('delete-cancel').addEventListener('click', () => {
        const callback = getDeleteCallback();
        if (callback) callback.onCancel();
    });

    window.addEventListener('resize', () => {
        applyFitToView();
        handleWindowResize();
    });

    // Keyboard shortcuts for undo/redo
    document.addEventListener('keydown', (e) => {
        // Ctrl+Z / Cmd+Z for undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            const undone = undo();
            if (undone) {
                sidebar.initSidebar(sidebar.getCVs());
                // Reload current CV content
                const currentCV = sidebar.getCurrentCV();
                if (currentCV) {
                    loadContent(currentCV.content);
                    updatePreview(currentCV.content);
                    applyCVColor(currentCV);
                }
            }
        }

        // Ctrl+Shift+Z / Cmd+Shift+Z for redo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
            e.preventDefault();
            const redone = redo();
            if (redone) {
                sidebar.initSidebar(sidebar.getCVs());
                // Reload current CV content
                const currentCV = sidebar.getCurrentCV();
                if (currentCV) {
                    loadContent(currentCV.content);
                    updatePreview(currentCV.content);
                    applyCVColor(currentCV);
                }
            }
        }

        // Ctrl+Y / Cmd+Y for redo (Windows convention)
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            const redone = redo();
            if (redone) {
                sidebar.initSidebar(sidebar.getCVs());
                // Reload current CV content
                const currentCV = sidebar.getCurrentCV();
                if (currentCV) {
                    loadContent(currentCV.content);
                    updatePreview(currentCV.content);
                    applyCVColor(currentCV);
                }
            }
        }
    });

    setupCVListListeners();
}

// Tab switching
function switchTab(tab) {
    const editorTab = document.getElementById('editor-tab');
    const previewTab = document.getElementById('preview-tab');
    const editorPanel = document.getElementById('editor-panel');
    const previewPanel = document.getElementById('preview-panel');
    const editorActions = document.getElementById('editor-actions');
    const previewActions = document.getElementById('preview-actions');
    const editor = document.getElementById('editor');

    if (tab === 'editor') {
        editorTab.classList.add('active');
        previewTab.classList.remove('active');
        editorPanel.classList.add('active');
        previewPanel.classList.remove('active');
        editorActions.style.display = 'flex';
        previewActions.style.display = 'none';
        editor.focus();
    } else {
        previewTab.classList.add('active');
        editorTab.classList.remove('active');
        previewPanel.classList.add('active');
        editorPanel.classList.remove('active');
        editorActions.style.display = 'none';
        previewActions.style.display = 'flex';

        // Update preview with current content
        const currentContent = getContent();
        if (currentContent) {
            updatePreview(currentContent);
        }

        // On mobile, apply letter-fit scaling after preview renders
        if (window.innerWidth <= BREAKPOINT_MOBILE) {
            requestAnimationFrame(() => applyFitToView());
        }
    }
}

// Initialize tabs
function initTabs() {
    switchTab('editor');
}

function requestInitialZoom() {
    const preview = document.getElementById('preview');
    if (!preview) return;

    // Set 100% immediately on load
    requestAnimationFrame(() => {
        applyFitToView();
    });
}

function setupCVListListeners() {
    const cvList = document.getElementById('cv-list');

    cvList.addEventListener('click', (e) => {
        const item = e.target.closest('.cv-item');
        if (!item) return;
        const id = item.dataset.id;

        if (e.target.closest('.cv-checkbox')) {
            e.stopPropagation();
            e.preventDefault();
            toggleCVSelection(id);
            return;
        }

        if (e.target.closest('.cv-action-btn')) {
            e.stopPropagation();
            e.preventDefault();
            const action = e.target.closest('.cv-action-btn').dataset.action;
            if (action === 'rename') {
                handleRename(id);
            } else if (action === 'duplicate') {
                handleDuplicate(id);
            } else if (action === 'delete') {
                handleDelete(id);
            }
            return;
        }

        // In selection mode, clicking anywhere on the item toggles selection
        if (document.body.classList.contains('selection-mode')) {
            e.stopPropagation();
            toggleCVSelection(id);
            return;
        }

        e.stopPropagation();
        handleCVClick(id);
    });
}

function handleEditorInput(content) {
    const currentCV = sidebar.getCurrentCV();
    if (!currentCV) {
        updatePreview(content);
        checkContentLength();
        return;
    }

    const currentCVId = sidebar.getCurrentCVId();

    // Clear existing timeout
    clearTimeout(editTimeout);

    // Immediate save (existing behavior)
    sidebar.updateCV(currentCVId, { content });

    const newName = storage.extractName(content);
    if (currentCV.name !== newName) {
        sidebar.updateCV(currentCVId, { name: newName });
        sidebar.renderCVList();
    }

    const cvs = sidebar.getCVs();
    storage.saveCVs(cvs, currentCVId);

    updatePreview(content);
    checkContentLength();

    // Debounced edit command for undo (2 second delay)
    editTimeout = setTimeout(() => {
        // Only create edit command if:
        // 1. Content has changed from last saved state
        // 2. We're tracking edits for this CV
        if (lastEditCVId === currentCVId && lastEditContent !== content && lastEditContent !== '') {
            const command = new EditCommand(currentCVId, lastEditContent, content, cvs);
            executeCommand(command); // No toast for edits
        }

        // Update tracking state
        lastEditCVId = currentCVId;
        lastEditContent = content;
    }, EDIT_TRACK_DEBOUNCE_MS);
}

function handleLanguageChange(lang) {
    if (lang === storage.loadLanguage()) return;

    storage.saveLanguage(lang);
    setLang(lang);
    loadI18n().then(() => {
        updateLanguageUI();
        updateLanguageButtons();
        sidebar.renderCVList();
    });
}

function handleDownloadPDF() {
    const cv = sidebar.getCurrentCV();
    if (!cv) return;

    if (cv.content.length > CHAR_LIMIT) {
        alert(t('charLimitExceeded'));
        return;
    }

    downloadPDF(cv);
}

function handleZoomOut() {
    const preview = document.getElementById('preview');
    if (!preview) return;

    const currentScale = getCurrentZoomScale();
    const newScale = Math.max(0.3, currentScale - 0.1);
    setZoomScale(newScale);
}

function handleZoomIn() {
    const preview = document.getElementById('preview');
    if (!preview) return;

    const currentScale = getCurrentZoomScale();
    const newScale = Math.min(1.5, currentScale + 0.1);
    setZoomScale(newScale);
}

function getCurrentZoomScale() {
    const preview = document.getElementById('preview');
    if (!preview) return 1.0;

    // On mobile, zoom is handled via CSS zoom property
    if (window.innerWidth <= BREAKPOINT_MOBILE) {
        return parseFloat(preview.style.zoom) || 1.0;
    }

    const transform = preview.style.transform;
    const match = transform.match(/scale\(([\d.]+)\)/);
    return match ? parseFloat(match[1]) : 1.0;
}

function setZoomScale(scale) {
    const preview = document.getElementById('preview');
    if (!preview) return;

    zoomLevel = scale;

    const percentage = Math.round(scale * 100);
    const zoomLevelEl = document.getElementById('zoom-level');
    if (zoomLevelEl) {
        zoomLevelEl.textContent = `${percentage}%`;
    }

    scale = Math.floor(scale * 100) / 100;

    if (window.innerWidth <= BREAKPOINT_MOBILE) {
        preview.style.zoom = scale;
    } else {
        preview.style.transform = `scale(${scale})`;
    }
}

function applyFitToView() {
    const preview = document.getElementById('preview');

    if (!preview) return;

    if (window.innerWidth <= BREAKPOINT_MOBILE) {
        // On mobile, use CSS zoom to fit letter page to viewport width
        const templateWidthPx = LETTER_WIDTH_PX;
        const scale = Math.floor((window.innerWidth / templateWidthPx) * 100) / 100;
        preview.style.zoom = scale;
        preview.style.transform = '';
        preview.style.transformOrigin = '';
        preview.style.marginBottom = '';
        zoomLevel = scale;

        const zoomLevelEl = document.getElementById('zoom-level');
        if (zoomLevelEl) {
            zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
        }
    } else {
        preview.style.zoom = '';
        preview.style.transform = 'scale(1)';
        preview.style.transformOrigin = '';
        preview.style.marginBottom = '';
        zoomLevel = 1.0;

        const zoomLevelEl = document.getElementById('zoom-level');
        if (zoomLevelEl) {
            zoomLevelEl.textContent = '100%';
        }
    }
}

function handleImport() {
    document.getElementById('file-input').click();
}

function handleExport() {
    const cv = sidebar.getCurrentCV();
    if (!cv) return;

    const blob = new Blob([cv.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = storage.generateMarkdownFilename(cv.name);
    a.click();
    URL.revokeObjectURL(url);
}

function handleCopyToClipboard() {
    const content = getContent();
    if (!content) return;

    navigator.clipboard.writeText(content).then(() => {
        const btn = document.getElementById('editor-copy-btn');
        const btnText = document.getElementById('editor-copy-btn-text');
        btn.classList.add('copied');
        if (btnText) btnText.textContent = t('copied');

        setTimeout(() => {
            btn.classList.remove('copied');
            if (btnText) btnText.textContent = t('copyEditor');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const name = storage.extractName(content) || 'Imported CV';
        sidebar.createCV(name, content);
        storage.saveCVs(sidebar.getCVs(), sidebar.getCurrentCVId());
        updateViewState();
        event.target.value = '';
        closeMobileMenu();
    };
    reader.readAsText(file);
}

function handleCreateNewCV() {
    showTemplatePicker();
}

function showTemplatePicker() {
    document.getElementById('template-picker-modal').classList.add('show');
}

function hideTemplatePicker() {
    document.getElementById('template-picker-modal').classList.remove('show');
}

function getBlankCV() {
    return `# ${t('newCV') || 'My CV'}\n`;
}

function getPlaceholderCV() {
    const lang = getLang();
    if (lang === 'fr') {
        return `# Votre Nom
## Votre Titre Professionnel

## Profil
Brève description de votre parcours professionnel et de vos compétences clés...

## Expérience
### Intitulé du Poste | Nom de l'Entreprise
**Date de début – Date de fin**
- Réalisation ou responsabilité clé...
- Autre accomplissement notable...

## Compétences
- **Compétences Techniques** : Compétence 1, Compétence 2, Compétence 3
- **Langues** : Français (natif), Anglais (intermédiaire)

## Formation
### Diplôme | Établissement
**Année d'obtention**
`;
    }
    return `# Your Name
## Your Job Title

## Summary
Brief description of your professional background and key strengths...

## Experience
### Job Title | Company Name
**Start Date – End Date**
- Key achievement or responsibility...
- Another accomplishment...

## Skills
- **Technical Skills**: Skill 1, Skill 2, Skill 3
- **Languages**: English (native), French (intermediate)

## Education
### Degree | Institution
**Graduation Year**
`;
}

function createCVFromTemplate(templateType) {
    let content = '';
    let name = '';
    switch (templateType) {
        case 'blank':
            content = getBlankCV();
            name = t('newBlankCV') || 'New Blank CV';
            break;
        case 'placeholder':
            content = getPlaceholderCV();
            name = t('newPlaceholderCV') || 'New Placeholder CV';
            break;
        case 'example':
            content = getNextSampleCV();
            const match = content.match(/^#\s+(.+)/m);
            name = match ? match[1].trim() : (t('newExampleCV') || 'New Example CV');
            break;
    }

    sidebar.createCV(name, content);
    storage.saveCVs(sidebar.getCVs(), sidebar.getCurrentCVId());
    loadCurrentCV();
    updateViewState();
    clearSelection();
    closeMobileMenu();
    hideTemplatePicker();
}

function handleCVClick(id) {
    sidebar.selectCV(id);
    storage.saveCVs(sidebar.getCVs(), sidebar.getCurrentCVId());
    loadCurrentCV();
    clearSelection();
}

function handleRename(id) {
    const cvs = sidebar.getCVs();
    const cv = cvs[id];
    if (!cv) return;

    const oldName = cv.name;
    renamingCVId = id;
    showRenameModal(oldName, (newName) => {
        const command = new RenameCommand(id, oldName, newName, cvs);
        executeCommand(command);

        const updatedCVs = sidebar.getCVs();
        storage.saveCVs(updatedCVs, sidebar.getCurrentCVId());
        sidebar.initSidebar(updatedCVs);
        renamingCVId = null;

        // Show toast with undo option
        showToast(
            command.getDescription(),
            () => {
                undo();
                sidebar.initSidebar(sidebar.getCVs());
                const currentCV = sidebar.getCurrentCV();
                if (currentCV) {
                    applyCVColor(currentCV);
                }
            }
        );
    }, () => {
        renamingCVId = null;
    });
}

function handleDuplicate(id) {
    const newCV = sidebar.duplicateCV(id);
    if (newCV) {
        storage.saveCVs(sidebar.getCVs(), sidebar.getCurrentCVId());
        loadCurrentCV();
    }
}

function handleDelete(id) {
    if (sidebar.deleteCV(id)) {
        storage.saveCVs(sidebar.getCVs(), sidebar.getCurrentCVId());
        updateViewState();
    }
}

function handleSelectAll() {
    selectAll(Object.keys(sidebar.getCVs()));
}

function handleBatchDownloadMD() {
    batchDownloadMD(sidebar.getCVs());
}

function handleBatchDownloadPDF() {
    batchDownloadPDF(sidebar.getCVs());
}

function handleShowBatchDeleteModal() {
    const selectedIds = Array.from(getSelectedCVs());
    const cvs = sidebar.getCVs();

    showBatchDeleteModal(cvs, selectedIds, () => {
        if (batchDelete(cvs)) {
            storage.saveCVs(cvs, sidebar.getCurrentCVId());
            sidebar.setCVs(cvs);
            sidebar.initSidebar(cvs);
            updateViewState();
            clearSelection();
        }
    }, () => {
        hideBatchDeleteModal();
    });
}

function handleCancelBatchOperation() {
    hideProgressOverlay();
    clearSelection();
}

function handleWindowResize() {
    applyFitToView();
}

function loadCurrentCV() {
    const cv = sidebar.getCurrentCV();
    if (!cv) return;

    loadContent(cv.content);
    updatePreview(cv.content);
    checkContentLength();
    updateActiveCVHighlight();
    applyFitToView();
}

function updateActiveCVHighlight() {
    document.querySelectorAll('.cv-item').forEach(item => {
        item.classList.remove('active');
    });
    sidebar.renderCVList();
}

function updateViewState() {
    const cvs = sidebar.getCVs();
    const hasCVs = Object.keys(cvs).length > 0;
    const emptyState = document.getElementById('empty-state');
    const editorPreviewWrapper = document.getElementById('editor-preview-wrapper');

    if (hasCVs) {
        emptyState.classList.remove('show');
        if (editorPreviewWrapper !== null) {
            editorPreviewWrapper.style.display = 'flex';
        }
        if (sidebar.getCurrentCVId() !== null) {
            loadCurrentCV();
        }
    } else {
        emptyState.classList.add('show');
        if (editorPreviewWrapper !== null) {
            editorPreviewWrapper.style.display = 'none';
        }
    }
}

// Start the app when DOM is ready
// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

