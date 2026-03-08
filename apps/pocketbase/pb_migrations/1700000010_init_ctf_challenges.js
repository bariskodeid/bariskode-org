/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const collection = new Collection({
        name: "ctf_challenges",
        type: "base",
        listRule: "is_active = true && @request.auth.id != ''",
        viewRule: "is_active = true && @request.auth.id != ''",
        createRule: "@request.auth.role = 'admin'",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
        fields: [
            { type: "text", name: "title", required: true, max: 200 },
            { type: "text", name: "description", required: true },
            {
                type: "select", name: "category",
                required: true, values: ["web", "rev", "pwn", "crypto", "forensics", "osint", "misc"],
                maxSelect: 1,
            },
            {
                type: "select", name: "difficulty",
                required: true, values: ["easy", "medium", "hard", "insane"],
                maxSelect: 1,
            },
            { type: "number", name: "points", required: true, min: 1 },
            { type: "text", name: "flag_hash", required: true },
            {
                type: "file", name: "attachment",
                required: false, maxSize: 52428800,
            },
            { type: "json", name: "hints", required: false },
            { type: "bool", name: "is_active", required: true },
            { type: "number", name: "solve_count", required: true, min: 0 },
            {
                type: "relation", name: "author",
                required: false, collectionId: "_pb_users_auth_", maxSelect: 1,
            },
        ],
    });

    app.save(collection);

}, (app) => {
    const collection = app.findCollectionByNameOrId("ctf_challenges");
    app.delete(collection);
});
