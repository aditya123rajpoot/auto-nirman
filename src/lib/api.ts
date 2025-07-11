import axios from 'axios';

// ✅ Set API base URL correctly
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://autonirman-backend.onrender.com';

// ✅ Create Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🤖 Chatbot - Frontend Route
export async function sendMessageToAI(message: string): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error('Failed to connect to AI');
  }

  const data = await res.json();
  return data.response;
}

// 🏗️ Smart Layout Request - FIXED Endpoint
export async function sendLayoutRequest(formData: {
  total_builtup_area: number;
  number_of_floors: number;
  shape_of_plot: string;
  your_city: string;
  weather_in_your_city: string;
  do_you_follow_vastu: string;
  session_id?: string;
}): Promise<any> {
  const token = localStorage.getItem('token');

  const res = await apiClient.post('/api/api/v1/layout/smart', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}
