<script>
	let classList = ''
	let sectionId = ''
	export { sectionId as id }
	export { classList as class }
</script>

<section id={sectionId} class={`mx-auto ${classList || ''}`}>
	<slot></slot>
</section>