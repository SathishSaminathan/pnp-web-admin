import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { countriesApi } from '../../api/modules/countries';

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchCountries = createAsyncThunk(
    'countries/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const res = await countriesApi.getAll(params);
            if (res.success) return { data: res.data ?? [], meta: res.meta ?? {} };
            return rejectWithValue(res.message || 'Failed to load countries');
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.message || err?.message || 'Failed to load countries'
            );
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const countriesSlice = createSlice({
    name: 'countries',
    initialState: {
        list: [],
        meta: {},
        listLoading: false,
        listError: null,
    },
    reducers: {
        clearCountriesError(state) { state.listError = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCountries.pending, (state) => {
                state.listLoading = true;
                state.listError = null;
            })
            .addCase(fetchCountries.fulfilled, (state, action) => {
                state.listLoading = false;
                state.list = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(fetchCountries.rejected, (state, action) => {
                state.listLoading = false;
                state.listError = action.payload;
            });
    },
});

export const { clearCountriesError } = countriesSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────────

export const selectCountriesList    = (state) => state.countries.list;
export const selectCountriesMeta    = (state) => state.countries.meta;
export const selectCountriesLoading = (state) => state.countries.listLoading;
export const selectCountriesError   = (state) => state.countries.listError;

export default countriesSlice.reducer;
