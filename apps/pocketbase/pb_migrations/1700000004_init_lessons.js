/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const collection = new Collection({
        name: "lessons",
        type: "base",
        listRule: "(status = 'published' && module.course.status = 'published') || module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
        viewRule: "(status = 'published' && module.course.status = 'published' && @request.auth.id != '') || module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
        createRule: "module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
        updateRule: "module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
        deleteRule: "module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
        fields: [
            { type: "text", name: "title", required: true, max: 200 },
            { type: "text", name: "slug", required: true, max: 200 },
            {
                type: "relation", name: "module",
                required: true, collectionId: "modules", maxSelect: 1,
            },
            {
                type: "select", name: "type",
                required: true, values: ["reading", "video", "quiz", "coding"], maxSelect: 1,
            },
            { type: "text", name: "content", required: false },
            { type: "url", name: "video_url", required: false },
            { type: "text", name: "starter_code", required: false },
            { type: "text", name: "expected_output", required: false },
            { type: "number", name: "xp_reward", required: true, min: 0 },
            { type: "number", name: "order", required: true, min: 0 },
            {
                type: "select", name: "status",
                required: true, values: ["draft", "published"], maxSelect: 1,
            },
            { type: "number", name: "estimated_minutes", required: false, min: 0 },
            { type: "number", name: "passing_score", required: false, min: 0, max: 100 },
            { type: "number", name: "max_attempts", required: false, min: 0 },
        ],
        indexes: [
            "CREATE INDEX idx_lessons_module_order ON lessons (module, `order`)",
        ],
    });

    app.save(collection);

}, (app) => {
    const collection = app.findCollectionByNameOrId("lessons");
    app.delete(collection);
});
