/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const collection = new Collection({
        name: "quiz_questions",
        type: "base",
        listRule: "lesson.module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
        viewRule: "lesson.module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
        createRule: "lesson.module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
        updateRule: "lesson.module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
        deleteRule: "lesson.module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
        fields: [
            {
                type: "relation", name: "lesson",
                required: true, collectionId: "lessons", maxSelect: 1,
            },
            { type: "text", name: "question", required: true, max: 1000 },
            {
                type: "select", name: "type",
                required: true, values: ["multiple_choice", "true_false"], maxSelect: 1,
            },
            { type: "json", name: "options", required: true },
            { type: "text", name: "explanation", required: false, max: 1000 },
            { type: "number", name: "order", required: true, min: 0 },
        ],
    });

    app.save(collection);

}, (app) => {
    const collection = app.findCollectionByNameOrId("quiz_questions");
    app.delete(collection);
});
