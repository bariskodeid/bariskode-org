/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const ctfSolves = app.findCollectionByNameOrId('ctf_solves');
    ctfSolves.createRule = null;
    ctfSolves.updateRule = null;
    ctfSolves.deleteRule = null;
    app.save(ctfSolves);
}, (app) => {
    const ctfSolves = app.findCollectionByNameOrId('ctf_solves');
    ctfSolves.createRule = "@request.auth.role = 'admin'";
    ctfSolves.updateRule = "@request.auth.role = 'admin'";
    ctfSolves.deleteRule = "@request.auth.role = 'admin'";
    app.save(ctfSolves);
});
