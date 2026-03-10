/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const locks = app.findCollectionByNameOrId('quiz_submission_locks');
    locks.listRule = null;
    locks.viewRule = null;
    locks.createRule = null;
    locks.updateRule = null;
    locks.deleteRule = null;
    app.save(locks);
}, (app) => {
    const locks = app.findCollectionByNameOrId('quiz_submission_locks');
    locks.listRule = "@request.auth.role = 'admin'";
    locks.viewRule = "@request.auth.role = 'admin'";
    locks.createRule = "@request.auth.role = 'admin'";
    locks.updateRule = "@request.auth.role = 'admin'";
    locks.deleteRule = "@request.auth.role = 'admin'";
    app.save(locks);
});
