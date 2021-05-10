<script>
    import { onMount } from 'svelte'
    import {Howl, Howler} from 'howler';
    // import 'ion-sound'
    import Section from './Section.svelte';
    import Divider from './Divider.svelte';
    export let title = '';
    export let id = '';
    export let desc = '';
    export let img = '';
    export let audio = []

    // import play from 'audio-play';
    // import load from 'audio-loader';

    let index = 0;

    let sounds = [];
    
    function handleClick(e){
        console.log('click')
        // e.target.preventDefault();
	    // sounds[index].play();
        // ion.sound.play(audio[index]);

        // load(audio[index]).then(play);

        sounds[index].play();

        // index !== 0 ? sounds[index-1].stop() : sounds[sounds.length-1].stop();

    	index += 1;
    	audio.length === index && (index = 0);
    }

    onMount( () =>{
    	// sounds = audio.map( (src, i) => {
    	// 	return new Howl({
		   //  	src:[src],
		   //  	onplay: function(){
		   //  		i !== 0 ? 
		   //  		sounds[i-1].stop()
		   //  		: 
		   //  		sounds[sounds.length-1].stop();
		   //  	}
		   //  })
    	// })
        // sounds = audio.map( (src, i) => {
        //  return { name: src}
        // })

        sounds = audio.map( (src, i) => {
            let sound = new Audio();
            sound.src = src;
            return sound
        })

        // console.log(sounds)
        // ion.sound({
        //     sounds: sounds,
        //     volume: 1,
        //     path: "https://www.nba.com/resources/static/team/v2/timberwolves/projects/2020-21/tw21_roy/",
        //     preload: true,
        //     multiplay: false,
        // });
    })
</script>

<Section index={1} title={title} id={id} desc={desc} img={img} centered={true}>
    <button slot="cta" on:click={handleClick} class="w-full max-w-200px mx-auto mt-4 duration-200 hover:opacity-90 focus:outline-none transform scale-100 active:scale-95 scroll-reveal"><img alt="press button to hear sound clips from anthony edwards" src="https://www.nba.com/resources/static/team/v2/timberwolves/projects/2020-21/tw21_roy/button-face.svg"></button>
</Section>