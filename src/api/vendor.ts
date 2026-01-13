import type {
  ICreateVendorResponse,
  IGetVendorsResponse,
  CreateVendorPayload,
} from "@/types/vendorTypes";
import api from "./axios";
import type {
  CreateProjectPayload,
  ICreateProjectResponse,
  IGetVendorProjectsResponse,
} from "@/types/projectType";
import type {
  CreateBillPayload,
  ICreateBillResponse,
  IGetProjectBillsResponse,
} from "@/types/billType";
import type {
  ICreatePaymentResponse,
  IGetPaymentsByProjectResponse,
} from "@/types/paymentType";

export interface IDeleteResponse {
  success: boolean;
  message?: string;
}

export const createVendor = async (payload: CreateVendorPayload) => {
  const token = localStorage.getItem("authToken");

  const res = await api.post<ICreateVendorResponse>(
    "/vendors/create",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const getAllVendors = async () => {
  const token = localStorage.getItem("authToken");

  const res = await api.get<IGetVendorsResponse>("/vendors", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const createProject = async (payload: CreateProjectPayload) => {
  const token = localStorage.getItem("authToken");

  const res = await api.post<ICreateProjectResponse>(
    "/vendors/create/project",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const getAllVendorProjects = async (id: string) => {
  const token = localStorage.getItem("authToken");

  const res = await api.get<IGetVendorProjectsResponse>(
    `/vendors/projects/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const createBill = async (payload: CreateBillPayload) => {
  const token = localStorage.getItem("authToken");

  const res = await api.post<ICreateBillResponse>(
    "/vendors/create/bill",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const getBills = async (id: string) => {
  const token = localStorage.getItem("authToken");

  const res = await api.get<IGetProjectBillsResponse>(`/vendors/bills/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const createPayment = async (payload: any) => {
  const token = localStorage.getItem("authToken");

  const res = await api.post<ICreatePaymentResponse>(
    "/vendors/create/payment",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const getPayments = async (id: string) => {
  const token = localStorage.getItem("authToken");

  const res = await api.get<IGetPaymentsByProjectResponse>(
    `/vendors/payments/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const deleteBill = async (billId: string) => {
  const token = localStorage.getItem("authToken");

  const res = await api.delete<IDeleteResponse>(
    `/vendors/delete/bill/${billId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};
export const deletePayment = async (paymentId: string) => {
  const token = localStorage.getItem("authToken");

  const res = await api.delete<IDeleteResponse>(
    `/vendors/delete/payment/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const deleteProject = async (projectId: string) => {
  const token = localStorage.getItem("authToken");

  const res = await api.delete<IDeleteResponse>(
    `/vendors/delete/project/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const deleteVendor = async (vendorId: string) => {
  const token = localStorage.getItem("authToken");

  const res = await api.delete<IDeleteResponse>(
    `/vendors/delete/vendor/${vendorId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const getPaymentbyId = async (id: string) => {
  const token = localStorage.getItem("authToken");

  const res = await api.get<ICreatePaymentResponse>(
    `/vendors/single/payment/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};
export const createPaymentv2 = async (payload: any) => {
  const token = localStorage.getItem("authToken");

  const res = await api.post<ICreatePaymentResponse>(
    "/vendors/create/payment/v2",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const getPaymentbyIdv2 = async (id: string) => {
  const token = localStorage.getItem("authToken");

  const res = await api.get<IGetPaymentsByProjectResponse>(
    `/vendors/payments/vendor/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const deleteVendorv2 = async (vendorId: string) => {
  const token = localStorage.getItem("authToken");

  const res = await api.delete<IDeleteResponse>(
    `/vendors/delete/vendor/payments/${vendorId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};
export const updateVendorPanPhone = async (
  vendorId: string,
  payload: { pan?: string; phone?: string }
) => {
  const token = localStorage.getItem("authToken");

  const res = await api.patch(
    `/vendors/update/pan-phone/${vendorId}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};
