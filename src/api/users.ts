import api from "./axios";
import type { IAuthResponse } from "../types/authType.ts";
import type {
  IDeleteUserResponse,
  IGetAllUsersResponse,
} from "@/types/userType.ts";

export const getAllUsersExceptAdmin = async () => {
  const token = localStorage.getItem("authToken");

  const res = await api.get<IGetAllUsersResponse>("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const registerUser = async (
  email: string,
  password: string,
  adminToken?: string
) => {
  const token = localStorage.getItem("authToken");

  const res = await api.post<IAuthResponse>(
    "/auth/register",
    { email, password, adminToken },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const deleteUser = async (
  _id: string,
  email: string,
  role: "user" | "admin"
) => {
  const token = localStorage.getItem("authToken");

  const res = await api.delete<IDeleteUserResponse>("/users/delete", {
    data: { _id, email, role },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
