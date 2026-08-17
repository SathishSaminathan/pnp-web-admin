import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingsApi } from '../../api/modules/bookings';

/**
 * Normalize GET /booking list response.
 * Supports both flat and nested envelopes:
 *   { data: [...], fetchCount, totalCount }
 *   { data: { data: [...], fetchCount, totalCount } }
 */
const parseListResponse = (res) => {
    const root = res ?? {};
    const nested = root?.data && !Array.isArray(root.data) ? root.data : null;
    const list =
        Array.isArray(root.data) ? root.data
            : Array.isArray(nested?.data) ? nested.data
                : Array.isArray(nested) ? nested
                    : [];

    return {
        data:       list,
        totalCount: root.totalCount ?? nested?.totalCount ?? 0,
        fetchCount: root.fetchCount ?? nested?.fetchCount ?? list.length,
    };
};

const parseDetailResponse = (res) => {
    const root = res ?? {};
    if (root?.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
        // Prefer single object; if API wraps as data: [booking], take first
        if (Array.isArray(root.data.data)) return root.data.data[0] ?? null;
        return root.data;
    }
    if (Array.isArray(root.data)) return root.data[0] ?? null;
    return root;
};

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchBookings = createAsyncThunk(
    'bookings/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const res = await bookingsApi.getAll(params);
            return parseListResponse(res);
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || err?.message || 'Failed to load bookings',
            );
        }
    },
);

export const fetchBookingDetail = createAsyncThunk(
    'bookings/fetchDetail',
    async (id, { rejectWithValue }) => {
        try {
            const res = await bookingsApi.getById(id);
            return parseDetailResponse(res);
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || err?.message || 'Failed to load booking detail',
            );
        }
    },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const bookingsSlice = createSlice({
    name: 'bookings',
    initialState: {
        list:        [],
        totalCount:  0,
        fetchCount:  0,
        listLoading: false,
        listError:   null,

        detail:        null,
        detailLoading: false,
        detailError:   null,

        lastParams: null,
    },
    reducers: {
        clearDetail(state) {
            state.detail      = null;
            state.detailError = null;
        },
        clearListError(state) {
            state.listError = null;
        },
        setLastParams(state, action) {
            state.lastParams = action.payload;
        },
        patchListItem(state, action) {
            const { id, changes } = action.payload;
            const idx = state.list.findIndex((b) => b._id === id || b.id === id);
            if (idx !== -1) state.list[idx] = { ...state.list[idx], ...changes };
            if (state.detail?._id === id || state.detail?.id === id) {
                state.detail = { ...state.detail, ...changes };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBookings.pending, (state) => {
                state.listLoading = true;
                state.listError   = null;
            })
            .addCase(fetchBookings.fulfilled, (state, action) => {
                state.listLoading = false;
                state.list        = action.payload.data;
                state.totalCount  = action.payload.totalCount;
                state.fetchCount  = action.payload.fetchCount;
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.listLoading = false;
                state.listError   = action.payload;
            });

        builder
            .addCase(fetchBookingDetail.pending, (state) => {
                state.detailLoading = true;
                state.detailError   = null;
            })
            .addCase(fetchBookingDetail.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.detail        = action.payload;
            })
            .addCase(fetchBookingDetail.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError   = action.payload;
            });
    },
});

export const {
    clearDetail,
    clearListError,
    setLastParams,
    patchListItem,
} = bookingsSlice.actions;

export const selectBookingsList         = (state) => state.bookings.list;
export const selectBookingsTotalCount   = (state) => state.bookings.totalCount;
export const selectBookingsFetchCount   = (state) => state.bookings.fetchCount;
export const selectBookingsLoading      = (state) => state.bookings.listLoading;
export const selectBookingsError        = (state) => state.bookings.listError;
export const selectBookingDetail        = (state) => state.bookings.detail;
export const selectBookingDetailLoading = (state) => state.bookings.detailLoading;
export const selectBookingsLastParams   = (state) => state.bookings.lastParams;

export default bookingsSlice.reducer;
