export const customFetch = async <T>(
  url: RequestInfo,
  options: RequestInit,
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
  });

  return response.json();
};
