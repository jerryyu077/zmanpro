// ==========================================
// Pages Functions - API Proxy Route
// 反向代理隐藏 Worker endpoint
// ==========================================

export async function onRequest(context) {
  const { request, env } = context;
  
  // 构建实际的 Worker URL
  const url = new URL(request.url);
  const workerUrl = new URL(`https://zmansys-api.jerryyu077.workers.dev${url.pathname}${url.search}`);
  
  // 创建新的请求，保留原始方法、headers 和 body
  const workerRequest = new Request(workerUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.clone().arrayBuffer() : undefined,
  });
  
  // 转发请求到 Worker
  const response = await fetch(workerRequest);
  
  // 返回响应
  return response;
}

