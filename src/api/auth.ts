import api from "./axios";
import type { IAuthResponse } from "../types/authType.ts";

export const loginUser = async (email: string, password: string) => {
  const res = await api.post<IAuthResponse>("/auth/login", {
    email,
    password,
  });
  return res.data;
};
