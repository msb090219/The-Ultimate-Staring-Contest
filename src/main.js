import './app.css';
import App from './App.svelte';
import './lib/utils/seedData.js'; // Import to make window.seedDatabase available

const app = new App({
	target: document.getElementById('app')
});

export default app;
