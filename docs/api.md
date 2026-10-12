# API overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/dashboard` | KPI/dashboard data |
| GET | `/api/assets` | Search/list inventory |
| POST | `/api/assets` | Add asset |
| GET | `/api/assets/:id` | Asset + lifecycle history |
| POST | `/api/assets/:id/transfer` | Create transfer request |
| POST | `/api/assets/:id/confirm-receipt` | Target user confirms transfer |
| POST | `/api/assets/:id/remove` | Remove/request removal |
| POST | `/api/assets/:id/custodian` | Assign custodian |
| GET | `/api/approvals` | Admin pending actions |
| POST | `/api/approvals/:id/approve` | Approve removal |
| POST | `/api/approvals/:id/reject` | Reject pending action |
| GET | `/api/tickets` | List internal tickets |
| PATCH | `/api/tickets/:id` | Admin ticket status update |
