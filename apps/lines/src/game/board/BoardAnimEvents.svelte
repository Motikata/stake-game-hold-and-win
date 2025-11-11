<script lang="ts">
    import { getContext } from '../../game/context';

    const ctx = getContext();

    // Минимален listener: потвърждава веднага, за да няма timeout.
    ctx.eventEmitter.subscribeOnMount({
        boardWithAnimateSymbols: async (payload: {
            symbolPositions: { reel: number; row: number }[];
            reply?: () => void;
        }) => {
            try {
                // Тук можеш да пуснеш реалната ти анимация върху символите.
                // await animateGlow(payload.symbolPositions);
            } finally {
                payload?.reply?.(); // критично
            }
        },
    });
</script>
