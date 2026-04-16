import { useEffect, useState } from "react";
import {
  useAddNewClientMutation,
  useFetchAllClientsQuery,
} from "../../../features/admin/myClients/myClientsApi";
import ClientsTable from "./ClientsTable";
import { CircularProgress } from "@mui/material";
import { useSearchPagination } from "../../../features/searchPagination/useSearchPagination";

const MyClients = () => {
  const [searchPaginationState, searchPaginationActions] = useSearchPagination({
    initialLimit: 5,
  });

  const { data, isLoading, isError, refetch } = useFetchAllClientsQuery({
    ...searchPaginationState,
  });

  const [clientsData, setClientsData] = useState();
  const [addNewClient] = useAddNewClientMutation();
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (data && !isLoading && !isError) {
      setClientsData(data.data);
    }
  }, [data, isLoading, isError]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPaginationActions.setSearch(searchInput);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, searchPaginationActions]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 mr-[20%] md:mr-0  mt-[40%] md:mt-[15%]">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="ml-[-30px] md:ml-0">
      <ClientsTable
        data={clientsData}
        onAddClient={addNewClient}
        refetch={refetch}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        searchPaginationState={searchPaginationState}
        searchPaginationActions={searchPaginationActions}
        pagination={data?.pagination}
      />
    </div>
  );
};

export default MyClients;
