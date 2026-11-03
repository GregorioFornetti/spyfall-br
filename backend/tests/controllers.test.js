import { test } from 'node:test'
import assert from 'node:assert/strict'
import { useTempDataDir, readDataFile, fakeReq, fakeRes, seed } from './helpers.js'

test('controllers de cargos e categorias (CRUD completo)', async (t) => {
    const dir = useTempDataDir(t)
    const roles = await import('../src/db-api/controllers/RoleController.js')
    const categories = await import('../src/db-api/controllers/CategoryController.js')

    for (const [label, ctrl, name, coll] of [
        ['cargo', roles, 'roles', 'roles'],
        ['categoria', categories, 'categories', 'categories']
    ]) {
        const getAll = ctrl.getAllRoles ?? ctrl.getAllCategories
        const getById = ctrl.getRoleById ?? ctrl.getCategoryById
        const create = ctrl.createRole ?? ctrl.createCategory
        const update = ctrl.updateRole ?? ctrl.updateCategory
        const remove = ctrl.deleteRole ?? ctrl.deleteCategory

        await t.test(`${label}: listar e buscar por id`, async () => {
            let res = fakeRes()
            await getAll(fakeReq(), res)
            assert.equal(res.statusCode, 200)
            assert.deepEqual(res.body, seed[coll])

            res = fakeRes()
            await getById(fakeReq({ params: { id: String(seed[coll][0].id) } }), res)
            assert.equal(res.statusCode, 200)
            assert.deepEqual(res.body, seed[coll][0])

            res = fakeRes()
            await getById(fakeReq({ params: { id: '999' } }), res)
            assert.equal(res.statusCode, 500)
        })

        await t.test(`${label}: criar valida nome vazio e duplicado`, async () => {
            let res = fakeRes()
            await create(fakeReq({ body: { name: { pt: '', en: '' } } }), res)
            assert.equal(res.statusCode, 400)

            res = fakeRes()
            await create(fakeReq({ body: { name: { pt: seed[coll][0].name.pt, en: 'Qualquer' } } }), res)
            assert.equal(res.statusCode, 500)
            assert.match(res.body, /must be unique/)

            res = fakeRes()
            await create(fakeReq({ body: { name: { pt: 'Item de teste', en: 'Test item' } } }), res)
            assert.equal(res.statusCode, 200)
            assert.deepEqual(res.body.name, { pt: 'Item de teste', en: 'Test item' })
            assert.ok(Number.isInteger(res.body.id))
            assert.ok(readDataFile(dir, coll).some((item) => item.id === res.body.id))
            // limpa para os próximos subtestes
            await remove(fakeReq({ params: { id: String(res.body.id) } }), fakeRes())
        })

        await t.test(`${label}: atualizar renomeia e persiste; apagar remove`, async () => {
            const id = seed[coll][0].id
            let res = fakeRes()
            await update(fakeReq({ body: { name: { pt: 'Nome atualizado', en: 'Updated name' } }, params: { id: String(id) } }), res)
            assert.equal(res.statusCode, 200)
            assert.deepEqual(res.body.name, { pt: 'Nome atualizado', en: 'Updated name' })
            assert.deepEqual(readDataFile(dir, coll).find((i) => i.id === id).name, { pt: 'Nome atualizado', en: 'Updated name' })

            res = fakeRes()
            await update(fakeReq({ body: { name: { pt: '', en: '' } }, params: { id: String(id) } }), res)
            assert.equal(res.statusCode, 400)

            res = fakeRes()
            await update(fakeReq({ body: { name: { pt: 'X', en: 'X' } }, params: { id: '999' } }), res)
            assert.equal(res.statusCode, 500)

            // restaura o nome original
            await update(fakeReq({ body: { name: seed[coll][0].name }, params: { id: String(id) } }), fakeRes())

            res = fakeRes()
            await remove(fakeReq({ params: { id: String(seed[coll].at(-1).id) } }), res)
            assert.equal(res.statusCode, 200)
            assert.equal(readDataFile(dir, coll).length, seed[coll].length - 1)
        })
    }
})

test('controllers: apagar cargo/categoria remove referências dos lugares', async (t) => {
    const dir = useTempDataDir(t)
    const roles = await import('../src/db-api/controllers/RoleController.js')
    const categories = await import('../src/db-api/controllers/CategoryController.js')

    await roles.deleteRole(fakeReq({ params: { id: '10' } }), fakeRes())
    await categories.deleteCategory(fakeReq({ params: { id: '20' } }), fakeRes())

    const places = readDataFile(dir, 'places')
    assert.ok(places.every((p) => !p.rolesIds.includes(10)))
    assert.ok(places.every((p) => !p.categoriesIds.includes(20)))
    assert.deepEqual(places.find((p) => p.id === 1).rolesIds, [11])
})

test('controller de lugares (CRUD, relações e parse de ids)', async (t) => {
    const dir = useTempDataDir(t)
    const places = await import('../src/db-api/controllers/PlaceController.js')

    await t.test('listar e buscar por id', async () => {
        let res = fakeRes()
        await places.getAllPlaces(fakeReq(), res)
        assert.equal(res.statusCode, 200)
        assert.deepEqual(res.body, seed.places)

        res = fakeRes()
        await places.getPlaceById(fakeReq({ params: { id: '1' } }), res)
        assert.deepEqual(res.body, seed.places[0])

        res = fakeRes()
        await places.getPlaceById(fakeReq({ params: { id: '999' } }), res)
        assert.equal(res.statusCode, 500)
    })

    await t.test('criar com ids como string JSON (formato do formulário multipart)', async () => {
        const res = fakeRes()
        await places.createPlace(fakeReq({ body: {
            name: JSON.stringify({ pt: 'Praia', en: 'Beach' }),
            rolesIds: '[10, 13]',
            categoriesIds: '[21]'
        } }), res)
        assert.equal(res.statusCode, 200)
        assert.deepEqual(res.body, { id: 4, name: { pt: 'Praia', en: 'Beach' } })

        const stored = readDataFile(dir, 'places').find((p) => p.id === 4)
        assert.deepEqual(stored, { id: 4, name: { pt: 'Praia', en: 'Beach' }, rolesIds: [10, 13], categoriesIds: [21] })
    })

    await t.test('criar rejeita nome vazio e duplicado', async () => {
        let res = fakeRes()
        await places.createPlace(fakeReq({ body: { name: JSON.stringify({ pt: '', en: '' }), rolesIds: '[]', categoriesIds: '[]' } }), res)
        assert.equal(res.statusCode, 400)

        res = fakeRes()
        await places.createPlace(fakeReq({ body: { name: JSON.stringify({ pt: 'Casa', en: 'Outra' }), rolesIds: '[]', categoriesIds: '[]' } }), res)
        assert.equal(res.statusCode, 500)
    })

    await t.test('atualizar troca nome e relações, mantendo o restante', async () => {
        const res = fakeRes()
        await places.updatePlace(fakeReq({
            body: { name: { pt: 'Casa de praia', en: 'Beach house' }, rolesIds: '[11]', categoriesIds: '[20, 21]' },
            params: { id: '1' }
        }), res)
        assert.equal(res.statusCode, 200)
        assert.deepEqual(readDataFile(dir, 'places').find((p) => p.id === 1), {
            id: 1, name: { pt: 'Casa de praia', en: 'Beach house' }, imgPath: 'placeImgs/casa.png', rolesIds: [11], categoriesIds: [20, 21]
        })
    })

    await t.test('apagar remove o lugar; id inexistente não quebra os demais', async () => {
        let res = fakeRes()
        await places.deletePlace(fakeReq({ params: { id: '4' } }), res)
        assert.equal(res.statusCode, 200)
        assert.equal(readDataFile(dir, 'places').length, seed.places.length)

        res = fakeRes()
        await places.deletePlace(fakeReq({ params: { id: '999' } }), res)
        assert.equal(res.statusCode, 200)
        assert.equal(readDataFile(dir, 'places').length, seed.places.length)
    })
})
