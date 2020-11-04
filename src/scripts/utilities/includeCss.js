export default function includeCss(remoteClient) {
	return remoteClient.get('css').then((href) => {
		const head = document.getElementsByTagName('HEAD')[0];
		const link = document.createElement('link');

		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = href;

		head.appendChild(link);
	});
}
