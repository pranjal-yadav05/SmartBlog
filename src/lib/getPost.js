export async function getPost(id) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Add a small artificial delay in development mode to showcase loading animation
  if (process.env.NODE_ENV === "development") {
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  const response = await fetch(`${API_URL}/api/posts/${id}`, {
    // Add cache: 'no-store' to disable caching and ensure the loading state is shown
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}
