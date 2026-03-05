// src/api.ts

//  في البداية لكي تراه الصفحات الأخرى
export async function listeClient(endpoint: string, options: RequestInit = {}) {
  // BASE_URL يجب أن يطابق عنوان السيرفر الذي يعمل لديك
  const BASE_URL = "http://localhost:3000/api"; 

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // إذا كان مشروعك يتطلب API Key، أضفه هنا
      // 
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Fehler beim API-Aufruf");
  }

  return response.json();
}