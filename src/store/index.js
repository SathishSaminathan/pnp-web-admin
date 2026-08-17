import { configureStore } from '@reduxjs/toolkit';
import accountTypesReducer from './slices/accountTypesSlice';
import bookingsReducer from './slices/bookingsSlice';
import creditTransactionsReducer from './slices/creditTransactionsSlice';
import noahCustodyWalletsReducer from './slices/noahCustodyWalletsSlice';
import transactionsReducer from './slices/transactionsSlice';
import userSessionsReducer from './slices/userSessionsSlice';
import userDevicesReducer from './slices/userDevicesSlice';
import userOtpsReducer from './slices/userOtpsSlice';
import countriesReducer from './slices/countriesSlice';
import statesReducer from './slices/statesSlice';
import citiesReducer from './slices/citiesSlice';

const store = configureStore({
    reducer: {
        accountTypes: accountTypesReducer,
        bookings: bookingsReducer,
        creditTransactions: creditTransactionsReducer,
        noahCustodyWallets: noahCustodyWalletsReducer,
        transactions: transactionsReducer,
        userSessions: userSessionsReducer,
        userDevices: userDevicesReducer,
        userOtps: userOtpsReducer,
        countries: countriesReducer,
        states: statesReducer,
        cities: citiesReducer,
    },
});

export default store;
