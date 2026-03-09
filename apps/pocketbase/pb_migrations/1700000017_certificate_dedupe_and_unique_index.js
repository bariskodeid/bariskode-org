/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    const collection = app.findCollectionByNameOrId('certificates');
    const allCertificates = app.findAllRecords('certificates');
    const seen = new Map();

    for (const record of allCertificates) {
        const userId = record.get('user');
        const courseId = record.get('course');
        const key = `${userId}:${courseId}`;
        const existing = seen.get(key);

        if (!existing) {
            seen.set(key, record);
            continue;
        }

        const existingValid = existing.get('is_valid') !== false;
        const currentValid = record.get('is_valid') !== false;
        const existingHasFile = Boolean(existing.get('file'));
        const currentHasFile = Boolean(record.get('file'));
        const existingIssuedAt = existing.get('issued_at') || existing.created;
        const currentIssuedAt = record.get('issued_at') || record.created;

        const shouldReplace =
            (!existingValid && currentValid) ||
            (existingValid === currentValid && !existingHasFile && currentHasFile) ||
            (existingValid === currentValid &&
                existingHasFile === currentHasFile &&
                String(currentIssuedAt) < String(existingIssuedAt));

        if (shouldReplace) {
            app.delete(existing);
            seen.set(key, record);
        } else {
            app.delete(record);
        }
    }

    collection.indexes = collection.indexes ?? [];
    const uniqueIndex = 'CREATE UNIQUE INDEX idx_certificates_user_course_unique ON certificates (user, course)';
    if (!collection.indexes.includes(uniqueIndex)) {
        collection.indexes.push(uniqueIndex);
    }

    app.save(collection);
}, (app) => {
    const collection = app.findCollectionByNameOrId('certificates');
    collection.indexes = (collection.indexes ?? []).filter(
        (index) => index !== 'CREATE UNIQUE INDEX idx_certificates_user_course_unique ON certificates (user, course)'
    );

    app.save(collection);
});
