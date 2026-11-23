import Boom from '@hapi/boom';
import { OPEN_FOOD_FACTS_TIMEOUT_MS, OPEN_FOOD_FACTS_URL } from '../../config';
import { OpenFoodFactsProduct } from './barcode.types';

const FIELDS = 'product_name,product_name_es,generic_name,categories,image_front_url,image_url';
// Constant user agent: Open Food Facts asks for one, and it carries no personal data.
const USER_AGENT = 'FreshTrack/1.0 (student project)';

const TIMEOUT_MESSAGE = 'Open Food Facts tardó demasiado en responder, intenta de nuevo';
const UPSTREAM_MESSAGE = 'No pudimos consultar Open Food Facts, intenta de nuevo';

interface OpenFoodFactsResponse {
  status?: number;
  product?: OpenFoodFactsProduct;
}

export const fetchOpenFoodFactsProductRepository = async (
  code: string,
  timeoutMs: number = OPEN_FOOD_FACTS_TIMEOUT_MS,
): Promise<OpenFoodFactsProduct | null> => {
  const controller = new AbortController();
  // The flag makes the timeout detection independent of how the abort error surfaces
  // (at fetch() or while reading the body in res.json()).
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const url = `${OPEN_FOOD_FACTS_URL}/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: controller.signal,
    });

    if (res.status === 404) return null;
    if (!res.ok) throw Boom.badGateway(UPSTREAM_MESSAGE);

    const body = (await res.json()) as OpenFoodFactsResponse | null;

    if (!body || body.status !== 1 || !body.product) return null;

    return body.product;
  } catch (error) {
    if (Boom.isBoom(error)) throw error;
    if (timedOut || (error instanceof Error && error.name === 'AbortError')) {
      throw Boom.gatewayTimeout(TIMEOUT_MESSAGE);
    }
    throw Boom.badGateway(UPSTREAM_MESSAGE);
  } finally {
    clearTimeout(timer);
  }
};
