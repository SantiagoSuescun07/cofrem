import { useQuery } from "@tanstack/react-query";
import { fetchDocuments } from "@/services/management/get-documents";
import { DOCUMENTS_QUERY_KEY } from "@/constants/query-keys";

export const useDocuments = () => {
  return useQuery({
    queryKey: [DOCUMENTS_QUERY_KEY],
    queryFn: () => fetchDocuments(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};

