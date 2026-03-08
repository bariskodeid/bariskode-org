/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const collection = new Collection({
        name: "comments",
        type: "base",
        listRule: "is_hidden = false && lesson.module.course.status = 'published'",
        viewRule: "is_hidden = false || user = @request.auth.id || @request.auth.role = 'admin'",
        createRule: "@request.auth.id != '' && @request.data.user = @request.auth.id",
        updateRule: "user = @request.auth.id",
        deleteRule: "user = @request.auth.id || @request.auth.role = 'admin'",
        fields: [
            {
                type: "relation", name: "user",
                required: true, collectionId: "_pb_users_auth_", maxSelect: 1,
            },
            {
                type: "relation", name: "lesson",
                required: true, collectionId: "lessons", maxSelect: 1,
            },
            {
                type: "relation", name: "parent",
                required: false, collectionId: "comments", maxSelect: 1,
            },
            { type: "text", name: "content", required: true, max: 2000 },
            { type: "bool", name: "is_hidden", required: true },
        ],
        indexes: [
            "CREATE INDEX idx_comments_lesson ON comments (lesson)",
            "CREATE INDEX idx_comments_parent ON comments (parent)",
        ],
    });

    app.save(collection);

}, (app) => {
    const collection = app.findCollectionByNameOrId("comments");
    app.delete(collection);
});
