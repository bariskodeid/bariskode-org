/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const usersCollection = app.findCollectionByNameOrId("users");
    const coursesCollection = app.findCollectionByNameOrId("courses");

    const collection = new Collection({
        name: "certificates",
        type: "base",
        listRule: "user = @request.auth.id || @request.auth.role = 'admin'",
        viewRule: "",   // public — needed for /verify/[id]
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
        fields: [
            {
                type: "relation", name: "user",
                required: true, collectionId: usersCollection.id, maxSelect: 1,
            },
            {
                type: "relation", name: "course",
                required: true, collectionId: coursesCollection.id, maxSelect: 1,
            },
            { type: "date", name: "issued_at", required: true },
            {
                type: "file", name: "file",
                required: false, maxSize: 5242880, mimeTypes: ["application/pdf"],
            },
            { type: "bool", name: "is_valid", required: true },
        ],
    });

    app.save(collection);

}, (app) => {
    const collection = app.findCollectionByNameOrId("certificates");
    app.delete(collection);
});
