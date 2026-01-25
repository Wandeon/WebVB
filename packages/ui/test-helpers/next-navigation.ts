let pathname = '/';

export function __setPathname(nextPathname: string) {
  pathname = nextPathname;
}

export function usePathname() {
  return pathname;
}
