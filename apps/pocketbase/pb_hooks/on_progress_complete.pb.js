/// <reference path="../pb_data/types.d.ts" />

// Hook: award XP exactly once when a progress record becomes completed.
// The xp_awards ledger prevents duplicate XP on retries/concurrent writes.

function ensureXpAward(userId, eventType, entityId, xpReward) {
    const awards = $app.findCollectionByNameOrId('xp_awards');
    const key = `${eventType}:${userId}:${entityId}`;

    try {
        $app.findFirstRecordByFilter('xp_awards', `idempotency_key = "${key}"`);
        return false;
    } catch {
        const award = new Record(awards);
        award.set('user', userId);
        award.set('event_type', eventType);
        award.set('entity_id', entityId);
        award.set('idempotency_key', key);
        award.set('xp', xpReward);
        $app.save(award);

        const user = $app.findRecordById('users', userId);
        user.set('xp', (user.get('xp') ?? 0) + xpReward);
        user.set('last_active', new Date().toISOString());
        $app.save(user);

        return true;
    }
}

function awardLessonXp(record) {
    if (record.get('status') !== 'completed') return;
    if (record.get('score') !== null && record.get('score') !== undefined) return;

    const userId = record.get('user');
    const lessonId = record.get('lesson');

    try {
        const lesson = $app.findRecordById('lessons', lessonId);
        const xpReward = lesson.get('xp_reward') ?? 10;
        ensureXpAward(userId, 'lesson_completion', lessonId, xpReward);
    } catch (err) {
        $app.logger().error('Lesson XP hook error', 'error', String(err));
    }
}

function awardQuizXp(record) {
    if (record.get('status') !== 'completed') return;

    const score = Number(record.get('score') ?? 0);
    if (score <= 0) return;

    const userId = record.get('user');
    const lessonId = record.get('lesson');

    try {
        const lesson = $app.findRecordById('lessons', lessonId);
        const baseXp = lesson.get('xp_reward') ?? 25;
        const xpReward = score === 100 ? baseXp * 2 : baseXp;
        ensureXpAward(userId, 'quiz_pass', lessonId, xpReward);
    } catch (err) {
        $app.logger().error('Quiz XP hook error', 'error', String(err));
    }
}

onRecordAfterCreateSuccess((e) => {
    const record = e.record;
    awardLessonXp(record);
    awardQuizXp(record);
}, 'user_progress');

onRecordAfterUpdateSuccess((e) => {
    const record = e.record;
    awardLessonXp(record);
    awardQuizXp(record);
}, 'user_progress');
