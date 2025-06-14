# Deezar

Deezar est une application de streaming musical qui permet de rechercher, télécharger et gérer de la musique.

## Fonctionnalités

- Rechercher et télécharger de la musique via l'API de Deezer.
- Gestion des comptes utilisateurs et authentification.
- Envoi de notifications par e-mail.
- Analyse automatique du BPM des morceaux.
- Historique d'écoute et recommandations personnalisées.

## Installation

1. Clonez le dépôt :
    ```sh
    git clone https://github.com/MyEcoria/deezer_scrap.git
    cd deezer_scrap
    ```

2. Installez les dépendances :
    ```sh
    npm install
    ```

3. Configurez l'application :
   - Renommez le fichier `.env.exemple` en `.env` et modifiez les variables d'environnement selon vos besoins.

4. Compilez le projet :
    ```sh
    npm run build
    ```

5. Démarrez l'application :
    ```sh
    npm start
    ```

6. Pour empaqueter l'application (Linux, macOS, Windows) :
    ```sh
    npm run pkg
    ```

## Utilisation

### Endpoints API

- **Inscription utilisateur** : `POST /user/register`
- **Connexion utilisateur** : `POST /user/login`
- **Confirmation d'inscription** : `GET /user/confirm/:id`
- **Recherche de musique** : `POST /music/search`
- **Lecture de musique** : `GET /music/:id.mp3`

## Configuration

- **Base de données** : Configurez la connexion dans le fichier `.env`.
- **SMTP** : Paramétrez l'envoi des e-mails via les variables d'environnement.
- **Stockage S3** : Configurez les paramètres S3 dans le fichier `.env`.

## Structure du projet

- Le code source se trouve dans le dossier `src` et les fonctions utilitaires dans le dossier `modules`.
- Les définitions de types TypeScript se trouvent dans le dossier `types`.

## Journal des modifications

Documentez ici les évolutions et mises à jour du projet.

## Auteur

## Utilisation avec Docker

1. Construisez et lancez tous les services :
   ```sh
   docker-compose up --build
   ```

L'application sera disponible sur `http://localhost:8000`.
La base de données est initialisée automatiquement à partir du fichier `schema.sql` lors du premier démarrage des conteneurs.
