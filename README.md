# Emma

## Serveur backend
Le serveur backend est développé en NodeJS. Nous avons utilisé Express pour la redirection des routes et MongoDB pour le stockage des données.

### Installation
Pour installer le serveur vous devez tout d'abord le cloner. Vous pouvez utiliser des outils comme Fork, GitHub pour Windows ou Git Bash. Il ne vous reste plus qu'à coller le lient du repo et laisser la magie opérer.
![image](https://user-images.githubusercontent.com/50884605/155769752-bb0bac1e-8b0e-4f28-91ca-016e271a7b3f.png)
Ouvrez ensuite le dossier ExpressBackend avec votre éditeur préféré. Ici nous utiliserons Visual Studio Code. Pour pouvoir lancer le projet il vous faut les dépendances. Ouvrez le terminal avec <code>Ctrl + \`</code> puis entrez la commande `npm i` pour installer toutes les dépendances nécessaires.

Vous aurez également besoin de créer un fichier .env à la reacine du dossier.
```
PORT=3000
MONGO_URI=<Votre chaîne de connection MongoDB>
TOKEN_SECRET=<Votre JWT Token>
SHA256_PRIVATE=<Votre algorithme d'encryption>
```

Il ne vous reste plus qu'à exécuter la commande `npm run dev` pour lancer le serveur Express. Vous pouvez maintenant y accéder via le port définit dans votre .env ou par défaut le port **3000**.
