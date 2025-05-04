# Variables de connexion PostgreSQL
POSTGRES_USER="admin"
POSTGRES_PASSWORD="password"
POSTGRES_DB="taxes_db"
PORT="5432"

# Construction de l'URL de connexion PostgreSQL
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${PORT}/${POSTGRES_DB}"
npx prisma migrate dev