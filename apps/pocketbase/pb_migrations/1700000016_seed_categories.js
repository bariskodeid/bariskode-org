/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const categories = app.findCollectionByNameOrId("categories");

    const defaultCategories = [
        { name: "Web Development", slug: "web-development", icon: "🌐", order: 1 },
        { name: "Python", slug: "python", icon: "🐍", order: 2 },
        { name: "JavaScript", slug: "javascript", icon: "⚡", order: 3 },
        { name: "Cybersecurity", slug: "cybersecurity", icon: "🔐", order: 4 },
        { name: "Linux & Bash", slug: "linux-bash", icon: "🐧", order: 5 },
        { name: "Networking", slug: "networking", icon: "🔗", order: 6 },
        { name: "Database", slug: "database", icon: "🗄️", order: 7 },
        { name: "CTF & Pentesting", slug: "ctf-pentesting", icon: "🏴", order: 8 },
    ];

    for (const data of defaultCategories) {
        const record = new Record(categories);
        record.set("name", data.name);
        record.set("slug", data.slug);
        record.set("icon", data.icon);
        record.set("order", data.order);
        app.save(record);
    }

}, (app) => {
    const result = app.findAllRecords("categories");
    for (const record of result) {
        app.delete(record);
    }
});
