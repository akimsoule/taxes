#!/bin/bash

set -e

# Configuration
DB_CONTAINER_NAME="taxes_db"
DB_IMAGE="postgres:15" # Remplacez par l'image de votre base de données
DB_PORT=5432
DB_USER="admin"
DB_PASSWORD="password"
DB_NAME="taxes_db"

# Vérifie si le conteneur existe déjà
if [ "$(docker ps -aq -f name=$DB_CONTAINER_NAME)" ]; then
  echo "Le conteneur $DB_CONTAINER_NAME existe déjà."

  # Vérifie si le conteneur est en cours d'exécution
  if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
    echo "Le conteneur $DB_CONTAINER_NAME est déjà en cours d'exécution."
  else
    echo "Démarrage du conteneur $DB_CONTAINER_NAME..."
    docker start $DB_CONTAINER_NAME
  fi
else
  echo "Création et démarrage du conteneur $DB_CONTAINER_NAME..."
  docker run -d \
    --name $DB_CONTAINER_NAME \
    -e POSTGRES_USER=$DB_USER \
    -e POSTGRES_PASSWORD=$DB_PASSWORD \
    -e POSTGRES_DB=$DB_NAME \
    -p $DB_PORT:5432 \
    $DB_IMAGE
fi

# Attente que la base de données soit prête
echo "Attente que la base de données soit prête..."
until docker exec $DB_CONTAINER_NAME pg_isready -U $DB_USER > /dev/null 2>&1; do
  sleep 1
done

echo "La base de données est prête et accessible sur le port $DB_PORT."