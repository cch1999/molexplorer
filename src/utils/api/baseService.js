const responseCache = new Map();

async function fetchResource(url, parser) {
  if (responseCache.has(url)) {
    return responseCache.get(url);
  }
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(`HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.url = url;
    throw error;
  }
  const parsed = await parser(response);
  responseCache.set(url, parsed);
  return parsed;
}

export function fetchText(url) {
  return fetchResource(url, (response) => response.text());
}

export function fetchJson(url) {
  return fetchResource(url, (response) => response.json());
}

export function clearCache() {
  responseCache.clear();
}

export default { fetchText, fetchJson, clearCache };
