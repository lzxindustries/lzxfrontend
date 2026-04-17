---
slug: arcs-and-anvils
title: Arcs & Anvils
authors: [lars]
tags: [chromagnon]
---

Good afternoon, video folk.

This past week were happy to celebrate validation of the analog circuitry on the Chromagnon Core RevF board -- and we're close to fully integrating the changes into RevG.

<!-- truncate -->

In both hardware and software design, there are different categories of releases and versions -- major versions, minor versions, and bugfix versions. RevF was a major overhaul of our previous hardware approach, which combined what was 3 previous assemblies into a single board. For that reason, it required several weeks of intense work, and a complete reroute of the board design.

RevG on the other hand is a minor revision -- it's purpose is to resolve any design issues present in the RevF board, like parts value changes, CAD footprint problems, or drafting bloopers.

Any time a board is tested for the first time, it's almost a guarantee that something will need to be adjusted. That's why on any of your LZX modules, it is quite rare to see a RevA board used on a device in production. By the time we end up in production, it is usually after several iterations.

To make my point, RevG is not going to take months of work, like RevF did. The CAD part of the revisions will be done in a couple of days, and the next hardware review will be focused on the changes that were made between RevF and RevG.

In the meantime, we need to sign off on final versions of Chromagnon's other pieces, such as design for the case/enclosure, button caps, and control knobs. We learned a lot during design of Gen3's control knob mold, and there are several adjustments I want to make, to ensure seamless production. We have a Formlabs Form 3 printer here, which helps a lot when working on molded parts design -- we can usually print a prototype in a few hours or overnight, allowing us to iterate on a design daily.

There is also some firmware polishing to do -- mostly involving porting over portions of TBC2's codebase.

Recording demo videos is a big priority! But biggest priority right now is our Production Ready milestone.

Here are some clips from the week, though -- testing Chromagnon's controls manually, and then cross-patched with Gen3 modules for fun.

<iframe width="560" height="315" src="https://www.youtube.com/embed/rxZHwIVFh7I?si=LXihlkJSeLpqaQlc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<iframe width="560" height="315" src="https://www.youtube.com/embed/X2D14JDnUug?si=ZKPa87637RVyRBSt" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Thanks for reading.
Lars
