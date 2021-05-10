<script>
	import { getContext } from 'svelte';
	import { loading, videosLoading, scrollReveal } from '../store.js'
	import SectionTemplate from './SectionTemplate.svelte';
	import ScrollReveal from 'scrollreveal';
	import YouTube from 'svelte-youtube';

	export let index = 0;
	export let id = '';
	export let img = '';
	export let video = '';
	export let title = '';
	export let subtitle = '';
	export let desc = '';
	export let centered = false;

	const royContext = getContext('royState');

	const options = {
		playerVars: {
		  autoplay: 0,
		}
	};

	function onEnd(event, index){
		const player = event.detail.target;

		player.playVideo();
	}

	function onReady(event, index) {
		const player = event.detail.target;
		player.mute();
		videosLoading.update(existing => existing - 1);

		ScrollReveal().reveal(`#section-${index}`, {
			afterReveal: e => { 
				player.playVideo();
			},
			afterReset: e => { 
				player.stopVideo();
			},
			reset: true,
    	});

		if($videosLoading === 0){
			loading.set(false);
			if($scrollReveal){

				ScrollReveal().reveal('.bigwall .scroll-reveal', {
		    		delay: 500,
		    		useDelay: 'onload',
		    		reset:true,
		    	});

		    	ScrollReveal().reveal('.bigwall .scroll-reveal:first-child', {
		    		delay: 0,
		    		interval:150,
		    		reset:true,
		    	});
		    }
		}
	}
</script>

<SectionTemplate id={`section-${index}`} class="bg-black">
	<div class={`container mx-auto flex md:justify-center px-5 py-10 md:px-6 ${index > 0 ? 'md:py-24' : ''} md:flex-row flex-col items-center`}>
		<div class={`${!video ? 'lg:max-w-1/3' : 'md:min-w-1/2'} md:w-1/2 mb-10 md:mb-0 ${index % 2 !== 0 && 'md:order-1'}`}>
		  {#if video}
			<YouTube
				videoId={video}
				id={id}
				class={'ytVideo scroll-reveal'}
				{options}
				on:ready={e => onReady(e, index)}
				on:end={e => onEnd(e, index)}
			/>
		  {:else}
			<img class="object-cover object-center rounded scroll-reveal" alt={id} src={img}>
		  {/if}
		</div>
		<div class={`md:max-w-1/2 xl:max-w-2/3 lg:px-10 xl:px-18 md:px-16 inline-flex flex-col md:items-start items-center text-center ${!centered ? 'md:text-left' : ''} `}>
		  <h2 class="w-full title-font lg:text-5xl sm:text-4xl text-3xl mb-4 font-bold text-white uppercase scroll-reveal">{title}
		  	{#if subtitle}
		        <br class="hidden lg:inline-block">subtitle
		    {/if}
		  </h2>
		  <p class="w-full text-xl tracking-widest leading-relaxed uppercase scroll-reveal">{desc}</p>
		  <slot name="cta"></slot>
		</div>
	</div>
</SectionTemplate>