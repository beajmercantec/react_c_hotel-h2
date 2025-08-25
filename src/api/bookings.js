import { api } from "./apiClient";
export const BookingsApi = {
  list:  (params)=> api.get("/Bookings", { params, auth:true }),
  get:   (id)    => api.get(`/Bookings/${id}`, { auth:true }),
};