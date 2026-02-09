import { createDataProvider, CreateDataProviderOptions } from '@refinedev/rest';
import { BACKEND_BASE_URL } from '@/constants';
import { CreateResponse, GetOneResponse, ListResponse } from '@/types';
import { HttpError } from '@refinedev/core';

if (!BACKEND_BASE_URL) {
  throw new Error('BACKEND_BASE_URL environment variable must be a valid URL');
}

const buildHttpError = async (response: Response): Promise<HttpError> => {
  let message = 'Request Failed';

  try {
    const payload = (await response.json()) as { message?: string };

    if (payload?.message) message = payload.message;
  } catch {}

  return {
    message,
    statusCode: response.status,
  };
};

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({ resource }) => resource,

    buildQueryParams: async ({ resource, pagination, filters, sorters }) => {
      const page = pagination?.currentPage ?? 1;
      const pageSize = pagination?.pageSize ?? 10;

      const params: Record<string, string | number> = { page, limit: pageSize };

      if (sorters && sorters.length > 0) {
        const sort = sorters[0];
        params._sort = sort.field;
        params._order = sort.order;
      }

      filters?.forEach((filter) => {
        const field = 'field' in filter ? filter.field : '';

        const value = String(filter.value);

        if (resource === 'subjects') {
          if (field === 'department') params.department = value;
          if (field === 'name' || field === 'code') params.search = value;
        }

        if (resource === 'classes') {
          if (field === 'name') params.search = value;
          if (field === 'subject') params.subject = value;
          if (field === 'teacher') params.teacher = value;
        }
      });

      return params;
    },

    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);

      const payload: ListResponse = await response.clone().json();

      return payload.data ?? [];
    },

    getTotalCount: async (response) => {
      if (!response.ok) throw await buildHttpError(response);

      const payload: ListResponse = await response.clone().json();

      return payload.pagination?.total ?? payload.data?.length ?? 0;
    },
  },
  create: {
    getEndpoint: ({ resource }) => resource,

    buildQueryParams: async ({ variables }) => variables,

    mapResponse: async (response) => {
      const json: CreateResponse = await response.json();

      return json.data ?? [];
    },
  },
  getOne: {
    getEndpoint: ({ resource, id }) => `${resource}/${id}`,

    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);

      const json: GetOneResponse = await response.json();

      return json.data ?? {};
    },
  },
};

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export { dataProvider };
