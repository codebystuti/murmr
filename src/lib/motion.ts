// framer-motion 11 hands WAAPI opacity fades back to inline styles one frame late (a visible blink).
// Spread into <MotionConfig>: an onUpdate handler in context makes every motion element below use the
// main-thread animator, which has no handoff gap.
export const mainThreadMotion = { onUpdate: () => {} } as Record<string, unknown>;
