<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import {Container, getContextApp, Sprite} from "pixi-svelte";
    import { SignalService, type SignalServiceEvent } from "../../signals/SignalService";
    import { CollectToSunEffect, type CollectEffectData } from "./CollectToSunEffect";
    import {getContainers} from "../utils";

    let stageContainer: Container | null = null;

    function onFx(e: SignalServiceEvent) {
        if (!stageContainer) {
            console.warn("FX Ignored: Overlay Container is not initialized yet.");
            return;
        }

        // 1. Взимаме контейнерите
        const { Board, sunAbove } = getContainers(
            stageContainer,
            'Board',
            'sunAbove',
        );

        console.log("FX Received. Containers:", { Board, sunAbove });

        // 2. ВАЖНО: Проверка дали сме ги намерили
        if (!Board || !sunAbove) {
            console.error("CRITICAL: Board or sunAbove not found in stage!");
            return;
        }

        // 3. Оправяме типа на данните (махни 'as Container')
        const animationData = e.data as CollectEffectData;

        // 4. Взимаме ГЛОБАЛНИТЕ координати на слънцето
        // Това връща Point { x: 123, y: 456 }
        const sunGlobalPos = sunAbove.getGlobalPosition();

        // 5. Присвояваме координатите, а не целия обект
        animationData.toGlobal = sunGlobalPos;

        // 6. Стартираме ефекта
        const effect = new CollectToSunEffect(Board, animationData);
        effect.play();
    }

    onMount(() => {
        const app = getContextApp().stateApp.pixiApplication;
        stageContainer = app?.stage ?? null;

        if (stageContainer) {
            // Абонираме се само, ако контейнерът е валиден
            SignalService.get().add("fx:collectToSun", onFx);
            console.log("SUCCESS: SignalService subscribed via onMount.");
        } else {
            console.error("CRITICAL: PIXI Application Stage not found.");
        }
    });

    onDestroy(() => {
        if (stageContainer) {
            SignalService.get().remove("fx:collectToSun", onFx);
        }
    });
</script>