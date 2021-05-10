<script>
	import { getContext } from 'svelte';
	import { loading, videosLoading, scrollReveal } from '../store.js'
	import SectionTemplate from './SectionTemplate.svelte';
	import YouTube from 'svelte-youtube';
	import ScrollReveal from 'scrollreveal';

	export let header = {}
	const { alt, src, video, id} = header;
	const royContext = getContext('royState');

	const options = {
		playerVars: {
		  autoplay: 0,
		}
	};

	function onEnd(event){
		const player = event.detail.target;

		player.playVideo();
	}

	function onReady(event) {
		const player = event.detail.target;
		player.mute();
		
		ScrollReveal().reveal(`#header`, {
			afterReveal: e => { 
				player.playVideo();
			},
			afterReset: e => { 
				player.stopVideo();
			},
			reset: true,
    	});

		videosLoading.update(existing => existing - 1);

		if($videosLoading === 0){
			loading.set(false);
		}
	}
</script>

<SectionTemplate id="header">
	<div class="lg:w-1/2 mx-auto mt-5 ">
		<img alt={alt} src={src}>
	</div>
	<div class="lg:w-3/5 mx-auto">
		{#if video}
			<YouTube
				videoId={video}
				id={id}
				class={'ytVideo scroll-reveal'}
				{options}
				on:ready={e => onReady(e)}
				on:end={e => onEnd(e)}
			/>
		{/if}
	</div>
</SectionTemplate>