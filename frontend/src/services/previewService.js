import api from "./api";

export const previewService = {
  async getPreviews() {
    const response = await api.get("/api/previews/");
    return response.data;
  },

  async getPreview(id) {
    const response = await api.get(`/api/previews/${id}`);
    return response.data;
  },

  async createPreview(url) {
    const response = await api.post("/api/previews/", { url });
    return response.data;
  },

  async deletePreview(id) {
    const response = await api.delete(`/api/previews/${id}`);
    return response.data;
  },

  async fetchPreviewImageBlob(id) {
    const response = await api.get(`/api/previews/${id}/image`, {
      responseType: "blob",
    });
    return URL.createObjectURL(response.data);
  },
};

export default previewService;
