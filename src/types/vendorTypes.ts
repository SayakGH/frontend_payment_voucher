export interface Vendor {
  _id: string;
  name: string;
  phone: string;
  address: string;
  pan: string;
  gstin?: string;
  type?: "Vendor" | "Salary" | "Agent" | "Phone Bill" | "Rent" | "Other";
  createdAt: string;
}

export interface ICreateVendorResponse {
  success: boolean;
  vendor: Vendor;
}

export interface IGetVendorsResponse {
  success: boolean;
  count: number;
  vendors: Vendor[];
}
export interface CreateVendorPayload {
  name: string;
  phone: string;
  address: string;
  pan: string;
  gstin?: string;
  type: "Vendor" | "Salary" | "Agent" | "Phone Bill" | "Rent" | "Other";
}
