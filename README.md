# Trip BSH Backend

Service for group trip expense management (Node.js + Express + TypeScript + MongoDB).

## Features
- Users: register, fetch by id/email (password hashed with bcrypt).
- Trips: create, list by user, details (with balances), join request (pending), approve (add participant), remove participant (only if balance = 0), summary settlement (creditors ↔ debtors).
- Payments: create (splits + currency conversion to ILS), delete (reverts balances), update (recalculates only if amount / currency / beneficiaries changed), list by trip (with payer + beneficiaries names).
- Currency: automatic conversion to ILS via Frankfurter (no API key). Skips conversion if already ILS/NIS/₪/ש"ח.
- Validation: Zod schemas for params/body.
- Errors: consistent messages (English) + 404 when documents not found.

## Tech Stack
- Runtime: Node.js (>=18)
- Language: TypeScript
- Web: Express
- DB: MongoDB + Mongoose
- Validation: Zod
- Auth (current): basic user creation (extendable)
- Hashing: bcrypt
- Tooling (expected): ts-node / nodemon for dev, tsc for build

## Directory Structure (src)
```
src/
  index.ts                 # App bootstrap (Express, CORS, Mongo, middleware)
  utils/
    currency-converter.ts  # convertCurrencyToILS()
    errors.ts              # Custom errors (e.g. DocumentNotFoundError)
    zod.ts                 # TypedRequest helper
  express/
    users/
      interface.ts
      model.ts
      manager.ts
      controller.ts
      router.ts
    trips/
      interface.ts
      model.ts
      validations.ts
      manager.ts
      controller.ts
      router.ts
    payments/
      interface.ts
      model.ts
      manager.ts
      controller.ts
      router.ts
  middleware/
    loggerMiddleware.ts (assumed)
config/ (if present)       # Centralized config loader (referenced in index)
```

## Environment Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| SERVICE_PORT | yes | 3000 | Port Express listens on |
| USERS_MONGO_URI or MONGO_URI | yes | none | Mongo connection string used in config.users.mongo.uri |
| CORS_ORIGINS | no | http://localhost:5173 | Comma separated allowed origins |
| NODE_ENV | no | development | Environment flag |
| BCRYPT_SALT_ROUNDS | no | 10 | Salt rounds for password hashing |
| LOG_LEVEL | no | info | Minimal log level (info/debug/error) |

Adjust naming to match your config module. If your code uses `config.users.mongo.uri` map it from USERS_MONGO_URI.

### Example .env
```
SERVICE_PORT=3000
USERS_MONGO_URI=mongodb://localhost:27017/tripbsh
CORS_ORIGINS=http://localhost:5173,https://calculatetrips.netlify.app
BCRYPT_SALT_ROUNDS=10
NODE_ENV=development
LOG_LEVEL=info
```

## Scripts (suggested)
Add to package.json if not present:
```
"scripts": {
  "dev": "nodemon --watch src --exec ts-node src/index.ts",
  "build": "tsc -p tsconfig.json",
  "start": "node dist/index.js",
  "lint": "eslint . --ext .ts",
  "typecheck": "tsc --noEmit"
}
```

## Run (Dev)
```
npm install
npm run dev
```
Open: http://localhost:3000 (adjust port).

## Build & Run (Prod)
```
npm run build
npm run start
```

## Core Domain Logic

### Payment Creation
- amountInILS = convertCurrencyToILS(amount, currency)
- sharePerUser = amountInILS / beneficiaries.length
- payer.balance += (amountInILS - sharePerUser)
- each beneficiary.balance -= sharePerUser
- Persist payment with stored amountInILS for future reversals.

### Payment Deletion
Reverse:
- payer.balance -= (amountInILS - sharePerUser)
- each beneficiary.balance += sharePerUser

### Payment Update
Recalculate ONLY if:
- amount changed
- currency changed
- beneficiary list changed
Process:
1. Revert old distribution (using stored amountInILS).
2. Recompute new amountInILS (if amount/currency changed).
3. Apply new distribution.

Metadata-only changes (description, dates) skip balance logic.

### Trip Summary
Greedy settle between debtors (balance < 0) and creditors (balance > 0) producing minimal transaction list.

### Remove Participant
Allowed only if participant.balance === 0; otherwise error.

## Validation (Zod)
- ObjectId regex
- Trip creation: name, startDate < endDate
- Request schemas per route (params/query/body)
- Payment update: reject direct amountInILS modifications.

## Error Handling (Recommended Mapping)
| Error Text | HTTP |
|------------|------|
| Payment not found / User not found / Trip not found | 404 |
| Unauthorized | 403 |
| Corrupted payment data | 400 |
| Validation failures | 400 |
| Generic | 500 |

Implement middleware to translate thrown Error messages to status codes.

## Currency Conversion
Frankfurter endpoint:
`https://api.frankfurter.app/latest?amount={amount}&from={FROM}&to=ILS`
Return `rates.ILS`. If FROM already ILS variants → return amount.

## Security Considerations
- Hash passwords (bcrypt) before save.
- Do not log raw passwords.
- Validate all ObjectIds.
- Prevent modification of immutable fields (tripId, payerId, amountInILS).

## Testing (Recommended)
- Create payment → verify balances.
- Delete payment → balances revert exactly.
- Update payment amount only → balances adjust delta.
- Update description only → balances unchanged.
- Remove participant with non-zero balance → error.
- Currency conversion fallback when ILS given.

## Extensibility
- Add JWT auth (middleware + protect routes).
- Add rate limiting (express-rate-limit).
- Add audit trail for payment changes.
- Add pagination for payments listing.

## License
MIT (update if different).

## Support
Open an issue with: endpoint, payload, response status, stack trace, Node