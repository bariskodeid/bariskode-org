/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const collection = new Collection({
        name: "ctf_solves",
        type: "base",
        listRule: "@request.auth.id != ''",
        viewRule: "user = @request.auth.id || @request.auth.role = 'admin'",
        createRule: "@request.auth.role = 'admin'",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
        fields: [
            {
                type: "relation", name: "user",
                required: true, collectionId: "_pb_users_auth_", maxSelect: 1,
            },
            {
                type: "relation", name: "challenge",
                required: true, collectionId: "ctf_challenges", maxSelect: 1,
            },
            { type: "number", name: "points_earned", required: true, min: 0 },
            { type: "number", name: "hints_used", required: true, min: 0 },
            { type: "number", name: "points_deducted", required: true, min: 0 },
            { type: "date", name: "solved_at", required: true },
        ],
        indexes: [
            "CREATE UNIQUE INDEX idx_ctf_solves_unique ON ctf_solves (user, challenge)",
            "CREATE INDEX idx_ctf_solves_user ON ctf_solves (user)",
        ],
    });

    app.save(collection);

}, (app) => {
    const collection = app.findCollectionByNameOrId("ctf_solves");
    app.delete(collection);
});
