import React, { MouseEvent } from 'react';
import './jack.css';

interface JackProps {
  label: string;
  isOutput: boolean;
  xPosition: number;
  yPosition: number;
  pixelsPerHP: number;
}

export const Jack = ({
  isOutput = false,
  pixelsPerHP = 20,
  xPosition = 0,
  yPosition = 0,
  label,
  ...props
}: JackProps) => {
  const pixelsPerInch = pixelsPerHP * 5;
  return (
    <>
      <div className="jack" style={{ top: yPosition, left: xPosition }}>
        <svg
          width={pixelsPerInch * 0.3211}
          height={pixelsPerInch * 0.3211}
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          id="Jack"
          data-name="Jack"
          viewBox="0 0 23.12 23.12"
          {...props}
        >
          <defs>
            <clipPath id="clippath">
              <path d="M0 0h23.12v23.12H0z" className="cls-15" />
            </clipPath>
            <clipPath id="clippath-1">
              <path d="M0 0h23.12v23.12H0z" className="cls-15" />
            </clipPath>
            <clipPath id="clippath-2">
              <path
                d="M11.56 0c-.25 0-.57.1-.65.21-.05.07-.23.28-.36.44-.16-.13-.37-.3-.44-.36-.1-.1-.43-.14-.68-.09-.25.05-.54.2-.6.33-.04.09-.22.4-.32.58-.18-.09-.5-.26-.58-.31-.12-.07-.45-.05-.68.05-.23.09-.49.31-.53.44-.03.1-.14.44-.2.63-.19-.06-.54-.16-.63-.19-.13-.05-.45.04-.66.18-.21.14-.42.4-.43.54 0 .1-.05.46-.07.66-.2-.02-.56-.05-.66-.06-.14-.02-.44.13-.61.31-.18.18-.33.47-.31.61.01.1.04.46.06.66-.2.02-.56.06-.66.07-.14 0-.4.21-.54.42s-.23.53-.19.66c.03.09.13.44.19.64-.19.06-.54.17-.63.2-.13.03-.35.29-.45.52-.1.23-.12.56-.06.68.05.09.22.41.31.59-.17.1-.49.27-.58.32-.13.06-.29.35-.34.6-.05.25-.01.58.08.68.07.07.29.36.41.52-.15.13-.43.36-.51.42-.11.08-.21.4-.21.65s.1.57.21.65c.07.05.28.23.44.36-.13.16-.3.37-.36.44-.09.1-.14.43-.09.68.05.25.2.54.33.6.09.04.4.22.58.32-.09.18-.26.5-.31.58-.07.12-.05.45.05.68.09.23.31.49.44.53.1.03.44.14.63.2-.06.19-.16.54-.19.63-.05.13.04.45.18.66s.4.42.54.43c.1 0 .46.05.66.07-.02.2-.05.56-.06.66-.02.14.13.44.31.61.18.18.47.33.61.31.1-.01.46-.04.66-.06.02.2.06.56.07.66 0 .14.21.4.42.54s.53.23.66.19c.09-.03.44-.13.64-.19.06.19.17.54.2.63.03.13.29.35.52.45.23.1.56.12.68.05.09-.05.41-.21.59-.31.1.17.27.49.32.58.06.13.35.29.6.34.25.05.58.01.68-.08.07-.07.36-.29.51-.41.13.15.36.43.42.51.09.11.4.21.65.21s.57-.1.65-.21c.05-.07.23-.28.36-.44.16.13.37.3.44.36.1.09.43.14.68.09.25-.05.54-.2.6-.33.04-.09.22-.4.32-.58.18.09.5.26.58.31.12.07.45.05.69-.05.23-.09.49-.31.53-.44.02-.1.14-.44.2-.63.19.06.54.16.63.19.13.05.45-.04.66-.18.21-.14.42-.4.43-.54 0-.1.05-.46.08-.66.2.02.56.05.66.06.14.02.43-.13.61-.31s.33-.47.31-.61c-.01-.1-.04-.46-.06-.66.2-.02.56-.06.66-.07.14 0 .4-.21.54-.42s.23-.53.19-.66c-.03-.09-.13-.44-.18-.64.19-.06.53-.17.63-.2.14-.03.35-.29.45-.52.1-.23.13-.56.06-.68-.05-.09-.22-.41-.31-.59.17-.1.49-.27.58-.32.13-.06.29-.35.34-.6.05-.25.01-.58-.08-.68-.07-.07-.29-.36-.42-.51.15-.13.43-.36.51-.42.11-.09.21-.4.21-.65s-.1-.57-.21-.65c-.07-.05-.28-.23-.44-.36.13-.16.3-.37.36-.44.1-.1.14-.43.09-.68-.05-.25-.2-.54-.33-.6-.09-.04-.4-.22-.58-.32.09-.18.26-.5.31-.58.07-.12.05-.45-.05-.69-.09-.23-.31-.49-.44-.53-.1-.02-.44-.14-.63-.2.06-.19.16-.54.19-.63.05-.13-.04-.45-.18-.66-.14-.21-.4-.42-.54-.43-.1 0-.46-.05-.66-.08.02-.2.05-.56.06-.66.02-.14-.13-.43-.31-.61s-.47-.33-.61-.31c-.1.01-.46.04-.66.06-.02-.2-.06-.56-.07-.66 0-.14-.21-.4-.42-.54s-.53-.23-.66-.19c-.09.03-.44.13-.64.18-.06-.19-.17-.53-.2-.63-.03-.14-.29-.35-.52-.45-.23-.1-.56-.13-.68-.06-.09.05-.41.22-.59.31-.1-.17-.27-.49-.32-.58-.06-.13-.35-.29-.6-.34-.25-.05-.58-.01-.68.08-.07.07-.36.29-.52.42-.13-.15-.36-.43-.42-.51-.09-.09-.41-.19-.66-.19Z"
                className="cls-15"
              />
            </clipPath>
            <clipPath id="clippath-3">
              <path
                d="m.89 10.03-.06.41h21.46l-.06-.41C21.47 4.74 16.89.75 11.56.75S1.65 4.74.89 10.03"
                className="cls-15"
              />
            </clipPath>
            <clipPath id="clippath-4">
              <path
                d="m.83 12.64.06.41c.74 5.31 5.33 9.31 10.68 9.31s9.94-4 10.67-9.31l.06-.41H.83Z"
                className="cls-15"
              />
            </clipPath>
            <clipPath id="clippath-5">
              <path
                d="M2.75 11.56c0 4.87 3.94 8.81 8.81 8.81s8.81-3.94 8.81-8.81-3.95-8.81-8.81-8.81-8.81 3.94-8.81 8.81"
                className="cls-15"
              />
            </clipPath>
            <clipPath id="clippath-6">
              <path
                d="M3.31 11.56c0 4.56 3.69 8.25 8.25 8.25s8.25-3.69 8.25-8.25-3.69-8.25-8.25-8.25S3.31 7 3.31 11.56"
                className="cls-15"
              />
            </clipPath>
            <clipPath id="clippath-7">
              <path
                d="M3.84 11.56c0 4.27 3.46 7.72 7.72 7.72s7.72-3.46 7.72-7.72-3.46-7.72-7.72-7.72-7.72 3.46-7.72 7.72"
                className="cls-15"
              />
            </clipPath>
            <clipPath id="clippath-8">
              <path
                d="M5.12 11.56C5.12 15.12 8 18 11.56 18S18 15.12 18 11.56s-2.88-6.44-6.44-6.44S5.12 8 5.12 11.56"
                className="cls-15"
              />
            </clipPath>
            <clipPath id="clippath-9">
              <path
                d="M6.51 11.56c0 2.79 2.26 5.06 5.06 5.06s5.05-2.26 5.05-5.06-2.26-5.05-5.05-5.05-5.06 2.26-5.06 5.05"
                className="cls-15"
              />
            </clipPath>
            <clipPath id="clippath-10">
              <path d="M0 0h23.12v23.12H0z" className="cls-15" />
            </clipPath>
            <clipPath id="clippath-11">
              <path d="M7.31 7.63h3.4v7.86h-3.4z" className="cls-15" />
            </clipPath>
            <clipPath id="clippath-12">
              <path
                d="M7.3 11.56c0 1.92 1.45 3.51 3.4 3.93V7.63c-1.95.42-3.4 2.01-3.4 3.93"
                className="cls-15"
              />
            </clipPath>
            <linearGradient
              id="linear-gradient"
              x1={815.46}
              x2={816.46}
              y1={-272.05}
              y2={-272.05}
              gradientTransform="matrix(0 21.81 21.81 0 5944.75 -17784.93)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset={0} stopColor="#8d9092" />
              <stop offset={0.51} stopColor="#b6b8ba" />
              <stop offset={1} stopColor="#8f9194" />
              <stop offset={1} stopColor="#8f9194" />
            </linearGradient>
            <linearGradient
              xlinkHref="#linear-gradient"
              id="linear-gradient-2"
              x2={816.46}
              y1={-272.23}
              y2={-272.23}
              gradientTransform="matrix(0 21.81 21.81 0 5948.68 -17783.3)"
            />
            <linearGradient
              id="linear-gradient-3"
              x1={801.47}
              x2={802.47}
              y1={-277.15}
              y2={-277.15}
              gradientTransform="matrix(0 17.54 17.54 0 4872.54 -14054.5)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset={0} stopColor="#808285" />
              <stop offset={0} stopColor="#808285" />
              <stop offset={1} stopColor="#a7a9ac" />
              <stop offset={1} stopColor="#a7a9ac" />
            </linearGradient>
            <linearGradient
              id="linear-gradient-4"
              x1={874.3}
              x2={875.3}
              y1={-218.01}
              y2={-218.01}
              gradientTransform="matrix(-16.51 0 0 16.51 14451.56 3610.23)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset={0} stopColor="#7e8083" />
              <stop offset={0} stopColor="#7e8083" />
              <stop offset={1} stopColor="#a3a5a8" />
              <stop offset={1} stopColor="#a3a5a8" />
            </linearGradient>
            <linearGradient
              id="linear-gradient-5"
              x1={797.94}
              x2={798.94}
              y1={-283.88}
              y2={-283.88}
              gradientTransform="matrix(0 15.19 15.19 0 4324.46 -12119.02)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset={0} stopColor="#797a7d" />
              <stop offset={0} stopColor="#797a7d" />
              <stop offset={1} stopColor="#737577" />
            </linearGradient>
            <linearGradient
              id="linear-gradient-6"
              x1={796.22}
              x2={797.22}
              y1={-287.14}
              y2={-287.14}
              gradientTransform="matrix(0 14.27 14.27 0 4108.32 -11355.15)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset={0} stopColor="#4a4b4c" />
              <stop offset={0} stopColor="#4a4b4c" />
              <stop offset={1} stopColor="#999b9e" />
              <stop offset={1} stopColor="#999b9e" />
            </linearGradient>
            <linearGradient
              id="linear-gradient-7"
              x1={581.93}
              x2={582.93}
              y1={-309.05}
              y2={-309.05}
              gradientTransform="matrix(3.4 0 0 -3.4 -1971.52 -1039.35)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset={0} stopColor="#262324" />
              <stop offset={0} stopColor="#262324" />
              <stop offset={0.52} stopColor="#272425" />
              <stop offset={0.71} stopColor="#2e2b2c" />
              <stop offset={0.86} stopColor="#383738" />
              <stop offset={0.97} stopColor="#484749" />
              <stop offset={1} stopColor="#4d4d4f" />
              <stop offset={1} stopColor="#4d4d4f" />
            </linearGradient>
            <radialGradient
              id="radial-gradient"
              cx={753.05}
              cy={-255.77}
              r={1}
              fx={753.05}
              fy={-255.77}
              gradientTransform="matrix(11.56 0 0 -11.56 -8693.35 -2945.04)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset={0} stopColor="#4a4b4c" />
              <stop offset={0.58} stopColor="#4a4b4c" />
              <stop offset={1} stopColor="#8f9194" />
            </radialGradient>
            <radialGradient
              id="radial-gradient-2"
              cx={661.27}
              cy={-284.35}
              r={1}
              fx={661.27}
              fy={-284.35}
              gradientTransform="matrix(5.05 0 0 -5.05 -3330.94 -1425.71)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset={0} stopColor="#231f20" />
              <stop offset={0} stopColor="#231f20" />
              <stop offset={0.68} stopColor="#231f20" />
              <stop offset={0.82} stopColor="#252122" />
              <stop offset={0.92} stopColor="#2d2b2c" />
              <stop offset={1} stopColor="#393839" />
            </radialGradient>
            <style>{".cls-15{fill:none}"}</style>
          </defs>
          <g id="components">
            <g
              id="Jack"
              style={{
                clipPath: "url(#clippath)",
              }}
            >
              <g
                style={{
                  clipPath: "url(#clippath-1)",
                }}
              >
                <g
                  style={{
                    clipPath: "url(#clippath-2)",
                  }}
                >
                  <path
                    d="M0 0h23.12v23.12H0z"
                    style={{
                      fill: "url(#radial-gradient)",
                    }}
                  />
                </g>
                <g
                  style={{
                    clipPath: "url(#clippath-3)",
                  }}
                >
                  <path
                    d="M-.14-3.99h23.41v19.18H-.14z"
                    style={{
                      fill: "url(#linear-gradient)",
                    }}
                    transform="rotate(-30.29 11.554 5.586)"
                  />
                </g>
                <g
                  style={{
                    clipPath: "url(#clippath-4)",
                  }}
                >
                  <path
                    d="M-.16 7.89h23.44v19.22H-.16z"
                    style={{
                      fill: "url(#linear-gradient-2)",
                    }}
                    transform="rotate(-30.29 11.56 17.503)"
                  />
                </g>
                <g
                  style={{
                    clipPath: "url(#clippath-5)",
                  }}
                >
                  <path
                    d="M-.9-.9h24.92v24.92H-.9z"
                    style={{
                      fill: "url(#linear-gradient-3)",
                    }}
                    transform="rotate(-45 11.56 11.562)"
                  />
                </g>
                <g
                  style={{
                    clipPath: "url(#clippath-6)",
                  }}
                >
                  <path
                    d="M3.31 3.31h16.51v16.51H3.31z"
                    style={{
                      fill: "url(#linear-gradient-4)",
                    }}
                  />
                </g>
                <g
                  style={{
                    clipPath: "url(#clippath-7)",
                  }}
                >
                  <path
                    d="M.64.64h21.84v21.84H.64z"
                    style={{
                      fill: "url(#linear-gradient-5)",
                    }}
                    transform="rotate(-45 11.56 11.562)"
                  />
                </g>
                <g
                  style={{
                    clipPath: "url(#clippath-8)",
                  }}
                >
                  <path
                    d="M2.46 2.46h18.21v18.21H2.46z"
                    style={{
                      fill: "url(#linear-gradient-6)",
                    }}
                    transform="rotate(-45 11.56 11.562)"
                  />
                </g>
                <g
                  style={{
                    clipPath: "url(#clippath-9)",
                  }}
                >
                  <path
                    d="M6.5 6.51h10.11v10.11H6.5z"
                    style={{
                      fill: "url(#radial-gradient-2)",
                    }}
                  />
                </g>
                <g
                  style={{
                    clipPath: "url(#clippath-10)",
                  }}
                >
                  <g
                    style={{
                      opacity: 0.51,
                    }}
                  >
                    <g
                      style={{
                        clipPath: "url(#clippath-11)",
                      }}
                    >
                      <g
                        style={{
                          clipPath: "url(#clippath-12)",
                        }}
                      >
                        <path
                          d="M7.3 7.63h3.4v7.86H7.3z"
                          style={{
                            fill: "url(#linear-gradient-7)",
                          }}
                        />
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>
    </>
  );
};
