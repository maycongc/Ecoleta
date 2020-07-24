import Knex from 'knex'

export async function seed (knex: Knex) {
    await knex('items').insert([
        { title: 'Papéis e Papelão', image: 'papeis-papelao.svg' },
        { title: 'Resíduos Orgânicos', image: 'organicos.svg' },
        { title: 'Óleo de Cozinha', image: 'oleo.svg' },
        { title: 'Lâmpadas', image: 'lampadas.svg' },
        { title: 'Pilhas e Baterias', image: 'baterias.svg' },
        { title: 'Resíduos Eletrônicos', image: 'eletronicos.svg' },
    ])
}