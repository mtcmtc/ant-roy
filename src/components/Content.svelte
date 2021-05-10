<script>
	import { onMount } from 'svelte';

    import SectionTemplate from './SectionTemplate.svelte';
    import Section from './Section.svelte';
    import Divider from './Divider.svelte';
    import Gallery from "./Gallery.svelte";

    export let sections = [];

	import ScrollReveal from 'scrollreveal';

</script>

{#each sections as section, i}
	{#if i < 1}
		<Gallery items={sections}/>
	{/if}
	<Section index={i} {...section} />
	<Divider/>
{/each}