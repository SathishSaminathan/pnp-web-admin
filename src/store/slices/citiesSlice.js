import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { citiesApi } from '../../api/modules/cities';

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchCities = createAsyncThunk(
    'cities/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const res = await citiesApi.getAll(params);
            if (res.success) return { data: res.data ?? [], meta: res.meta ?? {} };
            return rejectWithValue(res.message || 'Failed to load cities');
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || err?.message || 'Failed to load cities'
            );
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const citiesSlice = createSlice({
    name: 'cities',
    initialState: {
        list: [],
        meta: {},
        listLoading: false,
        listError: null,
    },
    reducers: {
        clearCitiesError(state) { state.listError = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCities.pending, (state) => {
                state.listLoading = true;
                state.listError = null;
            })
            .addCase(fetchCities.fulfilled, (state, action) => {
                state.listLoading = false;
                state.list = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(fetchCities.rejected, (state, action) => {
                state.listLoading = false;
                state.listError = action.payload;
            });
    },
});

export const { clearCitiesError } = citiesSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectCitiesList    = (state) => state.cities.list;
export const selectCitiesMeta    = (state) => state.cities.meta;
export const selectCitiesLoading = (state) => state.cities.listLoading;
export const selectCitiesError   = (state) => state.cities.listError;

export default citiesSlice.reducer;
