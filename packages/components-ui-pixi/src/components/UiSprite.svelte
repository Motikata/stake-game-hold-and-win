<script lang="ts">
 import { onMount } from 'svelte';
 import { Sprite, type SpriteProps, Rectangle, type RectangleProps } from 'pixi-svelte';
 import type { sharedAssetsPixi } from 'constants-shared/assets';

 // Позволяваме и на двата вида пропове + optional spriteKey
 type Props = Partial<SpriteProps> &
   Partial<RectangleProps> & {
  key?: keyof typeof sharedAssetsPixi;
 };

 const { key, ...rest }: Props = $props();

 onMount(() => {
  //console.log('UiSprite-like: spriteKey =', key);
 });

 // Хелпър само за Sprite — добавяме ключа, но само ако съществува
 const spriteProps = $derived.by(() => {
  const p = { ...rest } as Record<string, unknown>;
  if (key) p.key = key;
  return p as SpriteProps;
 });

 const rectangleProps = $derived(rest as RectangleProps);
</script>

<!-- Ако имаме spriteKey → Sprite, иначе → Rectangle -->
{#if key}
 <Sprite {...spriteProps} />
{:else}
 <Rectangle borderRadius={50} {...rectangleProps} />
{/if}
