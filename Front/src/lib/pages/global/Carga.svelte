<script>
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
  
    let loading = true;
  
    onMount(() => {
        setTimeout(() => {
            loading = false;
        }, 1000);
    });
</script>
  
{#if loading}
    <div class="loading-container" transition:fade>
        <div class="spinner"></div>
    </div>
{/if}
  
<style>
    .loading-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #111;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .spinner {
        width: 60px;
        height: 60px;
        border: 6px solid rgba(255, 255, 255, 0.2);
        border-top: 6px solid #fff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
        transform: rotate(0deg);
        }
        100% {
        transform: rotate(360deg);
        }
    }
</style>