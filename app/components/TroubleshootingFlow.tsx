/**
 * Guided troubleshooting decision-tree component.
 * Walks users through a series of questions to diagnose common issues.
 */
import {useState} from 'react';
import {Link} from '@remix-run/react';

export interface TroubleshootingNode {
  id: string;
  question: string;
  options: TroubleshootingOption[];
}

export interface TroubleshootingOption {
  label: string;
  /** Next node ID to navigate to, or null for a resolution */
  nextId: string | null;
  /** Resolution text shown when nextId is null */
  resolution?: string;
  /** Optional link for the resolution */
  link?: {label: string; url: string};
}

interface TroubleshootingFlowProps {
  title?: string;
  nodes: TroubleshootingNode[];
}

export function TroubleshootingFlow({title, nodes}: TroubleshootingFlowProps) {
  const [history, setHistory] = useState<string[]>([nodes[0]?.id ?? '']);
  const [resolution, setResolution] = useState<{
    text: string;
    link?: {label: string; url: string};
  } | null>(null);

  const currentId = history[history.length - 1];
  const currentNode = nodes.find((n) => n.id === currentId);

  const handleOption = (option: TroubleshootingOption) => {
    if (option.nextId) {
      setHistory((prev) => [...prev, option.nextId!]);
      setResolution(null);
    } else {
      setResolution({
        text: option.resolution ?? 'Please contact support for further help.',
        link: option.link,
      });
    }
  };

  const handleBack = () => {
    if (history.length > 1) {
      setHistory((prev) => prev.slice(0, -1));
      setResolution(null);
    }
  };

  const handleReset = () => {
    setHistory([nodes[0]?.id ?? '']);
    setResolution(null);
  };

  if (!currentNode) return null;

  return (
    <div className="rounded-xl border border-base-300 bg-base-200/50 p-5">
      {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}

      {/* Progress indicator */}
      <div className="flex items-center gap-1 mb-4">
        {history.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full max-w-8 ${
              i < history.length - 1
                ? 'bg-primary'
                : resolution
                ? 'bg-success'
                : 'bg-primary/40'
            }`}
          />
        ))}
      </div>

      {!resolution ? (
        <>
          <p className="font-medium mb-4">{currentNode.question}</p>
          <div className="space-y-2">
            {currentNode.options.map((option, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleOption(option)}
                className="btn btn-outline btn-sm w-full justify-start text-left"
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-lg bg-success/10 border border-success/20 p-4">
          <p className="font-medium text-success mb-2">Recommendation</p>
          <p className="text-sm text-base-content/80">{resolution.text}</p>
          {resolution.link && (
            <Link
              to={resolution.link.url}
              className="btn btn-sm btn-primary mt-3"
            >
              {resolution.link.label}
            </Link>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-2 mt-4">
        {history.length > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="btn btn-ghost btn-xs"
          >
            &larr; Back
          </button>
        )}
        {(history.length > 1 || resolution) && (
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-ghost btn-xs"
          >
            Start Over
          </button>
        )}
      </div>
    </div>
  );
}

// --- Preset troubleshooting trees ---

export const VIDEOMANCER_TROUBLESHOOTING: TroubleshootingNode[] = [
  {
    id: 'start',
    question: 'What issue are you experiencing?',
    options: [
      {label: 'No video output / black screen', nextId: 'no-video'},
      {label: 'Display shows "No Signal"', nextId: 'no-signal'},
      {label: 'Firmware update issues', nextId: 'firmware'},
      {label: 'Program or library issues', nextId: 'programs'},
      {label: 'Controls not responding', nextId: 'controls'},
      {
        label: 'Something else',
        nextId: null,
        resolution:
          'For issues not covered here, please contact our support team.',
        link: {
          label: 'Contact Support',
          url: 'mailto:support@lzxindustries.net',
        },
      },
    ],
  },
  {
    id: 'no-video',
    question: 'Is the power LED on the front panel illuminated?',
    options: [
      {label: 'Yes, power LED is on', nextId: 'no-video-power-on'},
      {
        label: 'No, power LED is off',
        nextId: null,
        resolution:
          'Check that the 12V DC power supply is plugged in and the rear power switch is in the ON position. Try a different power outlet. If the power LED still does not illuminate, contact support.',
        link: {
          label: 'Contact Support',
          url: 'mailto:support@lzxindustries.net',
        },
      },
    ],
  },
  {
    id: 'no-video-power-on',
    question: 'What is your Video Route Mode set to?',
    options: [
      {label: 'HDMI In', nextId: 'no-video-hdmi'},
      {
        label: 'Standalone',
        nextId: null,
        resolution:
          'In Standalone mode, Videomancer generates video without an input source. Try loading the "Colorbars" program. If you still see a black screen, move the ★ Slider (Parameter 12) to its full extent — many programs use this as a luminance key.',
      },
      {
        label: 'Not sure / need help setting it',
        nextId: null,
        resolution:
          'Press the SYSTEM button, turn the Rotary Encoder to "Vid Route Mode", press to edit, select your desired input, and press to confirm. See the Quick Start Guide for detailed steps.',
        link: {
          label: 'Quick Start Guide',
          url: '/instruments/videomancer/manual/quick-start',
        },
      },
    ],
  },
  {
    id: 'no-video-hdmi',
    question: 'Are the HDMI LEDs on the rear panel lit?',
    options: [
      {
        label: 'Yes, both LEDs are lit',
        nextId: null,
        resolution:
          'Try loading a known-working program like "Passthru" or "Colorbars". If output is still black, try moving the ★ Slider to its full extent. Some programs default to a black output. If the issue persists, try a different HDMI cable or display.',
      },
      {
        label: 'Input LED is off',
        nextId: null,
        resolution:
          'Your HDMI source is not being detected. Try a different HDMI cable, ensure the source device is powered on and outputting video, and try a different source device. Videomancer requires a valid HDMI signal on the IN port.',
      },
      {
        label: 'Output LED is off',
        nextId: null,
        resolution:
          'Your display is not being detected. Try a different HDMI cable, ensure the display is powered on and set to the correct input, and try a different display. Some displays require specific resolution settings.',
      },
    ],
  },
  {
    id: 'no-signal',
    question: 'Does the LCD display on Videomancer show content?',
    options: [
      {label: 'Yes, LCD shows system info', nextId: 'no-video-hdmi'},
      {
        label: 'No, LCD is blank',
        nextId: null,
        resolution:
          'If the LCD is blank but the power LED is on, the unit may need a firmware update or may be in a fault state. Check the LCD after a full power cycle (off for 10 seconds, then on). If the LCD remains blank, contact support.',
        link: {
          label: 'Contact Support',
          url: 'mailto:support@lzxindustries.net',
        },
      },
    ],
  },
  {
    id: 'firmware',
    question: 'What firmware issue are you experiencing?',
    options: [
      {
        label: 'LZX Connect does not detect Videomancer',
        nextId: null,
        resolution:
          'If Videomancer is running firmware 0.1.8, LZX Connect cannot connect to it — this is expected. Use the manual BOOT button method to upgrade to firmware 1.x.x first, then LZX Connect will work for future updates. If you are already on 1.x.x: ensure you are using a USB-C data cable (not a charge-only cable), try a different USB port, and on Windows try running LZX Connect as Administrator. Make sure Videomancer is powered on before connecting USB.',
        link: {label: 'Firmware Downloads', url: '/instruments/videomancer/downloads'},
      },
      {
        label: 'Firmware update fails midway',
        nextId: null,
        resolution:
          'Do not disconnect power or USB during a firmware update. If an update fails, power cycle Videomancer and try again. If the unit enters a fault state, see the Fault Codes Reference in the manual.',
        link: {
          label: 'Fault Codes Reference',
          url: '/instruments/videomancer/manual/fault-codes-reference',
        },
      },
      {
        label: 'Not sure which firmware version to use',
        nextId: null,
        resolution:
          'Check your current firmware version in SYSTEM → About. If you are on firmware 0.1.8, use the manual BOOT button method to upgrade to 1.x.x — LZX Connect cannot perform this initial upgrade. Firmware 1.x.x is currently pre-release; download the .UF2 file from the Downloads page (look for builds labeled Pre-release). If you are already on 1.x.x, enable Show pre-releases in LZX Connect settings to find and install the latest pre-release builds.',
        link: {label: 'Firmware Downloads', url: '/instruments/videomancer/downloads'},
      },
      {
        label: 'I want to upgrade from firmware 0.1.8',
        nextId: null,
        resolution:
          'The upgrade from 0.1.8 to 1.x.x requires the manual BOOT button method — LZX Connect cannot perform this initial upgrade. Close LZX Connect before starting. Firmware 1.x.x is currently pre-release — download the .UF2 file from the Downloads page (it will be labeled Pre-release). Hold the BOOT button while powering on, then copy the file to the detected USB drive. See the Firmware Update section of the User Manual for full step-by-step instructions.',
        link: {label: 'Firmware Downloads', url: '/instruments/videomancer/downloads'},
      },
    ],
  },
  {
    id: 'controls',
    question: 'Which controls are not responding?',
    options: [
      {
        label: 'Front panel knobs / sliders',
        nextId: null,
        resolution:
          'Each program assigns different functions to the 12 parameters. Some parameters may appear inactive depending on the loaded program. Try loading "Passthru" and verify all controls affect the output. If controls are physically stuck, contact support.',
      },
      {
        label: 'Rotary encoder / buttons',
        nextId: null,
        resolution:
          'The rotary encoder and buttons control system menus. Press SYSTEM to enter the menu, then turn and press the encoder. If the encoder is unresponsive after a power cycle, the unit may need a firmware update.',
        link: {label: 'Update Firmware', url: '/connect'},
      },
      {
        label: 'CV / modulation inputs',
        nextId: null,
        resolution:
          'CV and audio modulation inputs require an external signal source. Ensure your source is outputting at the expected voltage level. Check that the modulation routing is configured in the current program. See the User Manual for modulation details.',
        link: {label: 'User Manual', url: '/instruments/videomancer/manual'},
      },
    ],
  },
  {
    id: 'programs',
    question: 'What program or library issue are you experiencing?',
    options: [
      {
        label: 'Programs on SD card are not showing up after install',
        nextId: null,
        resolution:
          'Videomancer scans the `programs/` folder on the microSD card at boot. Copy `.vmprog` files into `programs/` or a vendor subdirectory within it (e.g. `programs/vendor-name/program.vmprog`), then power cycle Videomancer to rescan. Ensure the card is formatted FAT32. If the card is not detected at all, try reseating it while Videomancer is powered off.',
        link: {
          label: 'MicroSD Card Reference',
          url: '/instruments/videomancer/manual/user-manual#microsd-card',
        },
      },
      {
        label: 'LZX Connect "Install Program Library" fails or stalls',
        nextId: null,
        resolution:
          'Ensure Videomancer is powered on and connected via a USB-C data cable (not a charge-only cable) before starting. On Windows, try running LZX Connect as Administrator. If the transfer stalls, power cycle Videomancer and retry. As a fallback, copy .vmprog files directly to the programs/ folder on the SD card.',
        link: {label: 'Download LZX Connect', url: '/connect'},
      },
      {
        label: 'I need to find community programs to download',
        nextId: null,
        resolution:
          'Community programs for Videomancer are distributed from the videomancer-community-programs GitHub repository. Download a release archive and copy the .vmprog files to the programs/ folder on your microSD card, or use LZX Connect \u2192 Install Program Library. Signed releases load without Developer Mode on firmware 1.x.x.',
        link: {
          label: 'Community Programs',
          url: 'https://github.com/lzxindustries/videomancer-community-programs/releases',
        },
      },
    ],
  },
];

export const GENERIC_MODULE_TROUBLESHOOTING: TroubleshootingNode[] = [
  {
    id: 'start',
    question: 'What issue are you experiencing with this module?',
    options: [
      {label: 'No output signal', nextId: 'no-output'},
      {label: 'Unexpected behavior or glitches', nextId: 'glitches'},
      {label: 'Power / LED issues', nextId: 'power'},
      {
        label: 'Something else',
        nextId: null,
        resolution:
          'For issues not covered here, check the module documentation or contact support.',
        link: {
          label: 'Contact Support',
          url: 'mailto:support@lzxindustries.net',
        },
      },
    ],
  },
  {
    id: 'no-output',
    question: 'Is the module receiving power (LEDs lit, if applicable)?',
    options: [
      {
        label: 'Yes, module has power',
        nextId: null,
        resolution:
          'Check that a patch cable is connected to an output jack. Verify the input signal is present by checking the source module. Try a different patch cable. Ensure any input attenuators are turned up.',
      },
      {label: 'No, module appears off', nextId: 'power'},
    ],
  },
  {
    id: 'glitches',
    question: 'When do the glitches occur?',
    options: [
      {
        label: 'Immediately on power-up',
        nextId: null,
        resolution:
          'This may indicate a power supply issue. Check that your Eurorack power supply has sufficient capacity on all rails (+12V, -12V, +5V if needed). Try removing other modules to isolate the issue.',
      },
      {
        label: 'Only with certain input signals',
        nextId: null,
        resolution:
          "Some modules may behave unexpectedly with out-of-range input signals. Check that your input signal is within the module's expected voltage range (typically 0-1V for LZX video signals). Consult the module specs for input ranges.",
      },
      {
        label: 'Intermittently / randomly',
        nextId: null,
        resolution:
          'Check all patch cable connections — intermittent contact can cause glitches. Verify your power supply is stable under load. If the issue persists, contact support with a description of the symptoms.',
        link: {
          label: 'Contact Support',
          url: 'mailto:support@lzxindustries.net',
        },
      },
    ],
  },
  {
    id: 'power',
    question: 'Have you checked the power connection?',
    options: [
      {
        label: 'Ribbon cable is connected correctly',
        nextId: null,
        resolution:
          'Verify the ribbon cable orientation — the red stripe should align with the marked pin on both the module and the bus board. Check your power supply capacity. If the module still does not power on, contact support.',
        link: {label: 'Getting Started Guide', url: '/getting-started/modular'},
      },
      {
        label: 'Not sure about the orientation',
        nextId: null,
        resolution:
          'The power ribbon cable must be connected with the correct orientation. The red stripe on the cable should align with the -12V marking on both the module and the bus board. Incorrect orientation will prevent the module from powering on. See the Getting Started guide for details.',
        link: {label: 'Getting Started Guide', url: '/getting-started/modular'},
      },
    ],
  },
];

/**
 * Get the troubleshooting tree for a given product slug.
 * Returns null if no specific tree exists.
 */
export function getTroubleshootingTree(
  slug: string,
): TroubleshootingNode[] | null {
  switch (slug) {
    case 'videomancer':
      return VIDEOMANCER_TROUBLESHOOTING;
    default:
      return null;
  }
}
