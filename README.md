<div align="center">

# Flare

**Context-aware alert board for Solana price moves.**
Flare does not just tell you that a level hit. It tells you whether the move looks like continuation, liquidation noise, or a move that should be ignored.

[![Build](https://img.shields.io/github/actions/workflow/status/FlarePriceAlert/Flare/ci.yml?branch=master&style=flat-square&label=Build)](https://github.com/FlarePriceAlert/Flare/actions)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
[![Built with Claude Agent SDK](https://img.shields.io/badge/Built%20with-Claude%20Agent%20SDK-2dd4bf?style=flat-square)](https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk)

</div>

---

Price alerts are easy to generate and hard to trust. Most bots fire when a number is crossed, then leave the operator to guess what actually happened. Flare is built for the missing step after the trigger.

It watches tracked Solana names, evaluates whether an alert fired because of a real breakout, a sharp unwind, or a low-quality volatility burst, and prints the alert with enough context to make the next action obvious. The output is designed for people who want fewer alerts, not more alerts.

`WATCH -> DETECT -> CLASSIFY -> ANALYZE -> ALERT`

---

Alert Board - Triggered Alert View - At a Glance - Operating Surfaces - How It Works - Example Output - Alert Conditions - Risk Controls - Quick Start

## At a Glance

- `Use case`: interpreting Solana price alerts instead of blindly forwarding them
- `Primary input`: live token price, 1h move, 24h move, and recent volatility behavior
- `Primary failure mode`: firing on raw threshold hits that do not deserve action
- `Best for`: operators who want a trigger plus a read on what kind of move just happened

## Price Monitor with Alert Zones

![Flare Alerts](assets/preview-alerts.svg)

## Triggered Alert View

![Flare Trigger](assets/preview-trigger.svg)

## Operating Surfaces

- `Alert Board`: shows active levels, current distance to threshold, and whether the move is becoming actionable
- `Triggered Alert View`: turns a threshold hit into an actual read with classification and next-step context
- `Condition Engine`: evaluates alert logic such as cross-up, cross-down, percentage expansion, and volatility spike
- `Analysis Loop`: asks the agent whether the trigger looks like signal, squeeze, unwind, or noise

## Why Flare Exists

The problem with most alert bots is not speed. The problem is interpretation. A user sets a level on BONK or JUP, the alert fires, and now they still have to answer the real question: did price hit that level because the move is building, because it already exhausted itself, or because the chart is just noisy?

Flare exists to make that distinction immediately. It is meant to sit between a dumb threshold bot and a human operator who wants context before acting. It narrows the number of alerts worth paying attention to and adds enough interpretation that the alert can function like a real decision surface.

## What A Good Flare Alert Looks Like

A good alert is not simply "price above X." A good alert has a reason to exist.

- the move actually crossed a tracked threshold
- the recent rate of change makes the trigger meaningful
- volatility is strong enough to matter, but not so chaotic that the alert is junk
- the analysis can describe the move in plain language instead of restating the threshold

Flare is strongest when it converts a mechanical trigger into an immediately readable situation report.

## How It Works

Flare runs a short loop every cycle:

1. fetch the latest market fields for tracked Solana tokens
2. compare the current state to every active alert condition
3. collect the triggers that actually fired during this cycle
4. classify the triggered move using recent price change and volatility context
5. send the alert through the analysis loop so the operator gets a narrative, not just a ping

The important part is that the alert is evaluated after it fires, not just before. That is what turns it from an alarm into an actual monitoring product.

## How To Read The Board

Flare is meant to be read top-down:

1. start with whether a price level actually broke or failed
2. look at the 1h and 24h context around the trigger
3. use the classification to separate continuation from reactive noise
4. decide whether the move deserves escalation, watching, or dismissal

That reading flow matters because many token alerts are technically true and still operationally useless.

## Example Output

```text
FLARE // TRIGGERED ALERT

token            BONK
condition        price_above
threshold        $0.000031
triggered price  $0.0000318
distance         +2.6%
classification   continuation candidate

analysis: the move cleared the tracked level with expanding short-horizon momentum.
watch for follow-through rather than fading the first print.
```

## Alert Conditions

| Condition | What it means | Typical use |
|-----------|---------------|-------------|
| `price_above` | Price crossed a tracked level upward | breakout watch |
| `price_below` | Price lost a tracked level downward | support failure or unwind |
| `pct_change_up` | Short-horizon expansion exceeded a set percent | momentum burst |
| `pct_change_down` | Short-horizon drop exceeded a set percent | liquidation or panic move |
| `volatility_spike` | Recent move became abnormally large | event detection and noise control |

## What Flare Intentionally Ignores

- tiny percentage moves that technically trip a rule but have no market meaning
- stale threshold alerts that would fire repeatedly without adding new information
- empty analysis that just rephrases the trigger instead of interpreting it

The point of the product is to reduce attention waste, not maximize message count.

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

## License

MIT

---

*when the level hits, know what kind of move hit it.*
