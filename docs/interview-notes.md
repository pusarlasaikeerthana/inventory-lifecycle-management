# Interview-ready talking points

## Why React?
Component-based UI, reusable forms/tables/modals, predictable state and strong ecosystem.

## Why Node + Express?
Lightweight REST API layer, same JavaScript ecosystem, clean middleware and service separation.

## Why MariaDB?
The domain is relational: users own assets, assets have transactions, tickets reference assets, and approvals depend on state. Foreign keys and transactions protect consistency.

## Why separate assets and asset_transactions?
`assets` is the current state used for fast reads. `asset_transactions` is append-only lifecycle history. This avoids reconstructing every screen from an event log while preserving auditability.

## Why not Buganizer?
The internal system is not available outside the corporate environment. The portfolio app therefore owns its ticket lifecycle and exposes a replaceable notification adapter.

## Important transaction example
Transfer updates asset status and creates its ticket/history in one database transaction. If any step fails, the transaction rolls back.

## Security
JWT authentication, role checks, bcrypt password hashing, parameterized SQL, server-side validation and no secrets in the frontend.
