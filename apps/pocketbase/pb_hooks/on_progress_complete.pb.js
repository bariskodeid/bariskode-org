/// <reference path="../pb_data/types.d.ts" />

// Hook: After user_progress record is created,
// if status is 'completed', award XP to user (secondary trigger).
// Primary XP is awarded in API routes; this is a failsafe.



onRecordAfterCreateSuccess((e) => {
    const record = e.record;
    if (record.get('status') !== 'completed') return;

    const userId = record.get('user');
    const lessonId = record.get('lesson');

    try {
        const lesson = $app.findRecordById('lessons', lessonId);
        const xpReward = lesson.get('xp_reward') ?? 10;

        const user = $app.findRecordById('users', userId);
        const newXP = (user.get('xp') ?? 0) + xpReward;

        user.set('xp', newXP);
        user.set('last_active', new Date().toISOString());
        $app.save(user);

        $app.logger().info(
            'XP awarded via hook',
            'user', userId,
            'xp', xpReward,
            'total', newXP
        );
    } catch (err) {
        $app.logger().error('XP hook error', 'error', String(err));
    }
}, 'user_progress');
