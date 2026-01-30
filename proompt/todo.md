Ce qui a été fait :

[x] Créer la modale permettant d'ajouter un noeud dans le dialogue. Doit récupérer la position de la sourie dans le canvas. Cette position doit être relative au canvas, pas à l'écran. Si la position
[x] Lors de la création d'un edge, il faut à la fois update les edges et les noeuds correspondant . -> Annulé, on reconstruit juste à la sauvegarde
[x] L'API du dialog context doit permettre à chaque noeud de changer ses données en fonction de la structure de React Flow.
[x] Permettre de déterminer un noeud comme root node.
[x] Track le dernier noeud sauvegardé
[x] A la création d'un nouveau noeud, automatiquement le lier au dernier sauvegardé
[x] Créer le panel avec des nodes correspondant aux noeuds du dialogue
[x] Créer une ligne de vie. La calculer. Parcourir le graph à l'envers pour trouver le noeud de départ / un noeud n'étant pas une destination / un noeud déjà traversé (dans cet ordre) et animer les edges amenant à ce graph. Il doit être possible de changer cette ligne de vie.
[x] Créer un système qui autosave le dialogue à intervalles réguliers
[x] Créer le edge manager, pour avoir un array de edges à partir des Noeuds du backend
[x] Définir les structures des variables.
[x] redéfinir les structures des expressions
[x] Pouvoir ajouter une variable gobale (back)
[x] Pouvoir ajouter une variable à un personnage (back)
[x] Pouvoir ajouter une variable à un dialogue (back)
[x] Pouvoir supprimer une variable (back)
[x] Pouvoir modifier une variable (back)
[x] Pouvoir ajouter une variable gobale (front)
[x] Maintenir un fichier des variables utilisées par les dialogues (back)
[x] A la sauvegarde d'un dialogue, empêcher les phylums de faire référence à des variables non existantes. (back)
[x] Pour les choix, avoir des handles qui sont liées au choix.
[x] Pour les phylums, avoir des handles liés aux conditions.
[x] Pouvoir modifier une variable (front)
[x] Créer les Nodes ReactFlow pour les Phylum.
[x] Créer les Nodes ReactFlow pour les Choix.
[x] Créer l'élement customisé pour le choix.
[x] Pouvoir ordonnancer les dialogues / personnages.

Ce qui est en train d'être fait:

[] Pouvoir créer des groupes de personnage / dialogues.
[] Mode histoire permettant de relier des dialogues entre eux.

Ce qu'il reste à faire dans l'immédiat:

[] Pouvoir modifier le nom d'un dialogue.
[] Pouvoir supprimer un dialogue.
[] Pouvoir supprimer une variable (front).
[] Donner la possibilité de supprimer un dialogue / personnage.
[] Possibilité pour un noeud de changer l'état d'une variable.

Quelques éléments qu'il ne faudra pas oublier:

[] Pouvoir récupérer les variables d'un personnage (back)
[] Pouvoir ajouter une variable à un personnage (front)
[] Pouvoir ajouter une variable à un dialogue (front)
[] Créer un système de notifiaction
[] Faire remonter les messages d'erreur dans le système de notification
[] Créer un système de log digne de ce nom
[] Créer 

À développer plus en détails plus tard

[] wiki et bilbiothèque de ressource utilisant le markdown


Ne le fait pas pour l'instant
