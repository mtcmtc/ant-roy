<script>
    import { onMount } from 'svelte'
    import Section from './Section.svelte';
    import Divider from './Divider.svelte';
    export let title = '';
    export let id = '';
    export let desc = '';
    export let img = '';
    export let audio = []

    let index = 0;

    let sounds = [];
    
    function handleClick(e){
        console.log('click')

        sounds[index].play();

    	index += 1;
    	audio.length === index && (index = 0);
    }

    onMount( () =>{

        sounds = audio.map( (src, i) => {
            let sound = new Audio();
            sound.src = src;
            return sound
        })
    })
</script>

<Section index={1} title={title} id={id} desc={desc} img={img} centered={true}>
    <button slot="cta" on:click={handleClick} class="w-full max-w-200px mx-auto mt-4 duration-200 hover:opacity-90 focus:outline-none transform scale-100 active:scale-95 scroll-reveal"><img alt="press button to hear sound clips from anthony edwards" src="media/button-face.svg"></button>
</Section>