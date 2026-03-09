import { describe, expect, it } from 'vitest';

import { getXpSyncState } from './xpSync';

describe('getXpSyncState', () => {
    it('returns already completed XP state when completion was previously recorded', () => {
        expect(getXpSyncState(true)).toEqual({
            awarded: 0,
            source: 'already_completed',
        });
    });

    it('returns pending sync XP state for first completion transitions', () => {
        expect(getXpSyncState(false)).toEqual({
            awarded: null,
            source: 'pocketbase_hook_pending',
        });
    });
});
