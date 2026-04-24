import { Elysia } from 'elysia';
import { StoreController } from '../services/store.service';
import { CommonResponse } from '../../../models/common.model';
import { UpdateStore } from '../models/store.model';

/**
 * Authentication & Onboarding Routes
 * 
 * This module defines the API endpoints for the multi-stage store updation flow.
 */
export const storeRoutes = new Elysia()
    /**
     * @endpoint POST /update/store
     */
    .post('/update/store', (ctx) => StoreController.updateStore(ctx), {
        ...UpdateStore,
        ...CommonResponse
    })
    /**
     * @endpoint GET /store/:storeId/data
     */
    .get('/store/:storeId/data', (ctx) => StoreController.getStoreData(ctx), {
        ...CommonResponse
    })
    /**
     * @endpoint GET /store/:storeId
     */
    .get('/store/:storeId', (ctx) => StoreController.getStore(ctx), {
        ...CommonResponse
    })
    /**
     * @endpoint GET /store/tables/:storeId
     */
    .get('/store/tables/:storeId', (ctx) => StoreController.listStoreTables(ctx), {
        ...CommonResponse
    });