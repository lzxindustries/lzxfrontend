---
slug: chromagnon-april-update
title: 'Chromagnon Update: April 2026'
authors: [lars]
tags: [chromagnon, manufacturing]
draft: false
image: /img/instruments/videomancer/videomancer_routing_diagram_dual_in.png
---

Hello video friends. Here's the first monthly Chromagnon update, as promised in the [March production plan](/blog/chromagnon-building-it-right).

<!--truncate-->

## Board Design

The RevI core board schematic and layout are about 90% complete. We expect to place hardware orders by the end of this week, with prototype boards arriving for review the last week of April. A few days behind the original target, but still on schedule.

## Firmware & Tooling

Chromagnon firmware is now integrated into the Videomancer code libraries, and it looks like a straight shot to completion.

We've built an automated test tool that cycles through all video IO modes in rapid succession. It's ready for Chromagnon — when hardware lands, verification should move fast. If we need further board changes, we can iterate quickly and catch everything.

The desktop app [LZX Connect](https://github.com/lzxindustries/videomancer-firmware/releases) is in pre-release — community members are already using it to test Videomancer release candidates, and it's set up to work with Chromagnon as well.

## Videomancer Update

Reception for the Videomancer pre-releases has been great. Many users are enjoying the 17 new programs, and we've been uploading weekly builds with improvements and fixes. The [Videomancer documentation](/docs/instruments/videomancer/user-manual) has been fully revised with new diagrams:

![Videomancer Dual In Routing Diagram](/img/instruments/videomancer/videomancer_routing_diagram_dual_in.png)

All of it feeds into Chromagnon — the two codebases share most of their infrastructure.

## Schedule

Here's where we stand against the [March plan](/blog/chromagnon-building-it-right):

| Milestone                             | Target               | Status                            |
| ------------------------------------- | -------------------- | --------------------------------- |
| RevI core board design                | Early April          | ~90% complete, on track           |
| Firmware integration on dev hardware  | April                | In progress, ahead of plan        |
| RevI prototype fabricated & delivered | Late April–Early May | Hardware orders placing this week |
| First demo content                    | May                  | On track                          |
| Ship Unit #1                          | August 2026          | On track                          |

Still on schedule.

## What's Next

In May, I expect to have RevI prototype hardware in hand — first power-on, first tests, and demos of Chromagnon running. You'll see it.

Lars

---

_Questions about your order? Email **sales@lzxindustries.net**. For general discussion, join us on [Discord](https://discord.gg/lzx)._
