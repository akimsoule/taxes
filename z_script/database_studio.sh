# Variables de connexion PostgreSQL
POSTGRES_USER="admin"
POSTGRES_PASSWORD="password"
POSTGRES_DB="taxes_db"
PORT="5432"

# Vérification de l'argument "prod"
if [ "$1" == "prod" ]; then
  # URL de connexion pour l'environnement de production
  export DATABASE_URL="postgresql://neondb_owner:npg_Itwpl1P5HMWT@ep-proud-recipe-a4rmjqlg-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
else
  # URL de connexion pour l'environnement local
  export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${PORT}/${POSTGRES_DB}"
fi

# Lancement de Prisma Studio
npx prisma studio