/**
 * Chapra Basket — Products API (RTK Query)
 */
import { baseApi } from './baseApi';
import { ENDPOINTS } from '../constants';

export interface Product {
  id: string;
  name: string;
  nameHindi?: string;
  description?: string;
  categoryId: string;
  price: number;
  mrp?: number;
  unit: string;
  imageUrl?: string;
  images?: string[];
  stockQty: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isFlashSale: boolean;
  flashPrice?: number;
  flashSaleEndsAt?: string;
  rating: number;
  reviewCount: number;
  tags?: string[];
}

export interface ProductsQuery {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<{ items: Product[]; total: number; page: number }, ProductsQuery>({
      query: (params) => ({ url: ENDPOINTS.PRODUCTS, params }),
      providesTags: ['Products'],
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => ENDPOINTS.PRODUCT_BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Products', id }],
    }),

    getFeaturedProducts: builder.query<Product[], void>({
      query: () => ENDPOINTS.PRODUCTS_FEATURED,
      providesTags: ['Products'],
    }),

    getFlashSaleProducts: builder.query<Product[], void>({
      query: () => ENDPOINTS.PRODUCTS_FLASH_SALE,
      providesTags: ['Products'],
    }),

    getTrendingProducts: builder.query<Product[], void>({
      query: () => ENDPOINTS.PRODUCTS_TRENDING,
      providesTags: ['Products'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetFeaturedProductsQuery,
  useGetFlashSaleProductsQuery,
  useGetTrendingProductsQuery,
} = productsApi;
