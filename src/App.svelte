<script>
	import { onMount } from 'svelte';
	import { loading, videosLoading } from './store.js'

	import Tailwind from "./Tailwind.svelte";
	import Nav from "./components/Nav.svelte";
	import Header from "./components/Header.svelte";
	import Content from "./components/Content.svelte";
	import Soundboard from "./components/Soundboard.svelte";
	import Hero from "./components/Hero.svelte";
	import Footer from "./components/Footer.svelte";
	import BigWall from "./components/BigWall.svelte";
	import Loading from "./components/Loading.svelte";

	import data from "./data/data.js";
	const {title, header, logo, stats, soundboard, extras} = data;

	videosLoading.set(stats.length);
</script>

<Tailwind />

<main class="font-body bg-black text-white">
	{#if $loading}
		<Loading />
	{/if}
	<Nav title={title} logo={logo} navItems={stats}/>
	<Header header={header}/>
	<Content sections={stats}/>
	<BigWall extras={extras}/>
	<Soundboard {...soundboard}/>
	<Footer />
</main>

<style global>
	@import url("https://use.typekit.net/fnc3doq.css");
</style>