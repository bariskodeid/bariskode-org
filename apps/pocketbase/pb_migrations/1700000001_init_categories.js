/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const collection = new Collection({
        name: "categories",
        type: "base",
        listRule: "",
        viewRule: "",
        createRule: "@request.auth.role = 'admin'",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
        fields: [
            { type: "text", name: "name", required: true, max: 100 },
            { type: "text", name: "slug", required: true, max: 100 },
            { type: "text", name: "icon", required: false, max: 50 },
            { type: "text", name: "description", required: false, max: 500 },
            { type: "number", name: "order", required: true, min: 0 },
        ],
        indexes: [
            "CREATE UNIQUE INDEX idx_categories_slug ON categories (slug)",
        ],
    });

    app.save(collection);

}, (app) => {
    const collection = app.findCollectionByNameOrId("categories");
    app.delete(collection);
});
