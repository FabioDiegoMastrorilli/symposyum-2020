import { white as whiteTheme } from './utilities/themes';

import '../style/main.scss';

import { convertDataURLtoFile } from './utilities/picture';
import {
	initializeEnv,
	submitPicture,
	addProductToCart,
} from './utilities/index';

var imageEditor = new window.tui.ImageEditor('#tui-image-editor', {
	includeUI: {
		loadImage: {
			path: 'img/sampleImage.png',
			name: 'SampleImage',
		},
		theme: whiteTheme,
		initMenu: 'filter',
		menuBarPosition: 'bottom',
	},
	cssMaxWidth: 700,
	cssMaxHeight: 400,
	selectionStyle: {
		cornerSize: 20,
		rotatingPointOffset: 70,
	},
});

window.onresize = () => {
	imageEditor.ui.resizeEditor();
};

initializeEnv().then(({ client, ...data }) => {
	const editorWrapper = document.querySelector('.editor-wrapper');
	const previewContainer = document.querySelector('.preview-container');
	const printPreview = document.querySelector('.print-preview');
	const previewButton = document.getElementById('preview-btn');
	const backButton = document.getElementById('back-btn');
	const addToCartButton = document.getElementById('add-to-cart-btn');
	const uploadPictureButton = document.getElementById('upload-picture-btn');
	const uploadPictureInput = document.getElementById('image-file-input');
	let pictureDataURL;

	previewButton.addEventListener('click', () => {
		editorWrapper.classList.toggle('d-none');
		previewContainer.classList.toggle('d-none');
		pictureDataURL = imageEditor.toDataURL();
		printPreview.style.backgroundImage = `url('${pictureDataURL}')`;
	});

	backButton.addEventListener('click', () => {
		editorWrapper.classList.toggle('d-none');
		previewContainer.classList.toggle('d-none');
	});

	addToCartButton.addEventListener('click', () => {
		const pictureName = `${data.product.productId}-${
			data.account.id
		}-${Date.now()}`;

		const pictureFile = convertDataURLtoFile(pictureDataURL, pictureName);

		submitPicture(pictureFile).then((pictureData) => {
			addProductToCart(data.cart.id, data.product, pictureData).then(
				(cartData) => {
					if (cartData.status === 'CONFLICT') {
						throw new Error(data.title);
					}

					client.openToast({
						message: 'Product added to your Cart',
						type: 'success',
					});

					editorWrapper.classList.toggle('d-none');
					previewContainer.classList.toggle('d-none');

					printPreview.style.backgroundImage = `url('http://localhost:8080/${pictureData.contentUrl}')`;
				}
			);
		});
	});

	uploadPictureButton.addEventListener('click', (e) => {
		uploadPictureInput.click();
	});

	uploadPictureInput.addEventListener('change', (e) => {
		imageEditor.loadImageFromFile(e.target.files[0]).then(() => {
			imageEditor.clearUndoStack();
		});
	});
});
