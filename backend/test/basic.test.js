import test from 'node:test';
import assert from 'node:assert/strict';
test('ticket code format',()=>assert.match(`TKT-${new Date().getFullYear()}-00001`,/^TKT-\d{4}-\d{5}$/));
