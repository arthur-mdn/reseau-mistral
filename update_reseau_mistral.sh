#!/bin/bash

# Se rendre dans le dossier du projet
# cd /home/root/web_projects/reseau-mistral

# Tirer les dernières modifications du dépôt Git
git pull

# Stopper l'application
docker-compose down

# Reconstruire l'application
docker-compose up -d --build

echo "Mise à jour reseau-mistral terminée."
