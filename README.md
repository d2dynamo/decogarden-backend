# decogarden backend

Example backend for an e-commerce store

To install dependencies:

```bash
bun install
```

To run:

```bash
bun start
```

Unit tests:

```bash
bun test
```

# Unit test env variables

.env.test:

NODE_ENV

TEST_USER_ID

MONGO_URL
MONGO_DB_NAME
MONGO_CA
MONGO_CERT

REDIS_URL
REDIS_PASSWORD
REDIS_PREFIX

SENDGRID_SMTP_RELAY
SENDGRID_SMTP_PORT
SENDGRID_SMTP_USER
SENDGRID_API_KEY
SENDGRID_FROM_EMAIL

# TODO

Data validator validates mongodb objectId and item.properties objects.

Orders and shipments

Finish unit tests

Payment

Make it good, make it fast
Custom router, replace express
