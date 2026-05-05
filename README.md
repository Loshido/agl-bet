# AGL-BET

Il s'agit d'une plateforme pour All Game Long, un évènement dans lequel plusieurs tournois de jeux vidéos sont organisés tout au long de la nuit!

L'association IsenEngineering organise cette évènement chaque année.

Cette plateforme permet aux participants de parier de l'argents factives sur chaque tournoi.
Les participants qui atteindront le podium seront les vainqueurs!

À l'occasion d'activitées spéciales (ex: casino / poker / défi), le staff peut donner des points pour injecter de l'argents dans le système.

## Stack

[Postgresql](https://www.postgresql.org) & [Qwik](https://qwik.dev) (un framework javascript qui utilise [Vite](https://vite.dev))

*Qwik est très pratique pour nos besoins.*

## Variable d'environnements

Veuillez créer un fichier `.env` dans votre environnement
```.env
DEV=false
DOMAIN=localhost
POSTGRES=postgres://postgres:?1?@localhost:5432/postgres

POSTGRES_PASSWORD=?1?
HASH_SECRET=?2?
JWT_SECRET=?3?

DEFAULT_AGL=10000
```
Vous pouvez générer des secrets aléatoires avec cette commande `openssl rand -base64 32`

## Développement

Prérequis:
- Avoir `bun` *(ou `npm` & `nodejs`,* malheuresement pas de Deno...)
- Démarrer une base de données `postgresql` sur le port `5432`

---

ouvre un serveur de développement sur le port `5174`\
-> `bun dev`

## Production

#### Localement
Construction des fichiers statiques \
-> `bun run build`


Ouvre un serveur de production sur le port `80`\
-> `bun run serve`

#### Avec Docker

Construction de l'image du serveur \
-> `docker build -t ghcr.io/loshido/agl-bet -f ./Dockerfile .`

Déployer une instance (web + database) \
l'application web sur le port `80` \
-> `docker compose up -d`

#### Avec Kubernetes

Pourquoi faire?


## Base de données

## Table `utilisateurs`

Pour être administrateur vous devez entrer dans la base de données et ajoutez les rôles à qui vous souhaitez.

```SQL
UPDATE utilisateurs 
SET roles = '["user", "admin"]' 
WHERE pseudo = 'loshido';
```

la colonne `roles` contient une liste des rôles de l'utilisateur, (à noter qu'un utilisateur en attente n'a aucun rôle)
- `user`
- `admin`
- `root` (pour pouvoir dégrader des administrateurs)

la colonne `pass` corresponds le mot de passe hashé avec Argon2id

## Table `transactions`
Cette table contient l'historique des transactions de tous les utilisateurs.

## Autres

les autres tables sont ennuyantes