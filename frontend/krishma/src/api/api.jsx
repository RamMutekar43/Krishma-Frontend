import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export const getProducts = async () => {
  try {
    const res = await axios.get(`${API_BASE}/products`);
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const checkoutOrder = async (cart) => {
  try {
    await axios.post(`${API_BASE}/orders`, { products: cart });
  } catch (err) {
    console.error(err);
  }
};
