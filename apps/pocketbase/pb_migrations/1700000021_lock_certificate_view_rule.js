/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const certificates = app.findCollectionByNameOrId('certificates');
    certificates.viewRule = "user = @request.auth.id || @request.auth.role = 'admin'";
    app.save(certificates);
}, (app) => {
    const certificates = app.findCollectionByNameOrId('certificates');
    certificates.viewRule = "";
    app.save(certificates);
});
