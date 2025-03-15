export async function getPost(id) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${API_URL}/api/posts/${id}`);
  
    if (!response.ok) {
      return null;
    }
  
    return response.json();
  }
  