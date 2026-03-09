/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const usersCollection = app.findCollectionByNameOrId("users");
    const lessonsCollection = app.findCollectionByNameOrId("lessons");

    const collection = new Collection({
        name: "comments",
        type: "base",
        listRule: "is_hidden = false && lesson.module.course.status = 'published'",
        viewRule: "is_hidden = false || user = @request.auth.id || @request.auth.role = 'admin'",
        createRule: "@request.auth.id != '' && user = @request.auth.id",
        updateRule: "user = @request.auth.id",
        deleteRule: "user = @request.auth.id || @request.auth.role = 'admin'",
        fields: [
            {
                type: "relation", name: "user",
                required: true, collectionId: usersCollection.id, maxSelect: 1,
            },
            {
                type: "relation", name: "lesson",
                required: true, collectionId: lessonsCollection.id, maxSelect: 1,
            },
            { type: "text", name: "content", required: true, max: 2000 },
            { type: "bool", name: "is_hidden", required: true },
        ],
        indexes: [
            "CREATE INDEX idx_comments_lesson ON comments (lesson)",
        ],
    });

    app.save(collection);

    // Add self-referencing parent field after collection exists
    collection.fields.add(new RelationField({
        name: "parent",
        required: false,
        collectionId: collection.id,
        maxSelect: 1,
    }));

    collection.indexes.push("CREATE INDEX idx_comments_parent ON comments (parent)");
    app.save(collection);

}, (app) => {
    const collection = app.findCollectionByNameOrId("comments");
    app.delete(collection);
});
