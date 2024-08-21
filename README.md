
## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start
```

Внимание, в @/src/services/gateaway.ts:

Для development-режима:

```
@WebSocketGateway({
  cors: {
    credentials: true, // TODO!!! For development!!!
  },
  allowEIO3: true,
})
```

## License

Nest is [MIT licensed](LICENSE).
