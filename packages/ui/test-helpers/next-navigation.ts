let pathname = '/';
let searchParams = new URLSearchParams();

export function __setPathname(nextPathname: string) {
  pathname = nextPathname;
}

export function __setSearchParams(nextParams: Record<string, string> | URLSearchParams) {
  searchParams =
    nextParams instanceof URLSearchParams
      ? new URLSearchParams(nextParams.toString())
      : new URLSearchParams(nextParams);
}

export function usePathname() {
  return pathname;
}

export function useSearchParams() {
  return searchParams;
}

export function useRouter() {
  return {
    push: () => undefined,
  };
}
