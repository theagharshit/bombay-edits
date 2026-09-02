import { NextRequest } from 'next/server';
import { ShippingModel } from '../models/shippingModel';
import { ApiResponse } from '../utils/apiResponse';
import { Validator } from '../middlewares/validatorMiddleware';
import { RequestContext } from '../types/api';

export class ShippingController {
  /**
   * Get all shipping rates and supported currencies
   * GET /api/shipping
   */
  public async getShippingRates() {
    return ApiResponse.success({
      rates: ShippingModel.getAllRates(),
      currencies: ShippingModel.getCurrencies(),
    });
  }

  /**
   * Calculate shipping for a given zone and subtotal
   * POST /api/shipping/calculate or POST /api/shipping
   */
  public async calculateShippingCost(req: NextRequest, _context?: RequestContext) {
    const body = await req.json();
    const { zone, subtotal } = body;

    Validator.requireFields(body, ['zone']);

    const shippingCost = ShippingModel.calculateShipping(zone, Number(subtotal || 0));
    const rateInfo = ShippingModel.getRateByZone(zone);

    return ApiResponse.success({
      zone,
      subtotal: Number(subtotal || 0),
      shippingCost,
      rateInfo,
    });
  }
}

export const shippingController = new ShippingController();
