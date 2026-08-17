import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userDevicesApi } from '../../api/modules/userDevices';

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchUserDevices = createAsyncThunk(
    'userDevices/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const res = await userDevicesApi.getAll(params);
            if (res.success) return { data: res.data ?? [], meta: res.meta ?? {} };
            return rejectWithValue(res.message || 'Failed to load devices');
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to load devices');
        }
    }
);

export const fetchUserDeviceDetail = createAsyncThunk(
    'userDevices/fetchDetail',
    async (id, { rejectWithValue }) => {
        try {
            const res = await userDevicesApi.getById(id);
            if (res.success) return res.data ?? null;
            return rejectWithValue(res.message || 'Failed to load device detail');
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to load device detail');
        }
    }
);

const makeDeviceAction = (name, apiFn) =>
    createAsyncThunk(`userDevices/${name}`, async (id, { rejectWithValue }) => {
        try {
            const res = await apiFn(id);
            if (res.success) return { id, data: res.data };
            return rejectWithValue(res.message || `Action ${name} failed`);
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || err?.message || `Action ${name} failed`);
        }
    });

export const activateUserDevice   = makeDeviceAction('activate',   userDevicesApi.activate);
export const deactivateUserDevice = makeDeviceAction('deactivate', userDevicesApi.deactivate);
export const verifyUserDevice     = makeDeviceAction('verify',     userDevicesApi.verify);
export const unverifyUserDevice   = makeDeviceAction('unverify',   userDevicesApi.unverify);
export const softDeleteUserDevice = makeDeviceAction('softDelete', userDevicesApi.softDelete);

// ── Slice ─────────────────────────────────────────────────────────────────────

const patchById = (state, id, changes) => {
    const idx = state.list.findIndex((d) => d._id === id);
    if (idx !== -1) state.list[idx] = { ...state.list[idx], ...changes };
    if (state.detail?._id === id) state.detail = { ...state.detail, ...changes };
};

const userDevicesSlice = createSlice({
    name: 'userDevices',
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
        clearDetail(state) { state.detail = null; state.detailError = null; },
        clearActionError(state) { state.actionError = null; },
    },
    extraReducers: (builder) => {
        // List
        builder
            .addCase(fetchUserDevices.pending, (state) => { state.listLoading = true; state.listError = null; })
            .addCase(fetchUserDevices.fulfilled, (state, action) => {
                state.listLoading = false;
                state.list = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(fetchUserDevices.rejected, (state, action) => { state.listLoading = false; state.listError = action.payload; });

        // Detail
        builder
            .addCase(fetchUserDeviceDetail.pending, (state) => { state.detailLoading = true; state.detailError = null; })
            .addCase(fetchUserDeviceDetail.fulfilled, (state, action) => { state.detailLoading = false; state.detail = action.payload; })
            .addCase(fetchUserDeviceDetail.rejected, (state, action) => { state.detailLoading = false; state.detailError = action.payload; });

        // Activate
        builder
            .addCase(activateUserDevice.pending, (state) => { state.actionLoading = true; state.actionError = null; })
            .addCase(activateUserDevice.fulfilled, (state, action) => {
                state.actionLoading = false;
                patchById(state, action.payload.id, { isActive: true });
            })
            .addCase(activateUserDevice.rejected, (state, action) => { state.actionLoading = false; state.actionError = action.payload; });

        // Deactivate
        builder
            .addCase(deactivateUserDevice.pending, (state) => { state.actionLoading = true; state.actionError = null; })
            .addCase(deactivateUserDevice.fulfilled, (state, action) => {
                state.actionLoading = false;
                patchById(state, action.payload.id, { isActive: false });
            })
            .addCase(deactivateUserDevice.rejected, (state, action) => { state.actionLoading = false; state.actionError = action.payload; });

        // Verify
        builder
            .addCase(verifyUserDevice.pending, (state) => { state.actionLoading = true; state.actionError = null; })
            .addCase(verifyUserDevice.fulfilled, (state, action) => {
                state.actionLoading = false;
                patchById(state, action.payload.id, { isVerified: true });
            })
            .addCase(verifyUserDevice.rejected, (state, action) => { state.actionLoading = false; state.actionError = action.payload; });

        // Unverify
        builder
            .addCase(unverifyUserDevice.pending, (state) => { state.actionLoading = true; state.actionError = null; })
            .addCase(unverifyUserDevice.fulfilled, (state, action) => {
                state.actionLoading = false;
                patchById(state, action.payload.id, { isVerified: false });
            })
            .addCase(unverifyUserDevice.rejected, (state, action) => { state.actionLoading = false; state.actionError = action.payload; });

        // Soft Delete
        builder
            .addCase(softDeleteUserDevice.pending, (state) => { state.actionLoading = true; state.actionError = null; })
            .addCase(softDeleteUserDevice.fulfilled, (state, action) => {
                state.actionLoading = false;
                patchById(state, action.payload.id, { isDelete: true, isActive: false });
            })
            .addCase(softDeleteUserDevice.rejected, (state, action) => { state.actionLoading = false; state.actionError = action.payload; });
    },
});

export const { clearDetail, clearActionError } = userDevicesSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectUserDevicesList          = (state) => state.userDevices.list;
export const selectUserDevicesMeta          = (state) => state.userDevices.meta;
export const selectUserDevicesLoading       = (state) => state.userDevices.listLoading;
export const selectUserDeviceDetail         = (state) => state.userDevices.detail;
export const selectUserDeviceDetailLoading  = (state) => state.userDevices.detailLoading;
export const selectUserDevicesActionLoading = (state) => state.userDevices.actionLoading;

export default userDevicesSlice.reducer;
