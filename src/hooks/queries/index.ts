export {
  useProductsQuery,
  usePaginatedProductsQuery,
  useFeaturedProductsQuery,
  useRelatedProductsQuery,
  useProductDetailsQuery,
} from './products';
export type {
  PaginatedProductsParams,
  PaginatedProductsResponse,
} from './products';

export { useLandingQuery } from './landing';
export type { LandingData, LookbookSlide, EditorialItem } from './landing';

export {
  useEditorialQuery,
  useCategoriesQuery,
} from './content';
export type { CategoryMetadata } from './content';

export { useOrders } from './orders';
export type { OrderItem, Order } from './orders';

export {
  useAdminDashboardQuery,
  useAdminProductsQuery,
  useAdminOrdersQuery,
  useAdminUsersQuery,
  useAdminUserSessionsQuery,
  useUpdateOrderStatusMutation,
  useSaveProductMutation,
  useDeleteProductMutation,
  useToggleUserVerifyMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} from './admin';
export type {
  AdminPaginatedProductsResponse,
  PaginatedOrdersResponse,
  AdminUserRow,
  PaginatedUsersResponse,
} from './admin';
