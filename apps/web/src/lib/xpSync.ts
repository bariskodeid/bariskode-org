export type XpSyncSource = 'already_completed' | 'pocketbase_hook_pending';

export interface XpSyncState {
    awarded: number | null;
    source: XpSyncSource;
}

export function getXpSyncState(alreadyCompleted: boolean): XpSyncState {
    if (alreadyCompleted) {
        return {
            awarded: 0,
            source: 'already_completed',
        };
    }

    return {
        awarded: null,
        source: 'pocketbase_hook_pending',
    };
}
