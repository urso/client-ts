/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable @typescript-eslint/ban-types */
import type { SimpleError } from './responses';

const resolveUrl = (url: string, queryParams: Record<string, any> = {}, pathParams: Record<string, string> = {}) => {
  const query = new URLSearchParams(queryParams).toString();
  const queryString = query.length > 0 ? `?${query}` : '';
  return url.replace(/\{\w*\}/g, (key) => pathParams[key.slice(1, -1)]) + queryString;
};

// Typed only the subset of the spec we actually use (to be able to build a simple mock)
export type FetchImpl = (
  url: string,
  init?: { body?: string; headers?: Record<string, string>; method?: string }
) => Promise<{ ok: boolean; status: number; json(): Promise<any> }>;

export type WorkspaceApiUrlBuilder = (path: string, pathParams: Record<string, string>) => string;

export type FetcherExtraProps = {
  apiUrl: string;
  workspacesApiUrl: string | WorkspaceApiUrlBuilder;
  fetchImpl: FetchImpl;
  apiKey: string;
};

export type FetcherOptions<TBody, THeaders, TQueryParams, TPathParams> = {
  url: string;
  method: string;
  body?: TBody;
  headers?: THeaders;
  queryParams?: TQueryParams;
  pathParams?: TPathParams;
};

const fallbackError: SimpleError = { message: 'Network response was not ok' };

function buildBaseUrl({
  path,
  workspacesApiUrl,
  apiUrl,
  pathParams
}: {
  path: string;
  workspacesApiUrl: string | WorkspaceApiUrlBuilder;
  apiUrl: string;
  pathParams?: Record<string, string>;
}): string {
  if (!pathParams?.workspace) return `${apiUrl}${path}`;

  const url = typeof workspacesApiUrl === 'string' ? `${workspacesApiUrl}${path}` : workspacesApiUrl(path, pathParams);
  return url.replace('{workspaceId}', pathParams.workspace);
}

// The host header is needed by Node.js on localhost.
// It is ignored by fetch() in the frontend
function hostHeader(url: string): { Host?: string } {
  const pattern = /.*:\/\/(?<host>[^/]+).*/;
  const { groups } = pattern.exec(url) ?? {};

  return groups?.host ? { Host: groups.host } : {};
}

export async function fetch<
  TData,
  TBody extends Record<string, unknown> | undefined,
  THeaders extends Record<string, unknown>,
  TQueryParams extends Record<string, unknown>,
  TPathParams extends Record<string, string>
>({
  url: path,
  method,
  body,
  headers,
  pathParams,
  queryParams,
  fetchImpl,
  apiKey,
  apiUrl,
  workspacesApiUrl
}: FetcherOptions<TBody, THeaders, TQueryParams, TPathParams> & FetcherExtraProps): Promise<TData> {
  const baseUrl = buildBaseUrl({ path, workspacesApiUrl, pathParams, apiUrl });
  const fullUrl = resolveUrl(baseUrl, queryParams, pathParams);

  // Node.js on localhost won't resolve localhost subdomains unless mapped in /etc/hosts
  // So, instead, we use localhost without subdomains, but will add a Host header
  const url = fullUrl.includes('localhost') ? fullUrl.replace(/^[^.]+\./, 'http://') : fullUrl;

  const response = await fetchImpl(url, {
    method: method.toUpperCase(),
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...hostHeader(fullUrl),
      Authorization: `Bearer ${apiKey}`
    }
  });

  // No content
  if (response.status === 204) {
    return {} as unknown as TData;
  }

  try {
    const jsonResponse = await response.json();

    if (response.ok) {
      return jsonResponse;
    }

    if (jsonResponse.message) {
      throw withStatus({ message: jsonResponse.message }, response.status);
    } else {
      throw withStatus(fallbackError, response.status);
    }
  } catch (e) {
    if (e instanceof Error) {
      const error: SimpleError = {
        message: e.message
      };
      throw withStatus(error, response.status);
    } else if (typeof e === 'object' && typeof (e as SimpleError).message === 'string') {
      throw withStatus(e as SimpleError, response.status);
    } else {
      throw withStatus(fallbackError, response.status);
    }
  }
}

const withStatus = (error: SimpleError, status: number) => ({ ...error, status });