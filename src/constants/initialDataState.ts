import { DataState } from "../types/models";

export const initialDataState: DataState = {
  users: {
    items: [],
    pagination: {
      page: 0,
      pageSize: 0,
      totalItems: 0,
      totalPages: 0,
    },
  },
  records: {
    items: [],
    pagination: {
      page: 0,
      pageSize: 0,
      totalItems: 0,
      totalPages: 0,
    },
  },
  receipts: {
    items: [],
    pagination: {
      page: 0,
      pageSize: 0,
      totalItems: 0,
      totalPages: 0,
    },
  },
  docs: {
    items: [],
    pagination: {
      page: 0,
      pageSize: 0,
      totalItems: 0,
      totalPages: 0,
    },
  },
  images: {
    items: [],
    pagination: {
      page: 0,
      pageSize: 0,
      totalItems: 0,
      totalPages: 0,
    },
  },
  travels: {
    items: [],
    pagination: {
      page: 0,
      pageSize: 0,
      totalItems: 0,
      totalPages: 0,
    },
  },
  activities: {
    items: [],
    pagination: {
      page: 0,
      pageSize: 0,
      totalItems: 0,
      totalPages: 0,
    },
  },
  categories: {
    items: [],
    pagination: {
      page: 0,
      pageSize: 0,
      totalItems: 0,
      totalPages: 0,
    },
  },
  merchants: {
    items: [],
    pagination: {
      page: 0,
      pageSize: 0,
      totalItems: 0,
      totalPages: 0,
    },
  },
  banks: {
    items: [
      { id: "TANGERINE", name: "TANGERINE" },
      { id: "DESJARDINS", name: "DESJARDINS" },
      { id: "RBC", name: "RBC" },
    ],
    pagination: {
      page: 1,
      pageSize: 3,
      totalItems: 3,
      totalPages: 1,
    },
  },
};
