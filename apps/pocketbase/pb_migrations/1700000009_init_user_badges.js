/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const usersCollection = app.findCollectionByNameOrId("users");
    const badgesCollection = app.findCollectionByNameOrId("badges");

    const collection = new Collection({
        name: "user_badges",
        type: "base",
        listRule: "user = @request.auth.id || @request.auth.role = 'admin'",
        viewRule: "user = @request.auth.id || @request.auth.role = 'admin'",
        createRule: "@request.auth.role = 'admin'",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
        fields: [
            {
                type: "relation", name: "user",
                required: true, collectionId: usersCollection.id, maxSelect: 1,
            },
            {
                type: "relation", name: "badge",
                required: true, collectionId: badgesCollection.id, maxSelect: 1,
            },
            { type: "date", name: "earned_at", required: true },
        ],
        indexes: [
            "CREATE UNIQUE INDEX idx_user_badges_unique ON user_badges (user, badge)",
        ],
    });

    app.save(collection);

}, (app) => {
    const collection = app.findCollectionByNameOrId("user_badges");
    app.delete(collection);
});
