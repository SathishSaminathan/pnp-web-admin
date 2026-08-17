const fs = require('fs');
const sdk = require('postman-collection');

const coll = new sdk.Collection(JSON.parse(fs.readFileSync('Meralot Merchants Admin API.postman_collection.json').toString()));

const routes = [];

coll.forEachItem({
    actions: function(item) {
        if (item.request) {
            routes.push({
                name: item.name,
                method: item.request.method,
                url: item.request.url.getPath(),
                folder: item.parent() ? item.parent().name : 'Root'
            });
        }
    }
});

const grouped = routes.reduce((acc, route) => {
    if (!acc[route.folder]) acc[route.folder] = [];
    acc[route.folder].push(`${route.method} ${route.url}`);
    return acc;
}, {});

Object.keys(grouped).forEach(folder => {
    console.log(`\n=== ${folder} ===`);
    grouped[folder].forEach(r => console.log(r));
});
