/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const coursesCollection = app.findCollectionByNameOrId("courses");
    const collection = new Collection({
        name: "modules",
        type: "base",
        listRule: "course.status = 'published' || course.instructor = @request.auth.id || @request.auth.role = 'admin'",
        viewRule: "course.status = 'published' || course.instructor = @request.auth.id || @request.auth.role = 'admin'",
        createRule: "course.instructor = @request.auth.id || @request.auth.role = 'admin'",
        updateRule: "course.instructor = @request.auth.id || @request.auth.role = 'admin'",
        deleteRule: "course.instructor = @request.auth.id || @request.auth.role = 'admin'",
        fields: [
            { type: "text", name: "title", required: true, max: 200 },
            {
                type: "relation", name: "course",
                required: true, collectionId: coursesCollection.id, maxSelect: 1,
            },
            { type: "number", name: "order", required: true, min: 0 },
            { type: "text", name: "description", required: false, max: 1000 },
        ],
        indexes: [
            "CREATE INDEX idx_modules_course_order ON modules (course, `order`)",
        ],
    });

    app.save(collection);

}, (app) => {
    const collection = app.findCollectionByNameOrId("modules");
    app.delete(collection);
});
