/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const progress = app.findCollectionByNameOrId('user_progress');
    progress.listRule = 'user = @request.auth.id';
    progress.viewRule = 'user = @request.auth.id';
    progress.createRule = null;
    progress.updateRule = null;
    progress.deleteRule = null;
    app.save(progress);

    const certificates = app.findCollectionByNameOrId('certificates');
    certificates.listRule = 'user = @request.auth.id && is_valid = true';
    certificates.viewRule = 'user = @request.auth.id && is_valid = true';
    certificates.createRule = null;
    certificates.updateRule = null;
    certificates.deleteRule = null;
    app.save(certificates);

    const xpAwards = app.findCollectionByNameOrId('xp_awards');
    xpAwards.listRule = 'user = @request.auth.id';
    xpAwards.viewRule = 'user = @request.auth.id';
    xpAwards.createRule = null;
    xpAwards.updateRule = null;
    xpAwards.deleteRule = null;
    app.save(xpAwards);
}, (app) => {
    const progress = app.findCollectionByNameOrId('user_progress');
    progress.listRule = "user = @request.auth.id || @request.auth.role = 'admin'";
    progress.viewRule = "user = @request.auth.id || @request.auth.role = 'admin'";
    progress.createRule = "@request.auth.role = 'admin'";
    progress.updateRule = "@request.auth.role = 'admin'";
    progress.deleteRule = "@request.auth.role = 'admin'";
    app.save(progress);

    const certificates = app.findCollectionByNameOrId('certificates');
    certificates.listRule = "user = @request.auth.id || @request.auth.role = 'admin'";
    certificates.viewRule = "user = @request.auth.id || @request.auth.role = 'admin'";
    certificates.createRule = "@request.auth.role = 'admin'";
    certificates.updateRule = "@request.auth.role = 'admin'";
    certificates.deleteRule = "@request.auth.role = 'admin'";
    app.save(certificates);

    const xpAwards = app.findCollectionByNameOrId('xp_awards');
    xpAwards.listRule = "user = @request.auth.id || @request.auth.role = 'admin'";
    xpAwards.viewRule = "user = @request.auth.id || @request.auth.role = 'admin'";
    xpAwards.createRule = "@request.auth.role = 'admin'";
    xpAwards.updateRule = "@request.auth.role = 'admin'";
    xpAwards.deleteRule = "@request.auth.role = 'admin'";
    app.save(xpAwards);
});
