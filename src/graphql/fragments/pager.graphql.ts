import { gql } from "@apollo/client/core";

export const PagerFragment = gql`
  fragment Pager on Pager {
    totalItems
    currentPage
    pageSize
    totalPages
    startPage
    endPage
    startIndex
    endIndex
    pages
  }
`;
