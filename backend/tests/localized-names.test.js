import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data')

test('dados reais: todo lugar, cargo e categoria tem nome em pt e en', () => {
    for (const coll of ['places', 'roles', 'categories']) {
        const items = JSON.parse(fs.readFileSync(path.join(dataDir, `${coll}.json`), 'utf-8'))
        assert.ok(items.length > 0, `${coll} não pode estar vazio`)
        for (const item of items) {
            assert.equal(typeof item.name, 'object', `${coll}#${item.id}: name deve ser um objeto de traduções`)
            assert.ok(item.name.pt && item.name.pt.trim().length > 0, `${coll}#${item.id}: name.pt vazio`)
            assert.ok(item.name.en && item.name.en.trim().length > 0, `${coll}#${item.id}: name.en vazio`)
        }
    }
})
