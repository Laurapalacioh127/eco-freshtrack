import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import Boom from '@hapi/boom';
import { fetchOpenFoodFactsProductRepository } from '../../src/features/barcode/barcode.repository';

const CODE = '7702001043276';

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => mock.restoreAll());

test('calls the Open Food Facts product URL with the constant User-Agent', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () => jsonResponse({ status: 1, product: { product_name: 'Leche' } }));

  await fetchOpenFoodFactsProductRepository(CODE);

  const [url, init] = fetchMock.mock.calls[0].arguments as unknown as [string, RequestInit];
  assert.match(url, new RegExp(`/api/v2/product/${CODE}\\.json\\?fields=`));
  assert.equal((init.headers as Record<string, string>)['User-Agent'], 'FreshTrack/1.0 (student project)');
});

test('returns the product on status 1', async () => {
  mock.method(globalThis, 'fetch', async () => jsonResponse({ status: 1, product: { product_name: 'Leche' } }));

  assert.deepEqual(await fetchOpenFoodFactsProductRepository(CODE), { product_name: 'Leche' });
});

test('returns null on 404', async () => {
  mock.method(globalThis, 'fetch', async () => jsonResponse({}, 404));

  assert.equal(await fetchOpenFoodFactsProductRepository(CODE), null);
});

test('returns null when status is 0', async () => {
  mock.method(globalThis, 'fetch', async () => jsonResponse({ status: 0 }));

  assert.equal(await fetchOpenFoodFactsProductRepository(CODE), null);
});

const expectBoom = async (statusCode: number): Promise<void> => {
  await assert.rejects(fetchOpenFoodFactsProductRepository(CODE), (err: unknown) => {
    assert.ok(Boom.isBoom(err));
    assert.equal(err.output.statusCode, statusCode);
    return true;
  });
};

test('maps a 503 upstream response to Boom 502', async () => {
  mock.method(globalThis, 'fetch', async () => jsonResponse({}, 503));

  await expectBoom(502);
});

test('maps a network failure to Boom 502', async () => {
  mock.method(globalThis, 'fetch', async () => {
    throw new TypeError('fetch failed');
  });

  await expectBoom(502);
});

test('maps an invalid JSON body to Boom 502', async () => {
  mock.method(globalThis, 'fetch', async () => new Response('not json', { status: 200 }));

  await expectBoom(502);
});

test('maps a timeout abort to Boom 504', async () => {
  mock.method(
    globalThis,
    'fetch',
    (_url: unknown, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
      }),
  );

  await assert.rejects(fetchOpenFoodFactsProductRepository(CODE, 10), (err: unknown) => {
    assert.ok(Boom.isBoom(err));
    assert.equal(err.output.statusCode, 504);
    return true;
  });
});
