<script>
	export let data = {}
</script>

<div class='m-5'>
{#if data.tweet}
	{@html data.tweet}
{:else}
	<div class="p-5 bg-white text-midnight rounded-xl text-body md:text-xl tracking-wide">
		{#if data.quote}
			<p>&quot;{data.quote}&quot;</p>
			<p class="text-right uppercase">&mdash;{data.source}</p>
		{:else}
			{@html data.stat}
		{/if}
	</div>
{/if}
</div>