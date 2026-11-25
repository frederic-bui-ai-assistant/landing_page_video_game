# Lucia & Jason — dossier de fans GTA VI

Site statique (HTML, CSS, JavaScript vanilla), sans framework ni backend, consacré aux deux personnages principaux de GTA VI. Site de fans non officiel : tous les textes et illustrations sont originaux.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Structure de la page (navigation, vues, pied de page) |
| `style.css` | Design néon Vice City, responsive, animations |
| `script.js` | Chargement du JSON, navigation sans rechargement, portraits SVG |
| `characters.json` | **Tous les contenus éditables** |

## Lancer le site

Le JSON est chargé avec `fetch`, donc un double-clic sur `index.html` peut échouer dans certains navigateurs. Deux solutions :

```bash
python3 -m http.server 8000   # puis ouvrir http://localhost:8000
```

ou hébergement direct : GitHub Pages (Settings → Pages → branche `main`, dossier racine) ou Netlify (glisser-déposer le dossier). Aucune étape de build.

## Modifier les textes (`characters.json`)

- `site` : titre, avertissement, date de dernière vérification (`verification`).
- `accueil` : texte de la page d'accueil.
- `personnages` : une entrée par personnage.
  - `accroche` : phrase d'introduction.
  - `resume.origines`, `resume.parcours`, `resume.role` : listes de `{ "texte": "...", "statut": "confirmé" }`.
  - `traits` : `{ "nom": "...", "description": "..." }`.
  - `citations` : `{ "texte": "...", "contexte": "..." }` (paraphrases, pas des répliques exactes).
  - `incertitudes` : ce qui n'est pas établi.
  - `couleurs` et `portrait` : couleurs du personnage et paramètres du portrait SVG (`fond`, `peau`, `cheveux`, `haut`, `coiffure` = `longue` ou `courte`, `accessoire` = `casque`, `lunettes` ou vide, `description` = texte alternatif).
- `histoireCommune.etapes` : étapes de la frise, avec leur `statut`.
- `sources` : liens affichés dans le pied de page.

### Règle de statut

Chaque information porte un `statut`, qui doit valoir exactement `"confirmé"` ou `"non confirmé"` :

- `confirmé` : visible dans les trailers ou les contenus officiels de Rockstar.
- `non confirmé` : source secondaire, sources divergentes ou information absente des contenus officiels.

Si tu ajoutes une information, vérifie-la d'abord auprès d'une source officielle, rédige-la toi-même, et mets à jour `site.verification`.

## Ajouter un personnage

Ajoute un objet dans `personnages` avec un `id` unique (par exemple `"cal"`) et `suivant` pointant vers un autre `id`. La carte d'accueil, la fiche et le lien dans l'URL (`#cal`) sont créés automatiquement. Pour l'ajouter aussi au menu, copie une ligne `<li>` dans `index.html`.

## Droits

Le site n'inclut ni texte, ni image, ni logo officiels. Les citations sont des paraphrases. Grand Theft Auto est une marque de ses propriétaires.
