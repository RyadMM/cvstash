// Template management for new CV creation

import { t, getLang } from './i18n.js';
import { sampleCVs } from './data/samples.js';

let sampleIndex = 0;

export function getNextSampleCV() {
    const lang = getLang();
    const samples = sampleCVs[lang];
    const content = samples[sampleIndex % samples.length];
    sampleIndex++;
    return content;
}

export function getBlankCV() {
    return `# ${t('newCV') || 'My CV'}\n`;
}

export function getPlaceholderCV() {
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

export function showTemplatePicker() {
    document.getElementById('template-picker-modal').classList.add('show');
}

export function hideTemplatePicker() {
    document.getElementById('template-picker-modal').classList.remove('show');
}
