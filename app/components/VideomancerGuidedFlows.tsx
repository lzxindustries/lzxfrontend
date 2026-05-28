/**
 * Videomancer guided troubleshooting flows.
 *
 * Six full-depth flows accessed via a dropdown selector.
 * Each flow contains numbered steps, decision tables, callout boxes,
 * cross-flow links, and a "Still stuck?" block.
 */
import {useState, useEffect} from 'react';
import {Link} from '@remix-run/react';

type FlowKey =
  | ''
  | 'black-screen'
  | 'no-signal'
  | 'firmware'
  | 'programs'
  | 'controls'
  | 'other';

const HASH_TO_FLOW: Record<string, FlowKey> = {
  'flow-black-screen': 'black-screen',
  'flow-no-signal': 'no-signal',
  'flow-firmware': 'firmware',
  'flow-programs': 'programs',
  'flow-controls': 'controls',
  'flow-other': 'other',
};

// ── Shared building blocks ────────────────────────────────────────────────────

function Callout({
  variant = 'info',
  children,
}: {
  variant?: 'info' | 'warning' | 'critical';
  children: React.ReactNode;
}) {
  const cls =
    variant === 'critical'
      ? 'bg-error/10 border border-error/30'
      : variant === 'warning'
        ? 'bg-warning/10 border border-warning/30'
        : 'bg-base-300 border border-base-300';
  return (
    <div className={`rounded-lg p-4 my-3 text-sm leading-relaxed ${cls}`}>
      {children}
    </div>
  );
}

function StepSection({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-start gap-3 mb-2">
        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-content text-xs font-bold">
          {n}
        </span>
        <h4 className="font-semibold text-sm pt-0.5">{title}</h4>
      </div>
      <div className="ml-9 text-sm space-y-2">{children}</div>
    </div>
  );
}

function DecisionTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<Array<React.ReactNode>>;
}) {
  return (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-base-300">
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left py-2 pr-4 font-semibold text-xs uppercase tracking-wide text-base-content/60"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-base-200">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StillStuck({
  details,
  faqLinks,
}: {
  details?: React.ReactNode;
  faqLinks: Array<{label: string; href: string}>;
}) {
  return (
    <div className="rounded-xl border border-base-300 bg-base-200 p-5 mt-6">
      <h4 className="font-semibold mb-2">Still stuck?</h4>
      {details && (
        <div className="text-sm text-base-content/70 mb-3">{details}</div>
      )}
      <div className="flex flex-wrap gap-2">
        <a href="#contact" className="btn btn-sm btn-primary">
          Contact Support
        </a>
        {faqLinks.map((fl) => (
          <a
            key={fl.href}
            href={fl.href}
            className="btn btn-sm btn-ghost text-xs"
          >
            {fl.label}
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Flow A — No video output / black screen ───────────────────────────────────

function FlowBlackScreen({goToFlow}: {goToFlow: (f: FlowKey) => void}) {
  return (
    <div>
      <StepSection n={1} title="Check the Videomancer LCD">
        <p>
          Press <strong>SYSTEM</strong> (white button, top left). Read the
          status line.
        </p>
        <DecisionTable
          headers={['LCD shows', 'Go to']}
          rows={[
            [
              <code key="a">STATUS: NO LOCK HDMI</code>,
              <span key="b">
                <button
                  type="button"
                  className="link link-primary"
                  onClick={() => goToFlow('no-signal')}
                >
                  Flow B
                </button>{' '}
                — or continue Step 2 if input is intentionally offline
              </span>,
            ],
            [
              <span key="c">
                <code>STATUS: ACTIVE …</code> with format shown (e.g.{' '}
                <code>HDMI 1080P30</code>)
              </span>,
              'Step 2',
            ],
            [
              'Blank / garbled LCD after boot animation',
              <span key="d">
                <button
                  type="button"
                  className="link link-primary"
                  onClick={() => goToFlow('controls')}
                >
                  Flow E
                </button>{' '}
                Step 1 (controls / freeze)
              </span>,
            ],
            ['Unit on, LCD normal, but external display black', 'Step 2'],
          ]}
        />
      </StepSection>

      <StepSection n={2} title="Confirm routing and program">
        <p>
          Open <strong>Vid Route Mode</strong> (SYSTEM menu → turn encoder →
          Vid Route Mode):
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            Using HDMI source → set to <strong>HDMI In</strong>
          </li>
          <li>
            No external source, testing with generators → set to{' '}
            <strong>Standalone</strong> and load <strong>Colorbars</strong>
          </li>
          <li>
            Analog source → set to <strong>Analog In</strong> and set{' '}
            <strong>Analog In Mode</strong> to match cable type
          </li>
        </ul>
        <p className="mt-2">
          Load <strong>Passthru</strong> (SYSTEM → press encoder when program
          name shown → browse → Passthru → confirm).
        </p>
        <Callout>
          <strong>Normal behavior:</strong> All outputs disable briefly (3–5
          seconds) after loading any program. A black flash on load is expected
          — wait before diagnosing further.
        </Callout>
      </StepSection>

      <StepSection n={3} title="Check Parameter 12 (★ slider)">
        <p>
          Many programs default to a <strong>black or keyed-out</strong> output.
        </p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>
            Press the <strong>★</strong> button (Parameter 12).
          </li>
          <li>
            Move the <strong>★ slider</strong> slowly through its full range.
          </li>
          <li>
            If picture appears → program was faded or keyed out. Not a fault.
          </li>
        </ol>
      </StepSection>

      <StepSection n={4} title="Verify output path">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Confirm HDMI OUT cable goes to the display, not HDMI IN.
          </li>
          <li>
            Rear <strong>HDMI OUT LED</strong> lit = cable detected; does not
            guarantee a compatible format for your monitor.
          </li>
          <li>
            If available, test <strong>analog output</strong> (component or
            CVBS) to isolate HDMI-out issues.
          </li>
        </ol>
      </StepSection>

      <StepSection n={5} title="Try a known-good test pattern">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Set <strong>Vid Route Mode → Standalone</strong>.
          </li>
          <li>
            Load <strong>Colorbars</strong>.
          </li>
          <li>
            If Colorbars visible on external display → the input source or
            routing was the issue, not the hardware output.
          </li>
          <li>
            If Colorbars still black after Step 3 (★ slider check) →
            continue to Step 6.
          </li>
        </ol>
      </StepSection>

      <StepSection n={6} title="Still stuck?">
        <p>
          Contact support with this information ready:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Firmware version (shown at boot)</li>
          <li>LCD status line text</li>
          <li>Source device model and output format</li>
          <li>Whether Colorbars in Standalone mode worked</li>
        </ul>
      </StepSection>

      <StillStuck
        faqLinks={[
          {label: 'Black screen after loading', href: '#faq-black-screen'},
          {label: 'NO LOCK HDMI', href: '#faq-no-lock'},
        ]}
      />
    </div>
  );
}

// ── Flow B — Display shows "No Signal" ───────────────────────────────────────

function FlowNoSignal() {
  return (
    <div>
      <StepSection n={1} title='LED vs LOCK (read this first)'>
        <DecisionTable
          headers={['Indicator', 'Meaning']}
          rows={[
            [
              <span key="a">
                Rear <strong>HDMI IN / OUT LED</strong> solid white
              </span>,
              'HDMI cable connected (electrical link)',
            ],
            [
              <code key="b">STATUS: ACTIVE HDMI …</code>,
              'Valid video format locked',
            ],
            [
              <code key="c">STATUS: NO LOCK HDMI</code>,
              'Cable OK but format unsupported or not detected',
            ],
          ]}
        />
        <Callout variant="warning">
          <strong>No Signal on your monitor usually means NO LOCK or wrong
          route — not a broken HDMI port.</strong>
        </Callout>
      </StepSection>

      <StepSection n={2} title="Fix the source format">
        <p>
          Videomancer <strong>does not convert</strong> resolutions or frame
          rates. It locks to what the source sends.
        </p>
        <p className="mt-2 font-medium">
          Set your HDMI source to one of these (try in order):
        </p>
        <ol className="list-decimal pl-5 space-y-1 mt-1">
          <li>
            <strong>1080p30</strong>
          </li>
          <li>
            <strong>1080i60</strong> (or 1080i59)
          </li>
          <li>
            <strong>720p60</strong>
          </li>
        </ol>
        <Callout variant="critical">
          <strong>Do not use 1080p60 or 1080p50</strong> — not supported.
          Full list:{' '}
          <Link
            to="/instruments/videomancer/specs"
            className="link link-primary"
          >
            Specs → Supported formats
          </Link>
        </Callout>
        <p className="mt-2">
          <strong>Mac / laptop sources:</strong> Many GPUs refuse interlaced
          output or use unstable HDMI timing over USB-C adapters. Prefer{' '}
          <strong>1080p30</strong> or <strong>720p</strong>; a dedicated HDMI
          converter box is more reliable than a direct laptop port. See{' '}
          <a href="#faq-mac-hdmi" className="link link-primary">
            Mac/laptop HDMI FAQ
          </a>
          .
        </p>
      </StepSection>

      <StepSection n={3} title="Set Videomancer routing">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Press <strong>SYSTEM</strong>.
          </li>
          <li>
            Set <strong>Vid Route Mode → HDMI In</strong>.
          </li>
          <li>
            Load <strong>Passthru</strong>.
          </li>
          <li>
            LCD should change from <code>NO LOCK</code> to{' '}
            <code>STATUS: ACTIVE HDMI …</code> within a few seconds.
          </li>
        </ol>
      </StepSection>

      <StepSection n={4} title="Downstream display compatibility">
        <p>
          If LCD shows <strong>ACTIVE</strong> but external display still says
          No Signal:
        </p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>
            Try a <strong>different HDMI display</strong> or capture device.
          </li>
          <li>
            Avoid long or low-quality HDMI cables for the initial test.
          </li>
          <li>
            Some monitors reject 1080p23/24 film rates — try{' '}
            <strong>1080p30</strong> or <strong>1080i</strong> at the source.
          </li>
        </ol>
      </StepSection>

      <StepSection n={5} title="Analog and cross-format paths">
        <p>
          If using composite / component / S-Video input or output:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>
            <strong>CVBS → HDMI:</strong> Many HDMI monitors cannot display SD
            over HDMI even when Videomancer is working. Try a capture card or
            SD-capable display.
          </li>
          <li>
            <strong>HDMI → CVBS:</strong> Source must output 480i NTSC or 576i
            PAL. PC HDMI often sends RGB → washed-out colors; set source to{' '}
            YCbCr/YUV if available.
          </li>
        </ul>
        <p className="mt-2">
          See manual:{' '}
          <Link
            to="/instruments/videomancer/manual/user-manual"
            className="link link-primary"
          >
            Signal Paths
          </Link>
        </p>
      </StepSection>

      <StepSection n={6} title="Hardware check (last resort)">
        <p>If all of the following are true:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            LCD shows <strong>ACTIVE</strong> with a supported format
          </li>
          <li>
            <strong>Passthru</strong> loaded, Parameter 12 at full
          </li>
          <li>
            <strong>Colorbars</strong> in Standalone also produce No Signal on
            two known-good displays
          </li>
          <li>Analog outputs also dead (if you can test them)</li>
        </ul>
        <p className="mt-2">
          → Contact support — possible output hardware issue.
        </p>
      </StepSection>

      <StillStuck
        faqLinks={[
          {label: 'NO LOCK but LED on', href: '#faq-no-lock'},
          {label: 'Mac/laptop HDMI', href: '#faq-mac-hdmi'},
          {label: 'Supported formats', href: '#faq-formats'},
        ]}
      />
    </div>
  );
}

// ── Flow C — Firmware update issues ──────────────────────────────────────────

function FlowFirmware() {
  return (
    <div>
      <StepSection n={1} title="Read your current version">
        <p>
          Power on and note the version on the{' '}
          <strong>boot splash / LCD</strong> (e.g.{' '}
          <code>0.1.8</code> or <code>1.0.0-rc.26</code>).
        </p>
        <DecisionTable
          headers={['Current version', 'Your situation']}
          rows={[
            [
              <strong key="a">0.1.8 (or 0.1.x)</strong>,
              'Shipped stable track; ~8 programs. First jump to 1.x cannot use LZX Connect alone.',
            ],
            [
              <strong key="b">1.0.0-rc.x</strong>,
              'Pre-release track; full program library; LZX Connect works for 1.x → newer 1.x.',
            ],
          ]}
        />
        <Callout>
          There is <strong>no 1.0.0 stable</strong> release yet. Pre-release
          builds are experimental.
        </Callout>
      </StepSection>

      <StepSection n={2} title="Choose a target (don't upgrade unless you mean to)">
        <DecisionTable
          headers={['Goal', 'Target firmware', 'Where to download']}
          rows={[
            [
              'Maximum stability, current setup works',
              <span key="a">
                Stay on <strong>0.1.8</strong>
              </span>,
              <Link
                key="b"
                to="/instruments/videomancer/downloads"
                className="link link-primary"
              >
                Downloads → Stable
              </Link>,
            ],
            [
              'Full programs + LZX Connect features',
              <span key="c">
                Latest <strong>1.0.0-rc.x</strong>
              </span>,
              <Link
                key="d"
                to="/instruments/videomancer/downloads"
                className="link link-primary"
              >
                Downloads → Pre-release
              </Link>,
            ],
          ]}
        />
      </StepSection>

      <StepSection
        n={3}
        title="Path A — Manual BOOT update (required for 0.1.8 → 1.x)"
      >
        <Callout variant="warning">
          <strong>Use this path if:</strong> you are on 0.1.8 upgrading to any
          1.x, OR LZX Connect failed, OR you want the most reliable method.
        </Callout>
        <ol className="list-decimal pl-5 space-y-2 mt-2">
          <li>
            <strong>Close LZX Connect</strong> and any app using the serial
            port.
          </li>
          <li>
            Download the correct <code>.uf2</code> from the{' '}
            <Link
              to="/instruments/videomancer/downloads"
              className="link link-primary"
            >
              Downloads page
            </Link>
            .
          </li>
          <li>
            Power <strong>OFF</strong> Videomancer.
          </li>
          <li>
            Connect <strong>USB-A → USB-C</strong> to the{' '}
            <strong>Device</strong> port (not Host).
          </li>
          <li>
            Hold <strong>BOOT</strong> (rear panel), power <strong>ON</strong>,
            release <strong>BOOT</strong>.
          </li>
          <li>
            A drive named <strong>RPI-RP2</strong> (or similar) appears on your
            computer.
          </li>
          <li>
            <strong>Drag the <code>.uf2</code> file</strong> onto the drive.
            Do not rename or unzip.
          </li>
          <li>
            <strong>Wait</strong> — copy may show 0 bytes progress on Mac/Linux
            for 5–10 minutes. Device reboots when done.
          </li>
          <li>
            Power cycle; confirm new version on LCD.
          </li>
        </ol>
        <p className="mt-2">
          Full detail:{' '}
          <Link
            to="/instruments/videomancer/manual/user-manual#firmware-update"
            className="link link-primary"
          >
            Manual → Firmware Update
          </Link>
        </p>
      </StepSection>

      <StepSection
        n={4}
        title="Path B — LZX Connect (1.x → newer 1.x only)"
      >
        <Callout>
          <strong>Only after you are already on firmware 1.x.</strong>
        </Callout>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>
            Open LZX Connect; connect USB to <strong>Device</strong> port.
          </li>
          <li>
            Device card shows installed version → click{' '}
            <strong>Check for Updates</strong>.
          </li>
          <li>
            For rc builds: enable <strong>Show pre-release firmware</strong> in
            Connect settings first.
          </li>
          <li>
            If Connect <strong>asks you to pick a file</strong> → download{' '}
            <code>.uf2</code> from the{' '}
            <Link
              to="/instruments/videomancer/downloads"
              className="link link-primary"
            >
              Downloads table
            </Link>{' '}
            and select it.
          </li>
        </ol>
        <Callout variant="warning">
          If Connect says success but LCD still shows 0.1.8 → Connect did not
          flash 1.x. Go back to <strong>Step 3 (Path A)</strong>.
        </Callout>
      </StepSection>

      <StepSection n={5} title="Downloads page looks empty">
        <p>
          If you see "No downloads available":
        </p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>
            <strong>Hard refresh:</strong> Ctrl+Shift+R (Windows/Linux) or
            Cmd+Shift+R (Mac).
          </li>
          <li>
            Wait up to ~1 hour for CDN cache.
          </li>
          <li>
            Fallback:{' '}
            <a
              href="https://github.com/lzxindustries/videomancer-firmware/releases"
              target="_blank"
              rel="noreferrer"
              className="link link-primary"
            >
              GitHub releases
            </a>{' '}
            — same files.
          </li>
        </ol>
      </StepSection>

      <StepSection n={6} title="USB / Connect not detecting device">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Use <strong>Device</strong> port, not Host.
          </li>
          <li>
            Try another <strong>data-capable</strong> USB-C cable (not
            charge-only).
          </li>
          <li>
            Inspect Device port — if loose or pin not soldered, Connect will not
            work reliably; contact support.
          </li>
          <li>
            On 0.1.x, flash via Path A first; Connect full workflow needs 1.x.
          </li>
        </ol>
      </StepSection>

      <StepSection n={7} title="Unit freezes after boot animation (rc.14+)">
        <p>
          If the boot logo plays then the unit is totally unresponsive (no
          SYSTEM, no knobs):
        </p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>
            Reflash <strong>0.1.8</strong> via Path A (known-good baseline).
          </li>
          <li>
            If you need 1.x, try <strong>1.0.0-rc.13 only</strong> — some units
            fail on rc.14 and newer (under investigation).
          </li>
          <li>
            There is no factory reset beyond a reflash.
          </li>
        </ol>
        <p className="mt-2">
          → Contact support if freeze persists on 0.1.8 after clean reflash.
        </p>
      </StepSection>

      <StillStuck
        faqLinks={[
          {
            label: 'Which firmware should I use?',
            href: '#faq-stable-vs-rc',
          },
          {
            label: 'Connect says success but still 0.1.8',
            href: '#faq-connect-stuck',
          },
          {label: 'Factory reset?', href: '#faq-factory-reset'},
        ]}
      />
    </div>
  );
}

// ── Flow D — Program or library issues ───────────────────────────────────────

function FlowPrograms({goToFlow}: {goToFlow: (f: FlowKey) => void}) {
  return (
    <div>
      <StepSection n={1} title="Count programs on your unit">
        <p>
          Press <strong>SYSTEM</strong> → press encoder to enter program list →
          scroll and count.
        </p>
        <DecisionTable
          headers={['You see', 'Meaning']}
          rows={[
            [
              '~8 programs (Passthru, Colorbars, Prism, …)',
              <span key="a">
                <strong>0.1.8 firmware</strong> — expected. Full library
                requires <strong>1.x firmware</strong>.
              </span>,
            ],
            [
              '~24+ programs',
              <span key="b">
                <strong>1.x firmware</strong> — full embedded library present.
              </span>,
            ],
          ]}
        />
        <p className="text-base-content/70">
          The user manual documents all programs; availability depends on
          firmware, not a missing download.
        </p>
      </StepSection>

      <StepSection n={2} title="Get the full program library (most common fix)">
        <p>
          Programs are <strong>embedded inside 1.x firmware</strong>, not
          installed as separate files during BOOT.
        </p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>
            If on 0.1.8 →{' '}
            <button
              type="button"
              className="link link-primary"
              onClick={() => goToFlow('firmware')}
            >
              complete Flow C Step 3
            </button>{' '}
            (manual BOOT to latest 1.0.0-rc.x).
          </li>
          <li>
            After reboot, open program list again — full library should appear.
          </li>
          <li>
            <strong>Do not</strong> copy <code>.vmprog</code> files into the
            RPI-RP2 BOOT drive.
          </li>
        </ol>
      </StepSection>

      <StepSection n={3} title="Optional — extra programs on microSD">
        <p>For additional libraries beyond the built-in set:</p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>
            Format microSD <strong>FAT32</strong>.
          </li>
          <li>
            Create folder:{' '}
            <code>programs/{'<your-folder-name>'}/</code>
          </li>
          <li>
            Copy <code>.vmprog</code> files inside (not loose on card root).
          </li>
          <li>
            Insert SD, power cycle — Videomancer rescans on boot.
          </li>
          <li>
            Example path:{' '}
            <code>programs/homegrown/pigment.vmprog</code>
          </li>
        </ol>
        <Callout>
          Requires 1.x firmware for most community / signed libraries.
        </Callout>
      </StepSection>

      <StepSection n={4} title='LZX Connect "Install Program Library"'>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Must be on <strong>1.x firmware</strong>.
          </li>
          <li>
            Connect via <strong>Device</strong> port.
          </li>
          <li>
            LZX Connect → <strong>Install Program Library</strong> → select
            library archive.
          </li>
          <li>
            Power cycle to rescan.
          </li>
        </ol>
        <p className="mt-2">
          Downloads:{' '}
          <Link
            to="/instruments/videomancer/downloads"
            className="link link-primary"
          >
            Program Libraries section
          </Link>
        </p>
      </StepSection>

      <StepSection n={5} title="Community / custom programs not in menu">
        <DecisionTable
          headers={['Situation', 'Fix']}
          rows={[
            [
              'Unsigned or version < 1.0.0',
              'Enable Developer Mode in SYSTEM menu → restart',
            ],
            [
              'Signed community release on 1.x',
              'Should load without Developer Mode',
            ],
            [
              'Connect says import OK but no menu entry',
              <span key="a">
                Check SD path{' '}
                <code>programs/{'<vendor>'}{'/<name>'}.vmprog</code>;
                power cycle; confirm 1.x firmware
              </span>,
            ],
          ]}
        />
      </StepSection>

      <StepSection n={6} title="Still stuck?">
        <p>
          Contact support with firmware version, program count, SD layout (if
          used), and whether LZX Connect was involved.
        </p>
      </StepSection>

      <StillStuck
        faqLinks={[
          {label: 'How do I add new programs?', href: '#faq-add-programs'},
          {label: 'Developer Mode', href: '#faq-developer-mode'},
        ]}
      />
    </div>
  );
}

// ── Flow E — Controls not responding ─────────────────────────────────────────

function FlowControls({goToFlow}: {goToFlow: (f: FlowKey) => void}) {
  return (
    <div>
      <StepSection n={1} title="Freeze after boot animation">
        <p>
          <strong>Symptoms:</strong> Boot logo plays, then nothing — SYSTEM,
          knobs, and encoder all dead.
        </p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>
            Note firmware version last installed.
          </li>
          <li>
            Reflash <strong>0.1.8</strong> using{' '}
            <button
              type="button"
              className="link link-primary"
              onClick={() => goToFlow('firmware')}
            >
              Flow C Step 3
            </button>
            .
          </li>
          <li>
            If responsive on 0.1.8 but freeze returns on rc.14 or newer →
            downgrade to <strong>rc.13</strong> or stay on 0.1.8.
          </li>
          <li>
            → Contact support (known issue under investigation on some units).
          </li>
        </ol>
      </StepSection>

      <StepSection n={2} title="Partial responsiveness">
        <p>
          <strong>SYSTEM works, but knobs seem dead:</strong>
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>
            Press a <strong>Parameter button (1–★)</strong> — knobs adjust the{' '}
            <em>focused</em> parameter only; check LCD for parameter name.
          </li>
          <li>
            Check if <strong>Modulation</strong> is driving the parameter
            (disable: encoder → Modulation → Disabled).
          </li>
          <li>
            After <strong>switching programs</strong>, toggles may use soft
            pickup — flip switch twice to update value.
          </li>
        </ul>
      </StepSection>

      <StepSection n={3} title="MIDI not affecting parameters">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Confirm firmware <strong>0.1.8+</strong>.
          </li>
          <li>
            <strong>MIDI CC 0–11</strong> map to Parameters 1–12.
          </li>
          <li>
            Check <strong>SYSTEM → MIDI Channel</strong> (Omni vs specific
            channel).
          </li>
          <li>
            Use <strong>TRS Type A</strong> MIDI cabling.
          </li>
        </ol>
      </StepSection>

      <StepSection n={4} title="Transport / MOTION">
        <Callout>
          <strong>START</strong> must be pressed to run time-based modulation.
          Stopping transport resets modulation phase — this is expected behavior.
        </Callout>
      </StepSection>

      <StepSection n={5} title="Still stuck?">
        <p>
          If 0.1.8 reflash does not restore front-panel response, contact
          support with a video of the behavior and your serial number if visible.
        </p>
      </StepSection>

      <StillStuck
        faqLinks={[
          {label: 'Factory reset?', href: '#faq-factory-reset'},
          {label: 'Perceptible delay?', href: '#faq-latency'},
        ]}
      />
    </div>
  );
}

// ── Flow F — Something else ───────────────────────────────────────────────────

function FlowOther({goToFlow}: {goToFlow: (f: FlowKey) => void}) {
  return (
    <div>
      <StepSection n={1} title="Quick self-sort">
        <DecisionTable
          headers={['I need help with…', 'Go to']}
          rows={[
            [
              'Picture / black / No Signal',
              <span key="a">
                <button
                  type="button"
                  className="link link-primary mr-2"
                  onClick={() => goToFlow('black-screen')}
                >
                  Flow A
                </button>
                or{' '}
                <button
                  type="button"
                  className="link link-primary ml-2"
                  onClick={() => goToFlow('no-signal')}
                >
                  Flow B
                </button>
              </span>,
            ],
            [
              'Updating firmware or LZX Connect',
              <button
                key="b"
                type="button"
                className="link link-primary"
                onClick={() => goToFlow('firmware')}
              >
                Flow C
              </button>,
            ],
            [
              'Missing programs or SD card',
              <button
                key="c"
                type="button"
                className="link link-primary"
                onClick={() => goToFlow('programs')}
              >
                Flow D
              </button>,
            ],
            [
              'Frozen or knobs dead',
              <button
                key="d"
                type="button"
                className="link link-primary"
                onClick={() => goToFlow('controls')}
              >
                Flow E
              </button>,
            ],
            [
              'Eurorack / modular sync',
              <a key="e" href="#faq-eurorack" className="link link-primary">
                FAQ: Eurorack modules
              </a>,
            ],
            [
              'Analog composite / component setup',
              <a key="f" href="#faq-analog" className="link link-primary">
                FAQ: Analog sources
              </a>,
            ],
            [
              'Buying in EU / education discount',
              'Contact support (sales)',
            ],
          ]}
        />
      </StepSection>

      <StepSection n={2} title="Gather info before contacting support">
        <p>Include in your message:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            <strong>Firmware version</strong> (boot screen)
          </li>
          <li>
            <strong>LCD status line</strong> (press SYSTEM)
          </li>
          <li>
            <strong>Source device</strong> + output format if video-related
          </li>
          <li>
            <strong>What you already tried</strong> (which flow steps)
          </li>
          <li>
            <strong>Order number</strong> or retailer if hardware suspected
          </li>
        </ul>
      </StepSection>

      <StepSection n={3} title="Other resources">
        <ul className="space-y-1">
          <li>
            <Link
              to="/instruments/videomancer/manual/user-manual"
              className="link link-primary"
            >
              User Manual
            </Link>
          </li>
          <li>
            <Link
              to="/instruments/videomancer/manual/quick-start"
              className="link link-primary"
            >
              Quick Start
            </Link>
          </li>
          <li>
            <Link
              to="/instruments/videomancer/downloads"
              className="link link-primary"
            >
              Downloads
            </Link>
          </li>
          <li>
            <Link
              to="/instruments/videomancer/specs"
              className="link link-primary"
            >
              Specs
            </Link>
          </li>
          <li>
            <a
              href="https://community.lzxindustries.net"
              target="_blank"
              rel="noreferrer"
              className="link link-primary"
            >
              Community Forum
            </a>
          </li>
        </ul>
      </StepSection>

      <StepSection n={4} title="Contact">
        <p>
          Scroll to <a href="#contact" className="link link-primary">Contact Us</a>{' '}
          on this page → Technical Support.
        </p>
      </StepSection>
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

export function VideomancerGuidedFlows() {
  const [selected, setSelected] = useState<FlowKey>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.slice(1);
    const match = HASH_TO_FLOW[hash];
    if (match) setSelected(match);
  }, []);

  const goToFlow = (flow: FlowKey) => {
    setSelected(flow);
    // Scroll to the selector so the user sees the flow open
    const el = document.getElementById('troubleshoot-selector');
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  };

  const FLOW_LABELS: Record<Exclude<FlowKey, ''>, string> = {
    'black-screen': 'No video output / black screen',
    'no-signal': 'Display shows "No Signal"',
    firmware: 'Firmware update issues',
    programs: 'Program or library issues',
    controls: 'Controls not responding',
    other: 'Something else',
  };

  const FLOW_ANCHOR_IDS: Record<Exclude<FlowKey, ''>, string> = {
    'black-screen': 'flow-black-screen',
    'no-signal': 'flow-no-signal',
    firmware: 'flow-firmware',
    programs: 'flow-programs',
    controls: 'flow-controls',
    other: 'flow-other',
  };

  return (
    <div>
      <div id="troubleshoot-selector" className="mb-4">
        <label
          htmlFor="flow-select"
          className="block text-sm font-medium mb-2"
        >
          What issue are you experiencing?
        </label>
        <select
          id="flow-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value as FlowKey)}
          className="select select-bordered w-full max-w-md"
        >
          <option value="">— Select an issue —</option>
          {(Object.keys(FLOW_LABELS) as Exclude<FlowKey, ''>[]).map((key) => (
            <option key={key} value={key}>
              {FLOW_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div
          id={FLOW_ANCHOR_IDS[selected as Exclude<FlowKey, ''>]}
          className="rounded-xl border border-base-300 bg-base-200/40 p-5 mt-2"
        >
          <h4 className="text-base font-bold mb-5">
            {FLOW_LABELS[selected as Exclude<FlowKey, ''>]}
          </h4>

          {selected === 'black-screen' && (
            <FlowBlackScreen goToFlow={goToFlow} />
          )}
          {selected === 'no-signal' && <FlowNoSignal />}
          {selected === 'firmware' && <FlowFirmware />}
          {selected === 'programs' && (
            <FlowPrograms goToFlow={goToFlow} />
          )}
          {selected === 'controls' && (
            <FlowControls goToFlow={goToFlow} />
          )}
          {selected === 'other' && <FlowOther goToFlow={goToFlow} />}
        </div>
      )}
    </div>
  );
}
