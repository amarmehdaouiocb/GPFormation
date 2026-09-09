# Plugin WordPress « GP Formation – Sessions »

Mini-plugin (mu-plugin) pour les sites partenaires, à commencer par
`ecolegallieni.fr`. Il affiche les prochaines sessions de récupération de
points publiées par gpformation.fr et renvoie vers son formulaire
d'inscription avec le canal d'acquisition du partenaire.

Source des dates : `GET https://www.gpformation.fr/api/recovery-sessions`
(route publique en lecture seule de l'app Next, qui relaie le store VPS).
Les dates se gèrent donc uniquement dans l'admin GP Formation.

## Installation

1. Copier `gpformation-sessions.php` dans `wp-content/mu-plugins/` du site
   partenaire (créer le dossier s'il n'existe pas). Un mu-plugin est actif
   dès qu'il est présent, sans passer par l'écran Extensions.
2. Dans la page concernée, remplacer le module de vente existant par un
   module **Code** (Divi) ou un bloc **Code court** contenant :

   ```text
   [gpformation_sessions]
   ```

3. Vider le cache WP Rocket une fois (barre d'admin, WP Rocket, « Vider le
   cache »). Ensuite, le plugin purge lui-même les pages qui contiennent le
   shortcode quand la liste des sessions change.

## Attributs du shortcode

| Attribut    | Défaut                    | Rôle                                                        |
| ----------- | ------------------------- | ----------------------------------------------------------- |
| `canal`     | `ecolegallieni`           | Canal envoyé à gpformation.fr (`gpformation`, `ecolegallieni`). |
| `affichage` | `liste`                   | `liste` : menu déroulant + bouton. `boutons` : un bouton par date. |
| `bouton`    | `Je m'inscris`            | Texte du bouton.                                            |
| `titre`     | `Session`                 | Libellé au-dessus du menu déroulant.                        |
| `vide`      | message générique         | Texte affiché quand aucune session n'est ouverte.           |

Exemples :

```text
[gpformation_sessions affichage="boutons" bouton="Réserver cette date"]
[gpformation_sessions canal="ecolegallieni" titre="Choisissez votre stage"]
```

## Fonctionnement

- Les sessions sont mises en cache dix minutes (transient). Une copie de
  secours de sept jours est servie si gpformation.fr ne répond pas ; sans
  copie, un bouton générique vers le formulaire est affiché.
- Une tâche WP-Cron rafraîchit la liste toutes les dix minutes et purge le
  cache WP Rocket des pages contenant le shortcode dès que les dates changent.
- Le canal est validé contre une liste blanche ; toute valeur inconnue
  retombe sur `ecolegallieni`. Le formulaire fonctionne sans JavaScript
  (formulaire GET classique).
- Le bouton reprend la classe Divi `et_pb_button` pour hériter du style du
  thème.

## Test sans WordPress

```bash
php -l services/wordpress/gpformation-sessions.php
php services/wordpress/test-gpformation-sessions.php
```
