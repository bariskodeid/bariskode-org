/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const badges = app.findCollectionByNameOrId('badges');
    badges.createRule = null;
    badges.updateRule = null;
    badges.deleteRule = null;
    app.save(badges);
}, (app) => {
    const badges = app.findCollectionByNameOrId('badges');
    badges.createRule = "@request.auth.role = 'admin'";
    badges.updateRule = "@request.auth.role = 'admin'";
    badges.deleteRule = "@request.auth.role = 'admin'";
    app.save(badges);
});
