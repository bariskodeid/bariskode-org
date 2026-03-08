/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const collection = new Collection({
        name: "badges",
        type: "base",
        listRule: "",
        viewRule: "",
        createRule: "@request.auth.role = 'admin'",
        updateRule: "@request.auth.role = 'admin'",
        deleteRule: "@request.auth.role = 'admin'",
        fields: [
            { type: "text", name: "name", required: true, max: 100 },
            { type: "text", name: "description", required: true, max: 500 },
            {
                type: "file", name: "icon",
                required: false, maxSize: 1048576, mimeTypes: ["image/png", "image/svg+xml", "image/webp"],
            },
            {
                type: "select", name: "trigger_type",
                required: true,
                values: ["xp_milestone", "course_complete", "streak", "ctf_solve", "lesson_complete", "quiz_perfect"],
                maxSelect: 1,
            },
            { type: "number", name: "trigger_value", required: true, min: 1 },
            { type: "number", name: "xp_bonus", required: true, min: 0 },
        ],
    });

    app.save(collection);

}, (app) => {
    const collection = app.findCollectionByNameOrId("badges");
    app.delete(collection);
});
