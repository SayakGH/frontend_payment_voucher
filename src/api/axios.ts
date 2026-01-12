import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://qe33q5jv4bfzapvbew7npninxa0ojhad.lambda-url.ap-south-1.on.aws/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
