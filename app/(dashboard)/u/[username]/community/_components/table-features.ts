import {
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table";

/**
 * TanStack Table v9 is opt-in: a table only gets the behaviour whose features
 * it declares, which is how the library stopped shipping every row model to
 * every consumer.
 *
 * Row models are not passed explicitly — each feature falls back to its
 * built-in factory (`table.options.features.coreRowModel?.(table) ??
 * createCoreRowModel()(table)`), so declaring the feature is enough.
 *
 * Shared between the table and its column definitions, because ColumnDef is
 * now parameterised by the feature set.
 */
export const communityTableFeatures = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  // row.getVisibleCells() lives here; without it the rows have no cells API.
  columnVisibilityFeature,
});

export type CommunityTableFeatures = typeof communityTableFeatures;
