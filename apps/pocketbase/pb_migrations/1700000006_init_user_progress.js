/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const collection = new Collection({
        name: "user_progress",
        type: "base",
        listRule: "user = @request.auth.id || @request.auth.role = 'admin'",
        viewRule: "user = @request.auth.id || @request.auth.role = 'admin'",
        createRule: "@request.auth.id != '' && @request.data.user = @request.auth.id",
        updateRule: "user = @request.auth.id",
        deleteRule: "@request.auth.role = 'admin'",
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
                type: "select", name: "status",
                required: true, values: ["started", "completed"], maxSelect: 1,
            },
            { type: "number", name: "score", required: false, min: 0, max: 100 },
            { type: "number", name: "attempts", required: true, min: 0 },
            { type: "date", name: "completed_at", required: false },
        ],
        indexes: [
            "CREATE UNIQUE INDEX idx_user_progress_unique ON user_progress (user, lesson)",
            "CREATE INDEX idx_user_progress_user ON user_progress (user)",
        ],
    });

    app.save(collection);

}, (app) => {
    const collection = app.findCollectionByNameOrId("user_progress");
    app.delete(collection);
});
