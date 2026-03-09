/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const collection = app.findCollectionByNameOrId("users");

    // Make user profiles public
    collection.listRule = "";
    collection.viewRule = "";

    // username
    collection.fields.add(new TextField({
        name: "username",
        required: true,
        max: 50,
        pattern: "^[a-z0-9_]+$",
    }));

    // role
    collection.fields.add(new SelectField({
        name: "role",
        required: true,
        values: ["student", "instructor", "admin"],
        maxSelect: 1,
    }));

    // bio
    collection.fields.add(new TextField({
        name: "bio",
        max: 500,
    }));

    // github_url
    collection.fields.add(new URLField({
        name: "github_url",
    }));

    // linkedin_url
    collection.fields.add(new URLField({
        name: "linkedin_url",
    }));

    // xp
    collection.fields.add(new NumberField({
        name: "xp",
        required: true,
        min: 0,
    }));

    // level
    collection.fields.add(new NumberField({
        name: "level",
        required: true,
        min: 1,
        max: 20,
    }));

    // streak_current
    collection.fields.add(new NumberField({
        name: "streak_current",
        required: true,
        min: 0,
    }));

    // streak_longest
    collection.fields.add(new NumberField({
        name: "streak_longest",
        required: true,
        min: 0,
    }));

    // last_active
    collection.fields.add(new DateField({
        name: "last_active",
    }));

    app.save(collection);

}, (app) => {
    const collection = app.findCollectionByNameOrId("users");
    const fields = ["role", "bio", "github_url", "linkedin_url", "xp", "level",
        "streak_current", "streak_longest", "last_active"];

    for (const name of fields) {
        const field = collection.fields.getByName(name);
        if (field) collection.fields.remove(field);
    }

    app.save(collection);
});
