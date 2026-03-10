/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const userBadges = app.findCollectionByNameOrId('user_badges');
    userBadges.listRule = 'user = @request.auth.id';
    userBadges.viewRule = 'user = @request.auth.id';
    userBadges.createRule = null;
    userBadges.updateRule = null;
    userBadges.deleteRule = null;
    app.save(userBadges);
}, (app) => {
    const userBadges = app.findCollectionByNameOrId('user_badges');
    userBadges.listRule = "user = @request.auth.id || @request.auth.role = 'admin'";
    userBadges.viewRule = "user = @request.auth.id || @request.auth.role = 'admin'";
    userBadges.createRule = "@request.auth.role = 'admin'";
    userBadges.updateRule = "@request.auth.role = 'admin'";
    userBadges.deleteRule = "@request.auth.role = 'admin'";
    app.save(userBadges);
});
