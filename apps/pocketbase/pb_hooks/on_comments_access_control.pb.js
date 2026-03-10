/// <reference path="../pb_data/types.d.ts" />

const SELF_SERVICE_LOCKED_COMMENT_FIELDS = [
    'user',
    'lesson',
    'parent',
    'is_hidden',
];

function isCommentsCollection(e) {
    return e.collection && e.collection.name === 'comments';
}

function isSuperuserRequest(e) {
    const requestInfo = e.requestInfo();
    return Boolean(requestInfo.hasSuperuserAuth && requestInfo.hasSuperuserAuth());
}

function hasUnexpectedCommentCreateValues(record, requestInfo) {
    return (
        record.get('user') !== requestInfo.auth?.id
        || Boolean(record.get('is_hidden'))
    );
}

function validateCommentCreateRelations(record) {
    const lessonId = record.get('lesson');
    const parentId = record.get('parent');

    if (!lessonId) {
        throw new BadRequestError('Comment lesson is required');
    }

    const lesson = $app.findRecordById('lessons', lessonId);
    if (lesson.get('status') !== 'published') {
        throw new ForbiddenError('Cannot comment on unpublished lessons');
    }

    const module = $app.findRecordById('modules', lesson.get('module'));
    const course = $app.findRecordById('courses', module.get('course'));
    if (course.get('status') !== 'published') {
        throw new ForbiddenError('Cannot comment on unpublished courses');
    }

    if (!parentId) {
        return;
    }

    const parent = $app.findRecordById('comments', parentId);
    if (parent.get('lesson') !== lessonId) {
        throw new BadRequestError('Reply must belong to the same lesson');
    }

    if (parent.get('is_hidden')) {
        throw new ForbiddenError('Cannot reply to hidden comments');
    }

    if (parent.get('parent')) {
        throw new BadRequestError('Comment nesting depth exceeded');
    }
}

function hasLockedCommentFieldChanges(record) {
    const original = record.original();

    return SELF_SERVICE_LOCKED_COMMENT_FIELDS.some((field) => record.get(field) !== original.get(field));
}

onRecordCreateRequest((e) => {
    if (!isCommentsCollection(e) || !e.record) {
        return e.next();
    }

    if (isSuperuserRequest(e)) {
        return e.next();
    }

    const requestInfo = e.requestInfo();
    if (!requestInfo.auth?.id) {
        return e.next();
    }

    if (hasUnexpectedCommentCreateValues(e.record, requestInfo)) {
        throw new ForbiddenError('Cannot set privileged comment fields');
    }

    validateCommentCreateRelations(e.record);

    return e.next();
}, 'comments');

onRecordUpdateRequest((e) => {
    if (!isCommentsCollection(e) || !e.record) {
        return e.next();
    }

    if (isSuperuserRequest(e)) {
        return e.next();
    }

    const requestInfo = e.requestInfo();
    const auth = requestInfo.auth;
    const isOwnerUpdate = auth && auth.id === e.record.get('user');

    if (!isOwnerUpdate) {
        return e.next();
    }

    if (hasLockedCommentFieldChanges(e.record)) {
        throw new ForbiddenError('Cannot modify privileged comment fields');
    }

    return e.next();
}, 'comments');
