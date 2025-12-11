import { useEffect } from "react";
import api from "../api/axios";

const useAxios = () => {
  useEffect(() => {
    // Request Interceptor: attach token
    const reqInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("authToken");

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Cleanup
    return () => {
      api.interceptors.request.eject(reqInterceptor);
    };
  }, []);

  return api;
};

export default useAxios;
