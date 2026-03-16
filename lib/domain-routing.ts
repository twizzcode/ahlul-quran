import { isDashboardRole } from "@/lib/user-roles";

const ADMIN_SUBDOMAIN = "admin";
const LOCALHOST_HOSTNAME = "localhost";

function splitHost(host: string) {
  const [hostname, port] = host.trim().toLowerCase().split(":");
  return {
    hostname,
    port: port ? `:${port}` : "",
  };
}

export function isLocalhostHost(host: string | null | undefined) {
  if (!host) return false;

  const { hostname } = splitHost(host);
  return hostname === LOCALHOST_HOSTNAME || hostname.endsWith(`.${LOCALHOST_HOSTNAME}`);
}

export function isAdminRole(role: string | null | undefined) {
  return isDashboardRole(role);
}

export function isAdminHost(host: string | null | undefined) {
  if (!host) return false;

  const { hostname } = splitHost(host);
  return hostname === `${ADMIN_SUBDOMAIN}.${LOCALHOST_HOSTNAME}` || hostname.startsWith(`${ADMIN_SUBDOMAIN}.`);
}

export function getPublicHost(host: string) {
  const { hostname, port } = splitHost(host);

  if (!hostname.startsWith(`${ADMIN_SUBDOMAIN}.`)) {
    return `${hostname}${port}`;
  }

  return `${hostname.slice(ADMIN_SUBDOMAIN.length + 1)}${port}`;
}

export function getAdminHost(host: string) {
  const { hostname, port } = splitHost(host);

  if (hostname.startsWith(`${ADMIN_SUBDOMAIN}.`)) {
    return `${hostname}${port}`;
  }

  if (hostname === LOCALHOST_HOSTNAME) {
    return `${ADMIN_SUBDOMAIN}.${LOCALHOST_HOSTNAME}${port}`;
  }

  return `${ADMIN_SUBDOMAIN}.${hostname}${port}`;
}

export function buildOrigin(protocol: string, host: string) {
  return `${protocol}://${host}`;
}
