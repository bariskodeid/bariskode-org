/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const usersCollection = app.findCollectionByNameOrId('users');

    const collection = new Collection({
        name: 'xp_awards',
        type: 'base',
        listRule: "user = @request.auth.id || @request.auth.role = 'admin'",
        viewRule: "user = @request.auth.id || @request.auth.role = 'admin'",
        createRule: "@request.auth.role = 'admin'",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
        fields: [
            {
                type: 'relation', name: 'user',
                required: true, collectionId: usersCollection.id, maxSelect: 1,
            },
            {
                type: 'select', name: 'event_type',
                required: true, values: ['lesson_completion', 'quiz_pass'], maxSelect: 1,
            },
            { type: 'text', name: 'entity_id', required: true, max: 32 },
            { type: 'text', name: 'idempotency_key', required: true, max: 120 },
            { type: 'number', name: 'xp', required: true, min: 1 },
        ],
        indexes: [
            'CREATE UNIQUE INDEX idx_xp_awards_idempotency_key ON xp_awards (idempotency_key)',
            'CREATE INDEX idx_xp_awards_user_created ON xp_awards (user, created)',
        ],
    });

    app.save(collection);
}, (app) => {
    const collection = app.findCollectionByNameOrId('xp_awards');
    app.delete(collection);
});
