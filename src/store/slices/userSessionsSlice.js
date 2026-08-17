import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userSessionsApi } from '../../api/modules/userSessions';

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchUserSessions = createAsyncThunk(
    'userSessions/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const res = await userSessionsApi.getAll(params);
            if (res.success) return { data: res.data ?? [], meta: res.meta ?? {} };
            return rejectWithValue(res.message || 'Failed to load sessions');
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to load sessions');
        }
    }
);

export const fetchUserSessionDetail = createAsyncThunk(
    'userSessions/fetchDetail',
    async (id, { rejectWithValue }) => {
        try {
            const res = await userSessionsApi.getById(id);
            if (res.success) return res.data ?? null;
            return rejectWithValue(res.message || 'Failed to load session detail');
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to load session detail');
        }
    }
);

export const terminateUserSession = createAsyncThunk(
    'userSessions/terminate',
    async (id, { rejectWithValue }) => {
        try {
            const res = await userSessionsApi.terminate(id);
            if (res.success) return { id, data: res.data };
            return rejectWithValue(res.message || 'Failed to terminate session');
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to terminate session');
        }
    }
);

export const terminateAllUserSessions = createAsyncThunk(
    'userSessions/terminateAll',
    async ({ userId, reason }, { rejectWithValue }) => {
        try {
            const res = await userSessionsApi.terminateAll(userId, reason);
            if (res.success) return { userId, data: res.data };
            return rejectWithValue(res.message || 'Failed to terminate sessions');
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to terminate sessions');
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const userSessionsSlice = createSlice({
    name: 'userSessions',
    initialState: {
        list: [],
        meta: {},
        listLoading: false,
        listError: null,

        detail: null,
        detailLoading: false,
        detailError: null,

        actionLoading: false,
        actionError: null,
    },
    reducers: {
        clearDetail(state) {
            state.detail = null;
            state.detailError = null;
        },
        clearActionError(state) {
            state.actionError = null;
        },
        patchListItem(state, action) {
            const { id, changes } = action.payload;
            const idx = state.list.findIndex((s) => s._id === id);
            if (idx !== -1) state.list[idx] = { ...state.list[idx], ...changes };
            if (state.detail?._id === id) state.detail = { ...state.detail, ...changes };
        },
    },
    extraReducers: (builder) => {
        // List
        builder
            .addCase(fetchUserSessions.pending, (state) => { state.listLoading = true; state.listError = null; })
            .addCase(fetchUserSessions.fulfilled, (state, action) => {
                state.listLoading = false;
                state.list = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(fetchUserSessions.rejected, (state, action) => { state.listLoading = false; state.listError = action.payload; });

        // Detail
        builder
            .addCase(fetchUserSessionDetail.pending, (state) => { state.detailLoading = true; state.detailError = null; })
            .addCase(fetchUserSessionDetail.fulfilled, (state, action) => { state.detailLoading = false; state.detail = action.payload; })
            .addCase(fetchUserSessionDetail.rejected, (state, action) => { state.detailLoading = false; state.detailError = action.payload; });

        // Terminate
        builder
            .addCase(terminateUserSession.pending, (state) => { state.actionLoading = true; state.actionError = null; })
            .addCase(terminateUserSession.fulfilled, (state, action) => {
                state.actionLoading = false;
                const { id } = action.payload;
                const idx = state.list.findIndex((s) => s._id === id);
                if (idx !== -1) state.list[idx] = { ...state.list[idx], isActive: false, isDelete: true };
                if (state.detail?._id === id) state.detail = { ...state.detail, isActive: false, isDelete: true };
            })
            .addCase(terminateUserSession.rejected, (state, action) => { state.actionLoading = false; state.actionError = action.payload; });

        // Terminate All
        builder
            .addCase(terminateAllUserSessions.pending, (state) => { state.actionLoading = true; state.actionError = null; })
            .addCase(terminateAllUserSessions.fulfilled, (state, action) => {
                state.actionLoading = false;
                const { userId } = action.payload;
                state.list = state.list.map((s) =>
                    s.userId?._id === userId || s.userId === userId
                        ? { ...s, isActive: false, isDelete: true }
                        : s
                );
            })
            .addCase(terminateAllUserSessions.rejected, (state, action) => { state.actionLoading = false; state.actionError = action.payload; });
    },
});

export const { clearDetail, clearActionError, patchListItem } = userSessionsSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectUserSessionsList          = (state) => state.userSessions.list;
export const selectUserSessionsMeta          = (state) => state.userSessions.meta;
export const selectUserSessionsLoading       = (state) => state.userSessions.listLoading;
export const selectUserSessionDetail         = (state) => state.userSessions.detail;
export const selectUserSessionDetailLoading  = (state) => state.userSessions.detailLoading;
export const selectUserSessionsActionLoading = (state) => state.userSessions.actionLoading;

export default userSessionsSlice.reducer;
