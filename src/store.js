import { writable, readable } from 'svelte/store'

export const loading = writable(true)
export const scrollReveal = readable(true);
export const videosLoading = writable(0)