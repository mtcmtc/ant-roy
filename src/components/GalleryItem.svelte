<script>
	let classList = ''
	let link = ''

	export let item = {};
	export { link as href }
	export { classList as class }
</script>
<div 
	class={`group w-full max-w-xs text-center col-span-2 lg:col-span-1 transform hover:scale-105 transition-transform ease-out duration-300 ${classList}`}
>
    <a href={link}><img class="object-cover object-center w-full mx-auto rounded-lg border-2 border-transparent group-hover:border-aurora transition-color ease-out duration-300" src={item.img} alt={item.title}/>
    </a>
    <div class="mt-2">
        <h3 class="text-lg font-bold tracking-wider text-white uppercase">{item.title}</h3>
    </div>
</div>