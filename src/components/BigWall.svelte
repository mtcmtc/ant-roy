<script>
	import { onMount } from 'svelte';
	import SectionTemplate from './SectionTemplate.svelte';
	import Extra from './Extra.svelte';
	import Divider from './Divider.svelte';
	
	export let extras = [];

	// let shuffled = extras.sort(() => Math.random() - 0.5);
    onMount(()=>{
    	const script = document.createElement("script");
		script.setAttribute("src", "https://platform.twitter.com/widgets.js");
		document.getElementsByClassName("twitter-tweet")[0].appendChild(script);
    })

</script>

{#each extras as extra, i}
<SectionTemplate class="bigwall py-10">
	<h2 class="w-full title-font lg:text-5xl sm:text-4xl text-3xl mb-4 font-bold text-center text-white uppercase">{extra.title}</h2>
	<div class="container mx-auto column-count-1 md:column-count-2 lg:column-count-3 column-gap-0 overflow-hidden">
		{#each extra.data as item, i}
			<div class="w-full scroll-reveal break-inside-avoid overflow-hidden">
				<Extra data={item} />
			</div>
		{/each}		
	</div>
</SectionTemplate>
<Divider />
{/each}