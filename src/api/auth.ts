import api from "./axios";
import type { IAuthResponse, IValidateResponse } from "../types/authType.ts";

export const loginUser = async (email: string, password: string) => {
  const res = await api.post<IAuthResponse>("/auth/login", {
    email,
    password,
  });
  return res.data;
};

export const validate = async () => {
  const token = localStorage.getItem("authToken");

  const res = await api.post<IValidateResponse>(
    "/auth/validate",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};
