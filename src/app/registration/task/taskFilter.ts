export type TaskFilterEnum = 'CLAIMED_TASKS' | 'UNCLAIMED_TASKS' | 'ALL_TASKS';

export const TaskFilters = {
    CLAIMED_TASKS: 'CLAIMED_TASKS' as TaskFilterEnum,
    UNCLAIMED_TASKS: 'UNCLAIMED_TASKS' as TaskFilterEnum,
    ALL_TASKS: 'ALL_TASKS' as TaskFilterEnum,
};
