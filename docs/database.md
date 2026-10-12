# Database design

`users` → identity and RBAC.

`assets` → one row per physical/logical asset and its current state.

`asset_transactions` → append-only history for Add, Transfer, Confirm Receipt, Remove, Approve/Reject and Custodian actions.

`tickets` → internal replacement for the unavailable corporate Buganizer dependency.

`email_notifications` → provider-neutral notification history.

`dropdown_config` → configurable UI dropdown values.

`audit_logs` → security and business audit trail.

Key relationship:

```text
users 1 ──── * assets
assets 1 ──── * asset_transactions
assets 1 ──── * tickets
users 1 ──── * tickets
users 1 ──── * audit_logs
```
