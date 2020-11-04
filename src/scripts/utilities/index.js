import includeCss from './includeCss';

const SDK = window.__LIFERAY_REMOTE_APP_SDK__;
const client = new SDK.Client();

const getCatalog = () =>
	getItem('/o/headless-commerce-admin-catalog/v1.0/catalogs');

const getChannel = () =>
	getItem('/o/headless-commerce-admin-channel/v1.0/channels');

const getProduct = () =>
	getItem(
		'/o/headless-commerce-admin-catalog/v1.0/products?nestedFields=skus'
	);

const getAccount = () =>
	getItem('/o/headless-commerce-admin-account/v1.0/accounts/');

const getProductOptions = (channelId, productId) =>
	getItems(
		`/o/headless-commerce-delivery-catalog/v1.0/channels/${channelId}/products/${productId}/product-options`
	);

async function getCart(channelId, accountId, currencyCode) {
	const cart = await getItem(
		`/o/headless-commerce-delivery-cart/v1.0/channels/${channelId}/carts`,
		false
	);

	if (cart) {
		return cart;
	}

	return createNewCart(channelId, accountId, currencyCode);
}

export async function initializeEnv() {
	includeCss(client);

	const [catalog, channel, product, account] = await Promise.all([
		getCatalog(),
		getChannel(),
		getProduct(),
		getAccount(),
	]);

	const [cart, productOptions] = await Promise.all([
		getCart(channel.id, account.id, channel.currencyCode),
		getProductOptions(channel.id, product.productId),
	]);

	return {
		client,
		catalog,
		channel,
		product,
		account,
		cart,
		productOptions,
	};
}

export async function createNewCart(channelId, accountId, currencyCode) {
	const body = JSON.stringify({
		accountId,
		currencyCode,
		cartItems: [],
	});

	const response = await client.fetch(
		`/o/headless-commerce-delivery-cart/v1.0/channels/${channelId}/carts`,
		{
			body,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			method: 'POST',
		}
	);

	return response.json();
}

async function getItems(
	apiURL,
	throwErrorWhenNoElements = true,
	returnOnlyFirstEntry = false
) {
	try {
		const response = await client.fetch(apiURL);

		const data = await response.json();

		if (!data.items?.length && returnOnlyFirstEntry) {
			if (throwErrorWhenNoElements) {
				throw new Error(`No items available at endpoint: ${apiURL}`);
			}
		}
		return returnOnlyFirstEntry ? data.items[0] : data.items;
	} catch (error) {
		console.error(error);
	}
}

export const getItem = (apiURL, throwError) =>
	getItems(apiURL, throwError, true);

export async function submitPicture(picture) {
	const formData = new FormData();

	formData.append('file', picture);

	const siteGroupId = await client.get('siteGroupId');

	const response = await client.fetch(
		`/o/headless-delivery/v1.0/sites/${siteGroupId}/documents`,
		{
			headers: {
				Accept: 'application/json',
			},
			method: 'POST',
			body: formData,
		}
	);

	const data = await response.json();

	if (data.status === 'CONFLICT') {
		throw new Error(data.title);
	}

	return data;
}

export async function addProductToCart(cartId, product, pictureData) {
	const body = JSON.stringify({
		quantity: 1,
		skuId: product.skus[0].id,
		options: JSON.stringify([
			{
				key: 'pictureurl',
				value: [pictureData.contentUrl],
			},
		]),
	});

	const response = await client.fetch(
		`/o/headless-commerce-delivery-cart/v1.0/carts/${cartId}/items`,
		{
			body,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			method: 'POST',
		}
	);

	const data = await response.json();

	return data;
}
