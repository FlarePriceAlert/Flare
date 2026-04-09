<div align="center">

# Flare

**Context-aware alert board for Solana price moves.**
Flare does not just tell you that a level hit. It tells you whether the move looks like continuation, liquidation noise, or a move that should be ignored.

[![Build](https://img.shields.io/github/actions/workflow/status/FlarePriceAlert/Flare/ci.yml?branch=master&style=flat-square&label=Build)](https://github.com/FlarePriceAlert/Flare/actions)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
[![Built with Claude Agent SDK](https://img.shields.io/badge/Built%20with-Claude%20Agent%20SDK-2dd4bf?style=flat-square)](https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk)

</div>

---

Most alert bots are barely better than an exchange notification. Price crosses a line, something pings, and the operator is left doing the actual work: deciding whether the move is building, failing, or not worth another second of attention.

Flare is built for that missing layer. It watches tracked Solana names, classifies the move after a trigger fires, and turns a raw alert into a read on what kind of event just hit the tape.

`WATCH -> DETECT -> CLASSIFY -> EXPLAIN -> ESCALATE OR IGNORE`

---

Alert Board • Triggered Alert View • Why Flare Matters • At a Glance • Signal Quality Ladder • Reading A Trigger • Operator Workflow • Example Output • Trigger Types • Risk Controls • Quick Start

## Alert Board

![Flare Alerts](assets/preview-alerts.svg)

## Triggered Alert View

![Flare Trigger](assets/preview-trigger.svg)

## Why Flare Matters

The market already has enough alerts. The problem is not alert scarcity. The problem is attention waste.

A clean alert product should answer three questions immediately:

1. did the level actually matter
2. what kind of move caused it
3. what should the operator do next

Flare is designed around those questions. It is not trying to become a full trading system. It is trying to reduce the time between "something happened" and "I know whether this deserves action."

That distinction matters most on Solana, where speed is high, noise is constant, and the first move is often the least informative part of the move.

## At a Glance

- `Use case`: interpreting Solana price alerts instead of blindly forwarding them
- `Primary input`: live token price, 1h move, 24h move, and recent volatility behavior
- `Primary failure mode`: firing on raw threshold hits that do not deserve action
- `Best for`: operators who want a trigger plus a read on what kind of move just happened

## What Flare Actually Produces

Flare is strongest when it gives the operator something they can act on without opening five more tabs.

- a clean trigger with price and distance-to-threshold
- a classification such as continuation, unwind, squeeze, or low-quality noise
- a short operator note explaining why the move matters
- a signal severity that helps decide whether the alert should be watched, escalated, or ignored

That output is more useful than a simple "price above X" because it reduces interpretation overhead at the moment attention is most expensive.

## Signal Quality Ladder

| State | What it usually means | Typical response |
|-------|-----------------------|------------------|
| `early watch` | price is near a level but nothing meaningful has happened yet | keep on screen, no escalation |
| `triggered` | the level broke, but context is still mixed | inspect classification before acting |
| `continuation candidate` | move cleared the level with enough support to matter | escalate to active watch |
| `exhaustion or unwind` | the level hit during a sharp reactive move | treat as caution, not momentum |
| `noise` | the threshold technically fired but the move is low quality | ignore and move on |

Flare should spend most of its time in the boring states. A board that makes everything look urgent stops being useful fast.

## Reading A Trigger

Flare is meant to be read top-down.

Start with the condition that fired. Then check the short-horizon move, then the 24h backdrop, and only then read the classification note. That order matters because many alerts are technically true and still operationally worthless.

A good trigger review looks like this:

- did price really cross a level that traders care about
- was the move expanding into the break or fading into it
- does the volatility context support continuation or just reaction
- does the classification add information, or merely restate the event

If the answer to the last question is weak, the alert should be demoted.

## Operator Workflow

Flare is built for the operator who wants to look at fewer alerts, not more alerts.

### 1. Build A Small Alert Book

The product works best when it is watching a deliberate list of Solana names and levels. Overloading the board with every token on the screen turns even good analysis into clutter.

### 2. Let The Trigger Happen First

Flare is not predictive at the threshold level. It becomes useful the moment the market actually interacts with the price you cared about.

### 3. Use The Classification To Save Time

The point of the model layer is not to be dramatic. It is to stop you from burning attention on moves that look important only because they were loud.

### 4. Escalate Only The Alerts With A Real Story

The best Flare alerts describe a situation. They do not just report an event.

## What Flare Intentionally Ignores

- tiny percentage moves that technically trip a rule but have no market meaning
- repetitive alerts around the same stale level
- analysis that simply repeats the threshold without adding a read
- hyper-noisy moves where classification confidence is too weak to be useful

This selectivity is the product. If Flare starts forwarding everything, it loses its reason to exist.

## Example Output

```text
FLARE // TRIGGERED ALERT

token            BONK
condition        price_above
threshold        $0.000031
triggered price  $0.0000318
distance         +2.6%
classification   continuation candidate
severity         elevated

analysis: the move cleared the tracked level with expanding short-horizon momentum.
watch for follow-through rather than fading the first print.
```

## Trigger Types

| Condition | What it means | Best used for |
|-----------|---------------|---------------|
| `price_above` | price crossed a tracked level upward | breakout watch |
| `price_below` | price lost a tracked level downward | support failure or unwind |
| `pct_change_up` | short-horizon expansion exceeded a threshold | fast momentum bursts |
| `pct_change_down` | short-horizon drop exceeded a threshold | liquidation or panic moves |
| `volatility_spike` | recent move became abnormally large | event detection and noise control |

The condition should define the trigger, but the classification should define the interpretation.

## Why The Board Feels More Useful Than A Normal Alert Bot

Normal alert bots are binary. Something happened or it did not.

Flare is useful because it behaves more like a triage layer:

- it turns price events into state changes
- it makes low-quality alerts easier to ignore
- it gives the operator a first opinion without pretending to be a full trade plan
- it helps a fast market feel legible again

That is a much stronger fit for launch than a generic notification product because the value is obvious even to non-dev readers.

## Risk Controls

- `alert cap`: limits the number of active alerts so the board stays readable
- `classification step`: stops raw threshold hits from being treated like finished trade ideas
- `volatility guard`: keeps hyper-noisy moves from being presented as clean signals
- `human-readable output`: forces the system to explain why the alert matters instead of emitting an empty trigger

Flare should be trusted as a triage tool, not as blind execution logic. Its job is to help the operator decide faster with more context.

## Quick Start

```bash
git clone https://github.com/FlarePriceAlert/Flare
cd Flare
bun install
cp .env.example .env
bun run dev
```

## Configuration

```bash
ANTHROPIC_API_KEY=sk-ant-...
COINGECKO_API_URL=https://api.coingecko.com/api/v3
CHECK_INTERVAL_MS=10000
MAX_ALERTS=50
LOG_LEVEL=info
```

## Support Docs

- [Runbook](docs/runbook.md)
- [Changelog](CHANGELOG.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## License

MIT

---

*when the level hits, know what kind of move hit it.*
