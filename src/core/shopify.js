/**
 * Shopify Storefront — loja do Baluarte por `fetch` (sem SDK, web leve #238).
 *
 * Usa a Storefront API (GraphQL) com um **token público** (feito pra rodar no
 * navegador; quem protege são os escopos do token). Modelo: print-on-demand /
 * dropshipping — vender sem estoque, o fornecedor produz/envia sob demanda.
 *
 * Config por env: VITE_SHOPIFY_DOMAIN (ex.: minha-loja.myshopify.com) +
 * VITE_SHOPIFY_STOREFRONT_TOKEN. Sem config, `shopifyConfigured()` é false e a
 * /loja mostra "em configuração" — zero regressão.
 */

const DOMAIN = (import.meta.env.VITE_SHOPIFY_DOMAIN || '')
  .replace(/^https?:\/\//, '').replace(/\/+$/, '');
const TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '';
const API_VERSION = '2024-10';

export function shopifyConfigured() { return !!(DOMAIN && TOKEN); }
export function shopifyDomain() { return DOMAIN; }

async function storefront(query, variables) {
  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN
    },
    body: JSON.stringify({ query, variables: variables || {} })
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    const err = new Error('Shopify Storefront error');
    err.data = json;
    throw err;
  }
  return json.data;
}

/**
 * Lista produtos da loja. Devolve `[{ id, title, handle, url, image, alt,
 * price, currency }]` ou `null` (sem config / erro).
 */
export async function shopifyProducts(limit = 24) {
  if (!shopifyConfigured()) return null;
  try {
    const data = await storefront(
      `query Products($n: Int!) {
        products(first: $n, sortKey: BEST_SELLING) {
          edges { node {
            id title handle onlineStoreUrl
            featuredImage { url altText }
            priceRange { minVariantPrice { amount currencyCode } }
          } }
        }
      }`,
      { n: limit }
    );
    const edges = (data && data.products && data.products.edges) || [];
    return edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      url: node.onlineStoreUrl || `https://${DOMAIN}/products/${node.handle}`,
      image: node.featuredImage ? node.featuredImage.url : null,
      alt: (node.featuredImage && node.featuredImage.altText) || node.title,
      price: node.priceRange ? Number(node.priceRange.minVariantPrice.amount) : null,
      currency: node.priceRange ? node.priceRange.minVariantPrice.currencyCode : 'BRL'
    }));
  } catch {
    return null;
  }
}
