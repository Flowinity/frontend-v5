import { gql } from "@apollo/client/core";

const UserLightCollectionsQuery = gql`
  query LightCollections($input: UserCollectionsInput!) {
    collections(input: $input) {
      items {
        id
        permissionsMetadata {
          write
          read
          configure
        }
        name
        avatar
        itemCount
        user {
          username
          id
        }
        banner
        image
        updatedAt
        preview {
          attachment {
            attachment
            id
          }
          createdAt
        }
        createdAt
        shareLink
      }
    }
  }
`;

const UserCollectionsQuery = gql`
  query Collections($input: UserCollectionsInput!) {
    collections(input: $input) {
      items {
        id
        name
        image
        userId
        banner
        avatar
        shareLink
        user {
          username
          id
          createdAt
          administrator
          moderator
          avatar
        }
        preview {
          attachment {
            attachment
            id
          }
        }
        users {
          id
          createdAt
          updatedAt
          collectionId
          read
          write
          configure
          accepted
          recipientId
          senderId
          identifier
          user {
            username
            id
            administrator
            moderator
            avatar
          }
          sender {
            username
            id
            administrator
            moderator
            avatar
          }
        }
        recipient {
          id
          createdAt
          updatedAt
          collectionId
          read
          write
          configure
          accepted
          recipientId
          senderId
        }
        shared
        itemCount
        permissionsMetadata {
          write
          read
          configure
        }
      }
      pager {
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
    }
  }
`;
