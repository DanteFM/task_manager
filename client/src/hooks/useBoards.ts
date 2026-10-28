import { useQuery } from "@tanstack/react-query";
import { boardsApi } from "../api/boards";

export function useBoards(){
  return useQuery({ queryKey: ["boards"], queryFn: boardsApi.list })
}