# Dialogue Editor — Spécification Projet

Outil de création et d'édition de dialogues pour RPGs avec versioning Git intégré.

---

## Concept

Un éditeur de dialogues spécialisé qui utilise Git comme système de versioning natif. Chaque projet est un repository Git, permettant branches, historique, et collaboration. Comparable à un "GitHub spécialisé" pour l'écriture narrative de jeux. Il est possible de créer des personnages, d'attacher des dialogues aux personnages, de créer des choix dans ces dialogues, de créer des variables pouvant être vraies ou fausses (des booléens), d'utiliser ces variables pour déterminer les embranchements de dialogue, d'ajouter des commentaires à chaque boite de dialogue, etc.

---

## Architecture

### Séparation des données

| Type de données | Stockage | Format |
|-----------------|----------|--------|
| Dialogues, variables, personnages | Fichiers dans repo Git | Protobuf |
| Utilisateurs, métadonnées projet, commentaires | Base de données | SQLite (local) / PostgreSQL (multi-user) |

### Stack technique

```
┌─────────────────────────────────────┐
│         Frontend (WebView)          │
│         Svelte / Vue / React        │
├─────────────────────────────────────┤
│        Tauri IPC Commands           │
├─────────────────────────────────────┤
│            Backend Rust             │
│  ┌───────────┐  ┌────────────────┐  │
│  │  git2-rs  │  │ SQLx / rusqlite│  │
│  └───────────┘  └────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │   prost (protobuf)            │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```


---

## Modèle de données

### Structure d'un projet (repo Git)

```
A compléter
```

### Schéma Protobuf — Dialogues

```protobuf
A compléter
```


## Fonctionnalités

### MVP

- Créer/ouvrir un projet (init repo Git)
- Créer/éditer/supprimer des dialogues
- Éditeur de nœuds (vue graphe)
- Sauvegarde = commit Git
- Historique des commits (lecture)

### V1

- Variables (jauges, booléens)
- Personnages
- Conditions sur nœuds et choix
- Simulation/preview de dialogue
- Branches Git (création, switch)
- Diff visuel entre versions

### V2

- Commentaires sur nœuds
- Résolution de commentaires
- Merge de branches + gestion conflits
- Export JSON/texte
- Synchronisation remote (push/pull)

### Futur (multi-utilisateur)

- Serveur central (API REST ou gRPC)
- PostgreSQL pour métadonnées partagées
- Authentification
- Permissions par projet

---

---

## Points d'attention

1. **Format protobuf et diffs Git** — Considérer le format texte protobuf ou JSON pour des diffs lisibles. Sinon, prévoir un outil de diff custom.

2. **Nœuds supprimés et commentaires** — Un commentaire peut référencer un nœud qui n'existe plus. Prévoir une logique de détection et affichage approprié.

3. **Performance Git** — Avec beaucoup de fichiers/commits, envisager shallow clones ou optimisations.

4. **Extensibilité multi-user** — Utiliser des traits/interfaces dès le départ pour swapper les implémentations locales vers remote.

---

## Dépendances Rust principales

```toml
[dependencies]
tauri = { version = "2", features = ["..."] }
git2 = "0.18"
prost = "0.12"
rusqlite = { version = "0.31", features = ["bundled"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v4"] }
thiserror = "1"
specta = "2"          # Génération types TS

[build-dependencies]
prost-build = "0.12"
tauri-build = "2"
```


