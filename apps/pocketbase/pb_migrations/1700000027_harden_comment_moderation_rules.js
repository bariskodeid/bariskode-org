/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const comments = app.findCollectionByNameOrId('comments');
    comments.viewRule = 'is_hidden = false || user = @request.auth.id';
    comments.deleteRule = 'user = @request.auth.id';
    app.save(comments);
}, (app) => {
    const comments = app.findCollectionByNameOrId('comments');
    comments.viewRule = "is_hidden = false || user = @request.auth.id || @request.auth.role = 'admin'";
    comments.deleteRule = "user = @request.auth.id || @request.auth.role = 'admin'";
    app.save(comments);
});
