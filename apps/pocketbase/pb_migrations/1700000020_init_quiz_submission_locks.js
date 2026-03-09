/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const usersCollection = app.findCollectionByNameOrId('users');
    const lessonsCollection = app.findCollectionByNameOrId('lessons');

    const collection = new Collection({
        name: 'quiz_submission_locks',
        type: 'base',
        listRule: "@request.auth.role = 'admin'",
        viewRule: "@request.auth.role = 'admin'",
        createRule: "@request.auth.role = 'admin'",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
        fields: [
            {
                type: 'relation', name: 'user',
                required: true, collectionId: usersCollection.id, maxSelect: 1,
            },
            {
                type: 'relation', name: 'lesson',
                required: true, collectionId: lessonsCollection.id, maxSelect: 1,
            },
            { type: 'text', name: 'key', required: true, max: 64 },
        ],
        indexes: [
            'CREATE UNIQUE INDEX idx_quiz_submission_locks_key ON quiz_submission_locks (key)',
        ],
    });

    app.save(collection);
}, (app) => {
    const collection = app.findCollectionByNameOrId('quiz_submission_locks');
    app.delete(collection);
});
