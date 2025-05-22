import { sveltePreprocess } from "svelte-preprocess"; // npm i svelte-preprocess
import adapter from '@sveltejs/adapter-auto';

const config = {
    kit: {
        adapter: adapter(),
    },
    preprocess: sveltePreprocess({
        scss: {},
    }),
};

export default config;