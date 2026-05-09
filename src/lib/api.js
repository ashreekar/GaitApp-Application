const BASE_URL = import.meta.env.VITE_SERVER_URL;

export const API = {
  login: `${BASE_URL}/api/v1/user/login`,
  register: `${BASE_URL}/api/v1/user/register`,
};