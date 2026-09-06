import { createSlice } from "@reduxjs/toolkit";

const getStoredToken = () => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
        return null;
    }

    let token = storedToken;

    try {
        const parsedToken = JSON.parse(storedToken);
        token = typeof parsedToken === "string" ? parsedToken : storedToken;
    } catch {
        token = storedToken;
    }

    try {
        const encodedPayload = token.split(".")[1];
        const base64Payload = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64Payload));

        if (payload.exp && payload.exp * 1000 <= Date.now()) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return null;
        }

        return token;
    } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return null;
    }
};

const initialState = {
    signupData: null,
    token: getStoredToken(),
    loading:false
}

const authSlice = createSlice({
    name:"auth",
    initialState:initialState,
    reducers:{
        setSignupData: (state,value) =>{
            state.signupData = value.payload;
        },
        setLoading(state, value) {
            state.loading = value.payload;
          },
          setToken(state, value) {
            state.token = value.payload;
          },
    }
})

export const { setSignupData, setLoading, setToken } = authSlice.actions;

export default authSlice.reducer;