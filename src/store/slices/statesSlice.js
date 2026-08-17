import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { statesApi } from '../../api/modules/states';

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchStates = createAsyncThunk(
    'states/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const res = await statesApi.getAll(params);
            if (res.success) return { data: res.data ?? [], meta: res.meta ?? {} };
            return rejectWithValue(res.message || 'Failed to load states');
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || err?.message || 'Failed to load states'
            );
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const statesSlice = createSlice({
    name: 'states',
    initialState: {
        list: [],
        meta: {},
        listLoading: false,
        listError: null,
    },
    reducers: {
        clearStatesError(state) { state.listError = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStates.pending, (state) => {
                state.listLoading = true;
                state.listError = null;
            })
            .addCase(fetchStates.fulfilled, (state, action) => {
                state.listLoading = false;
                state.list = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(fetchStates.rejected, (state, action) => {
                state.listLoading = false;
                state.listError = action.payload;
            });
    },
});

export const { clearStatesError } = statesSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectStatesList    = (state) => state.states.list;
export const selectStatesMeta    = (state) => state.states.meta;
export const selectStatesLoading = (state) => state.states.listLoading;
export const selectStatesError   = (state) => state.states.listError;

export default statesSlice.reducer;
