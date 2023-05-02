import { db } from '~/lib/db'
import {
  Section,
  Grid,
  Button,
  Text,
  PageHeader,
  Heading,
  Link,
  Modal
} from '~/components';

export default function GettingStarted() {
  return (
    <>
      <Section>
        <h1 id="getting-started">Getting Started</h1>
        <h2 id="what-is-a-video-synthesizer-">What Is A Video Synthesizer?</h2>
        <p>A video synthesizer is an electronic instrument which creates or processes video images in real time. A modular video synthesizer is comprised of one or more electronic modules. Each module performs a specific function, such as shape generation or color mixing. Modules are connected to each other with patch cables in an open ended manner which encourages experimentation and offers a wholly immersive creative experience. A large system of modules may be purchased at once, or it may be built up over time, according to an artist’s specific creative goals.</p>
        <h2 id="quick-facts-about-lzx">Quick Facts About LZX</h2>
        <ul>
          <li>The LZX mission is to preserve and expand upon tools available to the video art movement from the 1960s thru the 1980s. LZX exists as a counterpoint to the worlds of mainstream broadcast equipment and GPU based video processing software.</li>
          <li>LZX started as a DIY project in 2008, and then evolved through several series of modular instrument designs. Previous generations of LZX modules were referred to as the Visionary series (2011), Expedition series (2015), and Orion series (2018).  The current modular series (2022) is referred to as just LZX Modular, or Gen3.</li>
          <li>LZX products are manufactured in Portland, Oregon at the LZX workshop.</li>
          <li>Modules are compatible with EuroRack cases and patch cables used by modular audio synthesizers.</li>
          <li>Modules can be powered by 12V DC &quot;wall wart&quot; adapters or by EuroRack power supplies.</li>
          <li>External video inputs and outputs are the same as the Component &amp; Composite connections found on most televisions and some cameras.</li>
          <li>Patchable signal levels are in the 0 to 1V range; This is lower than most audio modules (0V-10V), but inputs are tolerant of any voltage produced by a EuroRack system.</li>
          <li>Voltage control inputs are capable of very high frequencies, allowing signals such as camera images to modulate oscillators or VCAs.</li>
        </ul>
        <p><img src="/media/GettingStartedWorkshop.jpg" /></p>
        <h2 id="installing-modules">Installing Modules</h2>
        <p>Installing a new module in your system should be done in the following steps.  Always power down your system while installing a new module.</p>
        <h3>Connecting Power</h3>
        <p>Your power supply must be connected to either the 12V DC input jack or the EuroRack power connector. Do not use both connectors at the same time.</p>
        <h3>Connecting Video Sync</h3>
        <p>For each module with a Video Sync In on the rear, it must be connected to your ESG3 Encoder &amp; Sync Generator module using an RCA cable.  This connection may be made directly, or through a chain of other modules.  ESG3 Encoder &amp; Sync Generator may be connected to other ESG3 Encoder &amp; Sync Generator modules in this manner, or its video sync input may be left disconnected.</p>
        <p><img src="/media/GettingStartedSyncCable.jpg" /></p>
        <h3>Mounting</h3>
        <p>Secure the module to your EuroRack mounting rails using the screws provided by your EuroRack case provider. </p>
        <p><img src="/media/GettingStartedScrewMounting.jpg" /></p>
        <h2 id="your-first-patch">Your First Patch</h2>
        <p>This patch assumes you have followed the module installation instructions above, and your LZX Modular system is powered on.</p>
        <p>Here&#39;s what you will need:</p>
        <ul>
          <li>ESG3 Encoder &amp; Sync Generator module</li>
          <li>DSG3 Dual Shape Generator module </li>
          <li>An RCA-to-RCA cable for composite video output</li>
          <li>A video display with composite video input</li>
          <li>Three 3.5mm patch cables</li>
        </ul>
        <p><img src="/media/GettingStartedKit.jpg" /></p>
        <h3>Initial Settings</h3>
        <p>All toggle switches on ESG3 and DSG3 should be reset to their center (middle) position.  All knobs on ESG3 should be set to their detented (middle) position.</p>
        <p>Turn all of ESG3&#39;s front DIP switches to their OFF position.  If you want NTSC output, leave them all OFF.  If you want PAL output, turn switch #1 to the ON position.</p>
        <h3>Connecting A Video Display</h3>
        <p>Connect your video display&#39;s CVBS input to your ESG3 Video Encoder &amp; Sync Generator module&#39;s CVBS output.  </p>
        <p><img src="/media/GettingStartedVideoSource.jpg" />
          <img src="/media/GettingStartedVideoConnector.jpg" /></p>
        <h3>Generating A Color Pattern</h3>
        <p>Patch any three of DSG3&#39;s eight outputs to your ESG3&#39;s Red, Green &amp; Blue input jacks.  Play with the knobs and switches on ESG3 and DSG3, exploring the capabilities of your patternmaking patch.  Patch different outputs from DSG3 to observe different combinations.</p>
        <p><img src="/media/GettingStartedPatch01.jpg" /></p>
        <h3>Adding Complexity</h3>
        <p>Next, let&#39;s make the geometry of your pattern capable of more complex results through series processing.  Patch two outputs from DSG3&#39;s first shape generator, to the inputs of it&#39;s second shape generator.  Now take your RGB pattern from the second shape generator&#39;s outputs.</p>
        <p><img src="/media/GettingStartedPatch02.jpg" />
          <img src="/media/GettingStartedPatch03.jpg" /></p>

      </Section>
    </>
  );
}

