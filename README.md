


(1) add file named .env with contents to the root directory:

NODE_ENV=development

PORT=9000

DATABASE_URL=postgres://admin:admin@mindscape_postgres_1:5432/mindscape

REDIS_URL=redis://mindscape_redis_1:6379

JWT_ACCESS_TOKEN_SECRET=secret

JWT_ACCESS_TOKEN_EXPIRATION_TIME=600

JWT_REFRESH_TOKEN_SECRET=secretsecret

JWT_REFRESH_TOKEN_EXPIRATION_TIME=604800

MAILGUN_API_KEY='your-mailgun-api-key'

MAILGUN_DOMAIN='your-mailgun-domain'

GOOGLE_CLIENT_ID='your-google-client-id'

GOOGLE_CLIENT_SECRET='your-google-client-secret'

TWILIO_ACCOUNT_SID='your-twilio-account-sid'

TWILIO_API_KEY_SID='your-twilio-api-key-sid'

TWILIO_API_KEY_SECRET='your-twilio-api-key-secret'


(2) add file named docker.env with contents to root directory

POSTGRES_USER=admin

POSTGRES_PASSWORD=admin

POSTGRES_DB=mindscape

PGADMIN_DEFAULT_EMAIL=admin@admin.com

PGADMIN_DEFAULT_PASSWORD=admin

(3) change WORKDIR in the Dockerfile to your working directory

(4) run `yarn install`

(5) run `docker-compose up`
