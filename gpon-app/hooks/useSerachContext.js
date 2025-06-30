import { useContext } from "react";
import {SearchContext} from "../Context/SeaarchContext"


export const useSearchContext = () => {
    const context = useContext(SearchContext);

    if(!context){
        throw Error(
          "useSearchContext must be used inside a SearchContextProvider"
        );
    }

    return context;
}