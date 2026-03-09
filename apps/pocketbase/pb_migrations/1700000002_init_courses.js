/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    // Look up related collection IDs
    const usersCollection = app.findCollectionByNameOrId("users");
    const categoriesCollection = app.findCollectionByNameOrId("categories");

    const collection = new Collection({
        name: "courses",
        type: "base",
        listRule: "status = 'published' || @request.auth.role = 'instructor' || @request.auth.role = 'admin'",
        viewRule: "status = 'published' || instructor = @request.auth.id || @request.auth.role = 'admin'",
        createRule: "@request.auth.role = 'instructor' || @request.auth.role = 'admin'",
        updateRule: "instructor = @request.auth.id || @request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
        fields: [
            { type: "text", name: "title", required: true, max: 200 },
            { type: "text", name: "slug", required: true, max: 200 },
            { type: "text", name: "description", required: true, max: 2000 },
            {
                type: "relation", name: "instructor",
                required: true, collectionId: usersCollection.id, maxSelect: 1,
            },
            {
                type: "relation", name: "category",
                required: true, collectionId: categoriesCollection.id, maxSelect: 1,
            },
            {
                type: "select", name: "difficulty",
                required: true, values: ["beginner", "intermediate", "advanced"], maxSelect: 1,
            },
            { type: "json", name: "tags", required: false },
            { type: "file", name: "thumbnail", required: false, maxSize: 2097152, mimeTypes: ["image/jpeg", "image/png", "image/webp"] },
            {
                type: "select", name: "status",
                required: true, values: ["draft", "published"], maxSelect: 1,
            },
            { type: "number", name: "estimated_hours", required: false, min: 0 },
            { type: "number", name: "total_lessons", required: false, min: 0 },
            { type: "number", name: "enrolled_count", required: false, min: 0 },
        ],
        indexes: [
            "CREATE UNIQUE INDEX idx_courses_slug ON courses (slug)",
        ],
    });

    app.save(collection);

}, (app) => {
    const collection = app.findCollectionByNameOrId("courses");
    app.delete(collection);
});
