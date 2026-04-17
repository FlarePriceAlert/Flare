# Alert Priority Ladder

Flare should decide quickly which alerts interrupt the operator and which can wait for batching.

## Highest priority

- Price breaks paired with thinning liquidity.
- Liquidation risk that is moving toward a decision point.
- Whale-triggered moves that also change local market structure.

## Medium priority

- Repeated tests of a key level without confirmation.
- Large transfers with weak immediate market response.

## Lowest priority

- Cosmetic level breaks during thin hours.
- Duplicative alerts that add no new context to an existing thread.

The ladder should stay short so an operator can reason about it without scanning a long ruleset.
