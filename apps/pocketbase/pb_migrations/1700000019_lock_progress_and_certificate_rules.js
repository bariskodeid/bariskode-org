/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const progress = app.findCollectionByNameOrId('user_progress');
    progress.createRule = "@request.auth.role = 'admin'";
    progress.updateRule = "@request.auth.role = 'admin'";
    app.save(progress);

    const certificates = app.findCollectionByNameOrId('certificates');
    certificates.createRule = "@request.auth.role = 'admin'";
    certificates.updateRule = "@request.auth.role = 'admin'";
    app.save(certificates);
}, (app) => {
    const progress = app.findCollectionByNameOrId('user_progress');
    progress.createRule = "@request.auth.id != '' && user = @request.auth.id";
    progress.updateRule = "user = @request.auth.id";
    app.save(progress);

    const certificates = app.findCollectionByNameOrId('certificates');
    certificates.createRule = "@request.auth.id != ''";
    certificates.updateRule = "@request.auth.role = 'admin'";
    app.save(certificates);
});
