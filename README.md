# Emma

Python version: 3.9

## L'application Emma

### Création l'environnement
Afin de pouvoir utiliser l'application Emma, il est recommandé de créer un environnement virtuel python. Pour ce faire, nous suggérons la procédure suivante:

1- Installer python 3.9 sur votre ordinateur.
2- Ouvrir une invite de commande et exécuter la commande suivante:
 
 $pip install virtualenv
 
3- Lorsque virtualenv est installé, il reste à créer l'environnement virtuel:
 
 $python -m venv PATH/VERS/MON_ENVIRONNEMENT

4- Maintenant, nous devons activer l'environnement que nous venons de créer, pour ce faire, nous devons naviguer dans le dosser MON_ENVIRONNEMENT que nous venons de créer à l'aide de la commande cd. Ensuite, nous devons naviguer dans le dossier Script que virtualenv à placer dans notre environnement. Une fois à l'intérieur de ce dossier, nous devons activer l'environne à l'aide de la commande suivante

$activate

Si les étapes précédentes ont été effectuéesavec succès, le nom de l'environnement devrait ce trouver en parenthèse du dossier où nous nous sitons dans l'invite de commande.

5- Il ne reste qu'à installer les dépendances. Pour ce faire, nous devons effectuer la commande suivante:

$pip install -r requirements.txt

Le fichier requirements.txt est fournit dans ce répoire Git.

Il n'y a qu'une dépendance qui ne peut être installer par pip, il s'agit de la libraire pyaudio. Celle-ci peut cependant elle peut être installer à l'aide de pipwin qui devrait déjà voir été installé à l'étape précédente. Ainsi, il ne reste qu'à effectuer la commande suivante pour installer cette librairie:

$pipwin install pyaudio


### Lancement de l'application
L'environnement est désormais créer. Afin de lancer l'application, il suffit d'exécuter le script main.py se trouvant dans le répertoir Git.

$python main.py

# Serveur backend
Le serveur backend est développé en NodeJS. Nous avons utilisé Express pour la redirection des routes et MongoDB pour le stockage des données.

## Installation
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

# Serveur Mosquitto
Le serveur Mosquitto sera responsable de recevoir les requêtes Mqtt et de permettre au serveur backend d'écouter sur les topics dédiés aux objets connectés.
Ici nous l'installeront sur une machine Linux Ubuntu 21.04.

## Installation

Premièrement nous devons installer Mosquitto sur le serveur.
```
sudo apt-get install mosquitto mosquitto-clients
```
Une fois installé, il nous faut un fichier de configuration pour le serveur:
```
# Place your local configuration in /etc/mosquitto/conf.d/
# 
# A full description of the configuration file is at
# /usr/share/doc/mosquitto/examples/mosquitto.conf.example

persistence true
persistence_location /var/lib/mosquitto/

log_dest file /var/log/mosquitto/mosquitto.log

include_dir /etc/mosquitto/conf.d

allow_anonymous true

listener 1883
protocol mqtt

listener 8883
protocol websockets
```
Notre serveur est prêt à être exécuter. Voici une liste des commandes disponibles:

Start:
```
sudo msoquitto -c /etc/mosquitto/mosquitto.conf
```
Écouter sur un topic:
```
mosquitto_sub -h localhost -t <topic>
```
