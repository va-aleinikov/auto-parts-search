import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getParts } from "../../services/partsApi.js";
import { getBrands, getOffers } from "../../utils/normalize.js";
export const searchBrands = createAsyncThunk(
  "parts/brands",
  async (number, { signal }) => getBrands(await getParts({ number }, signal)),
);
export const searchOffers = createAsyncThunk(
  "parts/offers",
  async ({ number, brand }, { signal }) =>
    getOffers(await getParts({ number, brand }, signal)),
);
const initialState = {
  number: "",
  brands: [],
  selectedBrand: "",
  offers: [],
  brandsStatus: "idle",
  offersStatus: "idle",
  brandsError: "",
  offersError: "",
  brandsRequestId: null,
  offersRequestId: null,
};
const slice = createSlice({
  name: "parts",
  initialState,
  reducers: {
    setNumber(state, action) {
      state.number = action.payload;
      state.brands = [];
      state.offers = [];
      state.selectedBrand = "";
      state.brandsStatus = "idle";
      state.offersStatus = "idle";
      state.brandsError = "";
      state.offersError = "";
      state.brandsRequestId = null;
      state.offersRequestId = null;
    },
    selectBrand(state, action) {
      state.selectedBrand = action.payload;
      state.offers = [];
      state.offersStatus = "idle";
      state.offersError = "";
      state.offersRequestId = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(searchBrands.pending, (s, a) => {
      s.brands = [];
      s.selectedBrand = "";
      s.offers = [];
      s.offersStatus = "idle";
      s.offersError = "";
      s.offersRequestId = null;
      s.brandsStatus = "loading";
      s.brandsError = "";
      s.brandsRequestId = a.meta.requestId;
    })
      .addCase(searchBrands.fulfilled, (s, a) => {
        if (s.brandsRequestId !== a.meta.requestId) return;
        s.brandsStatus = "succeeded";
        s.brands = a.payload;
      })
      .addCase(searchBrands.rejected, (s, a) => {
        if (s.brandsRequestId !== a.meta.requestId) return;
        s.brandsStatus = a.meta.aborted ? "idle" : "failed";
        s.brandsError = a.error.message;
      })
      .addCase(searchOffers.pending, (s, a) => {
        s.offersStatus = "loading";
        s.offersError = "";
        s.offersRequestId = a.meta.requestId;
      })
      .addCase(searchOffers.fulfilled, (s, a) => {
        if (s.offersRequestId !== a.meta.requestId) return;
        s.offersStatus = "succeeded";
        s.offers = a.payload;
      })
      .addCase(searchOffers.rejected, (s, a) => {
        if (s.offersRequestId !== a.meta.requestId) return;
        s.offersStatus = a.meta.aborted ? "idle" : "failed";
        s.offersError = a.error.message;
      });
  },
});
export const { setNumber, selectBrand } = slice.actions;
export default slice.reducer;
