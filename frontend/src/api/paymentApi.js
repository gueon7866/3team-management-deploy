import axiosClient from "./axiosClient";

export const paymentApi = {
  // 결제 레코드 생성
  createPaymentRecord: async (data) => {
    return await axiosClient.post("/payment/record", data);
  },

  // 결제 상세 조회
  getPaymentDetail: async (paymentKey) => {
    return await axiosClient.get(`/payment/${paymentKey}`);
  },
};

export default paymentApi;

