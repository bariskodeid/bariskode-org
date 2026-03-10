/// <reference path="../pb_data/types.d.ts" />

const SELF_SERVICE_LOCKED_USER_FIELDS = [
    'role',
    'xp',
    'level',
    'streak_current',
    'streak_longest',
    'last_active',
];

function isUsersCollection(e) {
    return e.collection && e.collection.name === 'users';
}

function hasLockedUserFieldChanges(record) {
    const original = record.original();

    return SELF_SERVICE_LOCKED_USER_FIELDS.some((field) => record.get(field) !== original.get(field));
}

function isSuperuserRequest(e) {
    const requestInfo = e.requestInfo();
    return Boolean(requestInfo.hasSuperuserAuth && requestInfo.hasSuperuserAuth());
}

function hasUnexpectedPrivilegedUserCreateValues(record) {
    return (
        record.get('role') !== 'student'
        || Number(record.get('xp') ?? 0) !== 0
        || Number(record.get('level') ?? 1) !== 1
        || Number(record.get('streak_current') ?? 0) !== 0
        || Number(record.get('streak_longest') ?? 0) !== 0
        || Boolean(record.get('last_active'))
    );
}

onRecordCreateRequest((e) => {
    if (!isUsersCollection(e) || !e.record) {
        return e.next();
    }

    if (isSuperuserRequest(e)) {
        return e.next();
    }

    if (hasUnexpectedPrivilegedUserCreateValues(e.record)) {
        throw new ForbiddenError('Cannot set privileged user fields');
    }

    return e.next();
}, 'users');

onRecordUpdateRequest((e) => {
    if (!isUsersCollection(e) || !e.record) {
        return e.next();
    }

    const requestInfo = e.requestInfo();
    const auth = requestInfo.auth;
    const isSelfServiceUpdate = auth && auth.id === e.record.id;

    if (!isSelfServiceUpdate) {
        return e.next();
    }

    if (isSuperuserRequest(e)) {
        return e.next();
    }

    if (hasLockedUserFieldChanges(e.record)) {
        throw new ForbiddenError('Cannot modify privileged user fields');
    }

    return e.next();
}, 'users');
