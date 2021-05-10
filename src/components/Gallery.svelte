<script>
    import SectionTemplate from './SectionTemplate.svelte'
    import GalleryItem from './GalleryItem.svelte'
    // Import Swiper Svelte components
    import { Swiper, SwiperSlide } from 'swiper/svelte';

    // Import Swiper styles
    import 'swiper/swiper.scss';

    export let items
    export let direction = 'horizontal';
    export let title = '';

    let galleryDirection = '';

    galleryDirection = direction === 'vertical' ? 'gap-4 grid-row-auto' : 'gap-8 grid-cols-4 lg:grid-cols-5'

</script>

<SectionTemplate class="container p-6 mx-auto bg-black">
    {#if title}
        <h2 class="text-xl font-medium text-white md:text-2xl">{title}</h2>
    {/if}
    <div class="flex items-center justify-center">
        <div class={`grid mt-8 ${galleryDirection}`}>
            {#each items as item, i}
                <GalleryItem
                    href={`#section-${i}`}
                    item={item}
                    class={ 
                        (direction !== 'vertical' 
                        && i === items.length - 1
                        && 'col-start-2' 
                        || 
                        '')
                    }/>
            {/each}
        </div>
    </div>
</SectionTemplate>