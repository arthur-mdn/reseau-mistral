const Price = require('../models/Price');

const pricesToInsert = [
    {
        title: '1 voyage Terrestre',
        type: 'terrestre',
        multiple: 1,
        maxUse: 1,
        maxTime: '1 hour',
        price: 1.4,
        description: '- Pour tous\n- Occasionnellement\nAstuce! En achetant un titre de 10 voyages, j\'économise 4€',
        image: '/1voyageterrestre.webp',
        status: 'ok',
    },
    {
        title: '1 voyage Maritime',
        type: 'maritime',
        multiple: 1,
        maxUse: 1,
        maxTime: '1 hour',
        price: 2,
        description: '- Pour tous\n- Occasionnellement\nAstuce! En achetant un titre de 10 voyages, j\'économise 4€',
        image: '/1voyagemaritime.webp',
        status: 'ok',
    },
    {
        title: '10 voyages',
        type: 'terrestre',
        multiple: 10,
        maxUse: 1,
        maxTime: '1 hour',
        price: 10,
        description: '- Pour tous\n- Occasionnellement\nNombre de voyage : 10',
        image: '/10voyages.webp',
        status: 'ok',
    },
];

async function insertPricesIfNotExist() {
    for (const price of pricesToInsert) {
        const { image, ...rest } = price;
        await Price.findOneAndUpdate(
            { title: price.title },
            { $setOnInsert: rest, $set: { image } },
            { upsert: true, returnDocument: 'after' }
        );
    }
    console.log('Prices seeded');
}

module.exports = insertPricesIfNotExist;
