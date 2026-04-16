---
slug: spring-cleaning
title: Spring Cleaning
authors: [lars]
tags: [chromagnon]
---

Hello, Chromagnonites and other video freaks.

March has flown past here at headquarters. The last 3 weeks have been dedicated to a spring cleaning of the workspace and an inventory data update, in preparation for Chromagnon and continuing module production.  There were some shifts in team schedules which have required me to focus most of my time on this project, so I apologize for missing some blog posts.  

<!-- truncate -->

When Chromagnon fulfillment begins, we'll be testing and packaging a large number of assemblies. Ensuring we're ready for that stage is exciting and it's all coming together nicely.  We have several different strategies for production: full assembly in house, contracted manufacturing, or both in different stages.  I have quotes out with multiple potential manufacturing partners, and we are setting our resource planning system up to manage consigning some of the parts we have in stock.

The Chromagnon Core RevG PCBs have arrived and we'll be assembling one of those next week. The EuroRack case project prototype tests have gone well and we'll be ordering another round of prototypes next week, as well.  We're making progress on Chromagnon's mechanical parts for the next mold, but still have much to do there -- I expect that project to speed up with the inventory project off our hands next week.

Added to stock this week were (2) Double Vision System and (2) FKG3.  The next restock will be Scrolls.  

**Sebastien asked "I have preordered a Chromagnon ... through one of your dealers, and I was wondering how the preorder is going to be honored. Are you keeping track of the order dates coming from your dealers and are you going to ship them after you ship the orders you received directly? My concern is that I paid the total amount for the Chromagnon to the dealer, but if your dealer did not pay you that amount at the time you might be reluctant to sell it to them at the price I paid at the time (it was $799 if I remember correctly) as you have readjusted your cost estimates.. Thanks for taking the time to respond to my question!"**

Hi, Sebastien!  Dealers are required to place the order with us before offering a preorder.  We will fulfill all orders in exactly the same order they arrived, regardless of whether the order came from a dealer or a direct customer on our webstore.  So everything should be OK with your order as it is.

**Oli asked "Hi, synth noob here. You mentioned that Chromagnon’s parameters can be directly modulated by audio signals without needing any sort of interface. What does this mean exactly? I can plug in audio through an AUX cord and have that influence the visuals on the Chromagnon?**

Hi Oli, thanks for the question.  It means exactly what you think -- you could take a line level audio signal coming out of a music player or other device and patch it directly into any of Chromagnon's 3.5mm input jacks.  This is a very direct form of audio modulation -- it will allow you to visualize the audio signal as it relates to the timing of the video display and itself becomes part of the video signal.  Frequencies near 120Hz, for example, when the video format has a 60Hz refresh rate, will show two waveforms across the screen.  When these external waveforms start mixing with Chromagnon's internal H and V ramp  generators, that's when things get more complex.  Realtime modulation and signal visualization are processes video synthesizers really excel at.  

**Oli also asked "What is an ‘envelope follower’ and what advantages does it have in this application? Really excited to have audio visual reactivity and involved in my process :)"**

An envelope follower is a circuit that you would put between an audio source (like line out from a music player) and a modulation input in your video synthesizer (like the threshold of a wipe generator.)

The envelope follower's job is to follow the amplitude peaks of the incoming waveform and average them out at a slow time constant near video frame rate.   Envelope followers allow you to modulate video parameters based on "how loud is the audio right now?", rather than "what does the audio waveform look like?".  The latter being what you get when you patch an audio signal in directly.

Thanks for reading, and I hope you are enjoying the Spring.
Lars