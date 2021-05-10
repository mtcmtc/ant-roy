<script>
    import { fly } from 'svelte/transition';
    import SmoothScroll from 'smooth-scroll';

    export let title = "";
    export let logo = "";
    export let navItems = [];

    let menuOpen = false;

    function toggleMenu(){
        menuOpen = !menuOpen;
    }

    const scroll = new SmoothScroll('a[href*="#"]', {offset: function(anchor, toggle) { return 150 } });
</script>

<nav class="bg-black bg-opacity-70 shadow border-aurora border-b-2 border-opacity-70 z-10 sticky top-0">
    <div class="container px-6 py-3 mx-auto lg:flex lg:justify-between lg:items-center">
        <div class="flex items-center justify-between">
            <div class={logo && 'h-14 w-14 md:h-20 md:w-20 overflow-hidden relative' || ''}>
                <a class={`text-xl font-bold lg:text-2xl hover:text-gray-300 uppercase ${ logo && 'absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 md:w-28' || ''}`} href="#top">
                    {#if !logo}
                        {title}
                    {:else}
                        <img class="w-full" alt={logo.alt} src={logo.src}>
                    {/if}
                </a>
            </div>
            
            <!-- Mobile menu button -->
            <div class="flex lg:hidden">
                <button type="button" class="text-aurora  hover:text-aurora-light focus:outline-none focus:text-aurora-light" aria-label="toggle menu" on:click={toggleMenu}>
                    <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current">
                        <path fill-rule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"></path>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Mobile Menu open: "block", Menu closed: "hidden" -->
        <div class={`items-center lg:flex ${menuOpen ? 'block' : 'hidden'}`}>
            <div class="flex flex-col lg:flex-row lg:mx-6 text-sm font-bold uppercase tracking-wide">
                {#each navItems as item, i}
                    <a class={`my-1 p-2 hover:text-aurora border-b-4 border-transparent lg:hover:border-aurora lg:mx-0 xl:mx-2 lg:my-0 transition-colors`} href={`#section-${i}`}>{item.title}</a>
                    {#if i >= navItems.length-1}
                        <a class="my-1 p-2 text-midnight hover:text-lake-dark bg-lake-light rounded-md hover:bg-lake-light-interact text-center lg:mx-4 lg:my-0 transition-colors" href="https://www.nba.com/timberwolves">Enter Timberwolves.com</a>
                    {/if}
                {/each}
            </div>
        </div>
    </div>
</nav>