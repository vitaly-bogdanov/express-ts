# как запустить

## накатить приложенный docker-compose с postgres и redis

## накатить схему

```
npm run db:patch:up
```

## если надо - накатить seeds

```
npm run db:seeds
```

## запуск dev

```
npm run start:dev
```

## тест

```
npm run test
```

## все скрипты:

```
"build": "tsc",
"start:prod": "node dist/index.js",
"start:dev": "nodemon --watch src --exec ts-node src/index.ts",
"lint:check": "npx eslint .",
"lint:fix": "npx eslint . --fix",
"format:check": "prettier --check .",
"format:fix": "prettier --write .",
"db:patch:up": "ts-node src/services/some-db-name.service/patches/1-init-schema.up.ts",
"db:patch:down": "ts-node src/services/some-db-name.service/patches/1-init-schema.down.ts",
"db:seeds": "ts-node src/services/some-db-name.service/some-db-name.seeds.ts",
"test": "jest --runInBand --silent"
```

## swagger

```
http://localhost:3000/v1/docs
```
