À l'avenir, il y aura besoin de :

[] Créer la modale permettant d'ajouter un noeud dans le dialogue. Doit récupérer la position de la sourie dans le canvas. Cette position doit être relative au canvas, pas à l'écran. Si la position
[] Créer les différents Nodes ReactFlow customisés.
[] Pour les choix, avoir des handles qui sont liées au choix.
[] Lors de la création d'un edge, il faut à la fois update les edges et les noeuds correspondant.
[] L'API du dialog context doit permettre à chaque noeud de changer ses données en fonction de la structure de React Flow.
[] Permettre de déterminer un noeud comme root node.
[] Track le dernier noeud sauvegardé
[] A la création d'un nouveau noeud, automatiquement le lier au dernier sauvegardé
[] Créer le panel avec des nodes correspondant aux noeuds du dialogue
[] Créer une ligne de vie. La calculer. Parcourir le graph à l'envers pour trouver le noeud de départ / un noeud n'étant pas une destination / un noeud déjà traversé (dans cet ordre) et animer les edges amenant à ce graph. Il doit être possible de changer cette ligne de vie.
[] Créer un système qui autosave le dialogue à intervalles réguliers
[] Créer le edge manager, pour avoir un array de edges à partir des Noeuds du backend

Ne le fait pas pour l'instant
