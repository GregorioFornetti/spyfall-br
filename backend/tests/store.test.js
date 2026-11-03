import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { useTempDataDir, readDataFile, seed } from './helpers.js'

test('store: leitura, escrita atômica e utilitários', async (t) => {
    const dir = useTempDataDir(t)
    const store = await import('../src/db-api/models/store.js')
    const getters = await import('../src/db-api/models/getters.js')

    await t.test('getCollection lê os arquivos JSON semeados', async () => {
        assert.deepEqual(await store.getCollection('roles'), seed.roles)
        assert.deepEqual(await store.getCollection('categories'), seed.categories)
    })

    await t.test('getters expõem os dados no formato da API', async () => {
        assert.deepEqual(await getters.getRoles(), seed.roles)
        assert.deepEqual(await getters.getCategories(), seed.categories)
        assert.deepEqual(await getters.getPlaces(), seed.places)
        assert.deepEqual(await getters.getPlaceRoles(1), [10, 11])
        await assert.rejects(() => getters.getPlaceRoles(999), /No item found with id 999/)
    })

    await t.test('updateCollection salva o arquivo e devolve o retorno do updater', async () => {
        const created = await store.updateCollection('roles', (roles) => {
            const role = { id: store.nextId(roles), name: { pt: 'Novo cargo', en: 'New role' } }
            roles.push(role)
            return role
        })
        assert.deepEqual(created, { id: 14, name: { pt: 'Novo cargo', en: 'New role' } })
        assert.deepEqual(readDataFile(dir, 'roles').at(-1), created)
        // escrita atômica não deixa arquivo temporário para trás
        assert.equal(fs.existsSync(path.join(dir, 'roles.json.tmp')), false)
    })

    await t.test('erro dentro do updater não salva nada', async () => {
        const before = readDataFile(dir, 'roles')
        await assert.rejects(
            store.updateCollection('roles', () => { throw new Error('falhou') }),
            /falhou/
        )
        assert.deepEqual(readDataFile(dir, 'roles'), before)
    })

    await t.test('escritas concorrentes não perdem itens (fila de escrita)', async () => {
        await Promise.all(Array.from({ length: 5 }, (_, i) =>
            store.updateCollection('categories', (categories) => {
                categories.push({ id: store.nextId(categories), name: { pt: `Categoria ${i}`, en: `Category ${i}` } })
            })
        ))
        const categories = readDataFile(dir, 'categories')
        assert.equal(categories.length, seed.categories.length + 5)
        assert.equal(new Set(categories.map((c) => c.id)).size, categories.length)
    })

    await t.test('removePlaceReferences remove o id de todos os lugares', async () => {
        await store.removePlaceReferences('rolesIds', 10)
        const places = readDataFile(dir, 'places')
        assert.ok(places.every((place) => !place.rolesIds.includes(10)))
        assert.deepEqual(places.find((p) => p.id === 2).rolesIds, [12])
    })
})

test('store: utilitários puros', async (t) => {
    useTempDataDir(t)
    const { nextId, assertUniqueName, findById } = await import('../src/db-api/models/store.js')

    assert.equal(nextId([]), 1)
    assert.equal(nextId([{ id: 3 }, { id: 9 }, { id: 4 }]), 10)

    assert.doesNotThrow(() => assertUniqueName(seed.roles, { pt: 'Inexistente', en: 'Nonexistent' }))
    assert.doesNotThrow(() => assertUniqueName(seed.roles, { pt: 'Piloto', en: 'Pilot' }, 10))
    assert.throws(() => assertUniqueName(seed.roles, { pt: 'Piloto', en: 'Pilot' }), /must be unique/)
    assert.throws(() => assertUniqueName(seed.roles, { pt: 'Outro', en: 'Pilot' }), /must be unique/)
    assert.throws(() => assertUniqueName(seed.roles, { pt: 'Piloto', en: 'Pilot' }, 11), /must be unique/)

    assert.deepEqual(findById(seed.roles, 11).name, { pt: 'Morador', en: 'Resident' })
    assert.throws(() => findById(seed.roles, 999), /No item found with id 999/)
})
