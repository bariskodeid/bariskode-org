/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const badges = app.findCollectionByNameOrId("badges");

    const defaultBadges = [
        { name: "First Step", description: "Selesaikan lesson pertama", trigger_type: "lesson_complete", trigger_value: 1, xp_bonus: 10 },
        { name: "Quick Learner", description: "Selesaikan 10 lessons", trigger_type: "lesson_complete", trigger_value: 10, xp_bonus: 50 },
        { name: "Scholar", description: "Selesaikan 50 lessons", trigger_type: "lesson_complete", trigger_value: 50, xp_bonus: 150 },
        { name: "Quiz Passed", description: "Lulus quiz pertama", trigger_type: "quiz_perfect", trigger_value: 1, xp_bonus: 25 },
        { name: "Quiz Master", description: "Raih nilai 100% di 5 quiz", trigger_type: "quiz_perfect", trigger_value: 5, xp_bonus: 100 },
        { name: "On Fire", description: "Belajar 7 hari berturut-turut", trigger_type: "streak", trigger_value: 7, xp_bonus: 50 },
        { name: "Unstoppable", description: "Belajar 30 hari berturut-turut", trigger_type: "streak", trigger_value: 30, xp_bonus: 200 },
        { name: "Course Graduate", description: "Selesaikan 1 kursus", trigger_type: "course_complete", trigger_value: 1, xp_bonus: 100 },
        { name: "Multi-Tasker", description: "Selesaikan 5 kursus", trigger_type: "course_complete", trigger_value: 5, xp_bonus: 300 },
        { name: "Flag Planter", description: "Solve CTF challenge pertama", trigger_type: "ctf_solve", trigger_value: 1, xp_bonus: 25 },
        { name: "CTF Veteran", description: "Solve 10 CTF challenges", trigger_type: "ctf_solve", trigger_value: 10, xp_bonus: 200 },
        { name: "CTF Legend", description: "Solve 50 CTF challenges", trigger_type: "ctf_solve", trigger_value: 50, xp_bonus: 500 },
        { name: "XP Rookie", description: "Kumpulkan 1.000 XP", trigger_type: "xp_milestone", trigger_value: 1000, xp_bonus: 50 },
        { name: "XP Hunter", description: "Kumpulkan 10.000 XP", trigger_type: "xp_milestone", trigger_value: 10000, xp_bonus: 200 },
    ];

    for (const data of defaultBadges) {
        const record = new Record(badges);
        record.set("name", data.name);
        record.set("description", data.description);
        record.set("trigger_type", data.trigger_type);
        record.set("trigger_value", data.trigger_value);
        record.set("xp_bonus", data.xp_bonus);
        app.save(record);
    }

}, (app) => {
    const result = app.findAllRecords("badges");
    for (const record of result) {
        app.delete(record);
    }
});
