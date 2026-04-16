import { useState, useCallback } from 'react';

interface UseSearchPaginationProps {
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
}

interface SearchPaginationState {
  page: number;
  limit: number;
  search: string;
}

interface SearchPaginationActions {
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  reset: () => void;
}

export const useSearchPagination = ({
  initialPage = 1,
  initialLimit = 5,
  initialSearch = ''
}: UseSearchPaginationProps = {}): [SearchPaginationState, SearchPaginationActions] => {
  const [state, setState] = useState<SearchPaginationState>({
    page: initialPage,
    limit: initialLimit,
    search: initialSearch
  });

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setState(prev => ({ ...prev, limit,  })); 
  }, []);

  const setSearch = useCallback((search: string) => {
    setState(prev => ({ ...prev, search })); 
  }, []);

  const reset = useCallback(() => {
    setState({ page: initialPage, limit: initialLimit, search: initialSearch });
  }, [initialPage, initialLimit, initialSearch]);

  return [state, { setPage, setLimit, setSearch, reset }];
};