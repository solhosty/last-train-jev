import { useId } from 'react';
import { objects, type RoomState, type Target } from './game';

const tiles = Array.from({ length: 180 }, (_, i) => ({
  x: 16 + (i % 18) * 20,
  y: 39 + Math.floor(i / 18) * 20,
  shade: (i * 17 + Math.floor(i / 18) * 7) % 5,
}));
const colors = ['#b78b59', '#c29560', '#be915b', '#c99d66', '#bc8e56'];
const spots: { id: Target; x: number; y: number; px: number; py: number; name: string }[] = [
  { id: 'mirror', x: 31, y: 62, px: 52, py: 87, name: 'Mirror' },
  { id: 'telephone', x: 60, y: 92, px: 69, py: 120, name: 'Telephone' },
  { id: 'desk', x: 99, y: 99, px: 103, py: 126, name: 'Welcome desk' },
  { id: 'door', x: 196, y: 28, px: 196, py: 70, name: 'Door' },
  { id: 'suitcase', x: 118, y: 169, px: 145, py: 177, name: 'Suitcase' },
  { id: 'creature', x: 236, y: 179, px: 214, py: 193, name: 'Pip' },
];
function Plant({ x, y, small = false }: { x: number; y: number; small?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${small ? 0.75 : 1})`}>
      <path d="M-12 7h26v6h-26Z" fill="#745c3c" opacity=".3" />
      <path d="M-9-2H9v13H6v3H-6v-3h-3Z" fill="#a95c3d" />
      <path d="M-9-2H9v4H-9Zm3 5h3v7h-3Z" fill="#d99257" />
      <path d="M-2-20h4V0h-4Z" fill="#596437" />
      <path d="M-3-22h-8v3h-5v6h5v3h10v-8h4v-10h-8Zm6 8h10v-4h7v-7h-10v4h-7Z" fill="#4c6b3b" />
      <path d="M-12-17h7v3h-7Zm11-8h3v10h-3Zm11 3h7v3h-7Z" fill="#82934b" />
      <path d="M-3-8h-10v-4h-7v-7h6v4h9Zm6 0h10v-3h5v-6h-8v4H3Z" fill="#668443" />
    </g>
  );
}
export default function PixelRoom({
  state,
  selected,
  busy,
  onSelect,
}: {
  state: RoomState;
  selected: Target | null;
  busy: boolean;
  onSelect: (id: Target) => void;
}) {
  const id = useId().replaceAll(':', '');
  const player = state.escaped
    ? { px: 196, py: 30 }
    : spots.find((s) => s.id === selected) || { px: 179, py: 155 };
  return (
    <div className={`room-stage pixel-stage ${state.escaped ? 'room-escaped' : ''}`}>
      <div className="pixel-room-topline">
        <span>
          <i /> ROOM 08
        </span>
        <span>HOTEL ELSEWHERE</span>
        <span>
          09:41 AM <span className="pixel-sun">☀</span>
        </span>
      </div>
      <div className="pixel-scene-wrap">
        <svg
          className="room-art pixel-art"
          viewBox="0 0 392 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="crispEdges"
          aria-label="A cozy top-down pixel-art hotel room"
        >
          <defs>
            <pattern id={`rug-${id}`} width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M5 2h2v3h3v2H7v3H5V7H2V5h3Z" fill="#c9996d" opacity=".5" />
            </pattern>
            <clipPath id={`floor-${id}`}>
              <rect x="16" y="39" width="360" height="198" />
            </clipPath>
          </defs>
          <path d="M12 18h372v230H12Z" fill="#182e29" />
          <path d="M8 10h372v232H8Z" fill="#423d2c" />
          <path d="M12 14h364v224H12Z" fill="#716346" />
          <g clipPath={`url(#floor-${id})`}>
            {tiles.map((t, i) => (
              <g key={i}>
                <rect x={t.x} y={t.y} width={20} height={20} fill={colors[t.shade]} />
                <path
                  d={`M${t.x} ${t.y + 19}h20M${t.x + 19} ${t.y}v20`}
                  stroke="#997247"
                  strokeWidth="1"
                />
                <path
                  d={`M${t.x + 3} ${t.y + 5}h${5 + (i % 9)}m${-3 - (i % 5)} 8h${4 + (i % 6)}`}
                  stroke="#9f7749"
                  strokeWidth="1"
                  opacity=".4"
                />
                <path d={`M${t.x + 1} ${t.y + 1}h17`} stroke="#dfb77b" opacity=".45" />
              </g>
            ))}
          </g>
          <path d="M16 39h360v9H16Zm0 0h7v198h-7Z" fill="#4a472b" opacity=".25" />
          <path d="M12 14h364v23H12Z" fill="#697457" />
          <path d="M12 14h364v3H12ZM12 18h364v3H12Z" fill="#91a07a" />
          <path d="M16 24h352v3H16Zm0 10h352v3H16Z" fill="#465b43" />
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d={`M${20 + i * 30} 21v4m14 2v7`} stroke="#455840" strokeWidth="2" />
          ))}
          <path d="M8 14h8v228H8Zm368 0h12v228h-12Z" fill="#687553" />
          <path d="M8 14h3v228H8Zm369 0h3v228h-3Z" fill="#99a87e" />
          <path d="M12 236h364v6H12Z" fill="#967249" />
          <path d="M12 236h364v2H12Z" fill="#d6ab70" />
          {/* Bookshelf */}
          <path d="M54 31h83v22H54Z" fill="#795439" opacity=".25" />
          <path d="M50 20h86v28H50Z" fill="#493f2e" />
          <path d="M50 20h86v4H50Zm0 24h86v4H50Z" fill="#b28754" />
          <path d="M50 24h4v20h-4Zm82 0h4v20h-4Z" fill="#8f673d" />
          {[
            '#ba7757',
            '#d3b676',
            '#789483',
            '#a39971',
            '#b8755c',
            '#d3c79a',
            '#728c87',
            '#c2985b',
            '#83926a',
            '#c18869',
            '#aaac84',
          ].map((c, i) => (
            <g key={i}>
              <rect
                x={57 + i * 6}
                y={27 + (i % 3) * 2}
                width={4}
                height={16 - (i % 3) * 2}
                fill={c}
              />
              <rect x={57 + i * 6} y={30 + (i % 3) * 2} width={4} height={1} fill="#e8d1a0" />
            </g>
          ))}
          {/* Window with warm light */}
          <path d="M279 16h65v25h-65Z" fill="#403f31" />
          <path d="M282 17h59v22h-59Z" fill="#aec9b5" />
          <path d="M284 19h55v15h-55Z" fill="#c9daca" />
          <path d="M285 31h12v-3h10v4h11v-5h12v3h8v7h-53Z" fill="#799c80" />
          <path d="M309 17h4v22h-4ZM282 27h59v3h-59Z" fill="#ecdbaf" />
          <path d="M276 39h71v4h-71Z" fill="#c39d66" />
          <path d="M281 44h60l18 45h-25l-7-16h-25l7 16h-23Z" fill="#f1d798" opacity=".22" />
          <path d="M147 19h16v19h-16Z" fill="#c19b5e" />
          <path d="M150 22h10v13h-10Z" fill="#e0cf9f" />
          <path d="M152 30h6v4h-6Zm2-5h3v4h-3Z" fill="#63836a" />
          <path d="M245 18h10v3h3v10h-3v3h-10v-3h-3V21h3Z" fill="#453e2c" />
          <path d="M246 20h8v3h2v7h-3v2h-6v-2h-3v-7h2Z" fill="#dfd0a2" />
          <path d="M249 23h2v5h4v2h-6Z" fill="#72634a" />
          {/* Door */}
          <g className={selected === 'door' ? 'pixel-selected' : ''}>
            <path d="M173 12h45v34h-45Z" fill="#493c2b" />
            <path d="M176 15h39v29h-39Z" fill={state.escaped ? '#e6dcb1' : '#a97643'} />
            {!state.escaped ? (
              <>
                <path d="M179 18h33v22h-33Z" fill="#b88a52" />
                <path d="M181 19h11v17h-11Zm14 0h14v17h-14Z" fill="#94683e" />
                <path d="M183 20h8v2h-8Zm14 0h10v2h-10Z" fill="#d8a561" />
                <path d="M207 31h3v3h-3Z" fill="#eed183" />
              </>
            ) : (
              <>
                <path d="M176 15h9v29h-9Z" fill="#a57842" />
                <path d="M186 15h28v29h-28Z" fill="#d9d8a6" />
                <path d="M186 39h28v5h-28Z" fill="#a6b284" />
              </>
            )}
            <path d="M172 44h47v3h-47Z" fill="#e0b474" />
            <path d="M178 51h36v13h-36Z" fill="#7a7751" />
            <path d="M180 53h32v9h-32Z" fill="#9b9a6b" />
            <path d="M187 56h18v2h-18Z" fill="#d2c69b" />
            <path d="M222 29h8v11h-8Z" fill="#a8894e" />
            <path d="M225 31h2v7h-2Z" fill="#dfc378" />
            {state.keyReturned && <path d="M226 36h3v3h-3Zm1 3h1v7h3v2h-4Z" fill="#f5d685" />}
          </g>
          {/* Mirror */}
          <g className={selected === 'mirror' ? 'pixel-selected' : ''}>
            <path d="M17 48h28v35H17Z" fill="#554d35" />
            <path d="M19 46h24v37H19Z" fill="#b7a068" />
            <path d="M22 49h18v30H22Z" fill="#779a92" />
            <path d="M24 51h14v26H24Z" fill="#a7c4b5" />
            <path d="m25 66 10-10v5L25 71Z" fill="#d6e1c4" />
            <path d="M19 81h24v3H19Z" fill="#d3ba7e" />
          </g>
          {/* Desk and chair */}
          <path d="M38 89h78v27H38Z" fill="#6e5235" opacity=".3" />
          <path d="M35 80h78v29H35Z" fill="#59442e" />
          <path d="M36 79h77v24H36Z" fill="#9a6d41" />
          <path d="M38 79h73v19H38Z" fill="#c6955a" />
          <path d="M39 80h71v3H39Z" fill="#dfb979" />
          <path d="M39 98h70v3H39Z" fill="#785332" />
          <path d="M39 103h5v10h-5Zm64 0h5v10h-5Z" fill="#755337" />
          <path d="M69 116h19v16H69Z" fill="#715038" />
          <path d="M71 117h15v11H71Z" fill="#9f6849" />
          <path d="M71 112h15v6H71Z" fill="#c2915c" />
          <path d="M69 130h4v5h-4Zm15 0h4v5h-4Z" fill="#604c32" />
          <g className={selected === 'telephone' ? 'pixel-selected' : ''}>
            <path d="M47 88h24v8H47Z" fill="#2f4940" />
            <path d="M50 82h18v10H50Z" fill="#507460" />
            <path d="M47 79h24v5H47Zm-1 3h5v5h-5Zm21 0h5v5h-5Z" fill="#2d483c" />
            <path d="M49 79h20v2H49Z" fill="#809b7a" />
            <path d="M56 86h7v6h-7Z" fill="#b4b68b" />
            <path d="M58 87h3v3h-3Z" fill="#496249" />
            <path d="M73 85h3v3h-2v3h3v3h-3" stroke="#3d5140" />
          </g>
          <g className={selected === 'desk' ? 'pixel-selected' : ''}>
            <path d="M84 85h13v11H84Z" fill="#8e744b" />
            <path d="M83 83h13v11H83Z" fill="#ebdbb1" />
            <path d="M85 86h8v1h-8Zm0 3h6v1h-6Z" fill="#a39873" />
            <path d="M93 91h2v2h-2Z" fill="#be775b" />
          </g>
          {!state.biscuitHeld && !state.biscuitGiven && (
            <>
              <path d="M102 86h7v6h-7Z" fill="#e5d4a4" />
              <path d="M103 86h5v5h-5Z" fill="#b57d42" />
              <path d="M104 87h1v1h-1Zm2 2h1v1h-1Z" fill="#694b2b" />
            </>
          )}
          {/* Woven carpet */}
          <path d="M137 115h110v94H137Z" fill="#694c33" opacity=".25" />
          <path d="M133 112h110v94H133Z" fill="#76564a" />
          <path d="M136 115h104v88H136Z" fill="#c39671" />
          <path d="M140 119h96v80H140Z" fill="#975f50" />
          <path d="M144 123h88v72H144Z" fill={`url(#rug-${id})`} />
          <path d="m188 133 25 25-25 25-25-25Z" fill="#c99c72" />
          <path d="m188 139 19 19-19 19-19-19Z" fill="#788570" />
          <path d="m188 148 10 10-10 10-10-10Z" fill="#d3b282" />
          <path d="M184 154h8v8h-8Z" fill="#975f50" />
          {Array.from({ length: 18 }, (_, i) => (
            <path key={i} d={`M${136 + i * 6} 109v3m0 94v3`} stroke="#d3b182" strokeWidth="2" />
          ))}
          {/* Bed and patchwork quilt */}
          <path d="M281 75h69v110h-69Z" fill="#765034" opacity=".25" />
          <path d="M276 63h68v113h-68Z" fill="#54442e" />
          <path d="M278 64h64v108h-64Z" fill="#8e6741" />
          <path d="M281 69h58v99h-58Z" fill="#d0c79f" />
          <path d="M281 69h58v4h-58Z" fill="#efe3b8" />
          <path d="M276 60h68v9h-68Z" fill="#9c7649" />
          <path d="M276 59h68v3h-68Z" fill="#c49a60" />
          <path d="M274 58h6v17h-6Zm65 0h6v17h-6Z" fill="#c09b60" />
          <path d="M285 76h21v16h-21Zm27 0h22v16h-22Z" fill="#a99e7a" />
          <path d="M285 74h21v15h-21Zm27 0h22v15h-22Z" fill="#e9ddb7" />
          <path d="M288 76h15v3h-15Zm27 0h16v3h-16Z" fill="#faf0ce" />
          <path d="M281 97h58v70h-58Z" fill="#b66f55" />
          <path d="M281 96h58v5h-58Z" fill="#e4b692" />
          {Array.from({ length: 16 }, (_, i) => (
            <g key={i}>
              <rect
                x={282 + (i % 4) * 14}
                y={103 + Math.floor(i / 4) * 15}
                width={13}
                height={14}
                fill={['#bb7d5f', '#cc9472', '#af7059', '#d6a17b'][(i + Math.floor(i / 4)) % 4]}
              />
              <path
                d={`M${284 + (i % 4) * 14} ${105 + Math.floor(i / 4) * 15}h9v10h-9Z`}
                stroke="#e2b58a"
                opacity=".4"
              />
            </g>
          ))}
          <path d="M276 166h68v8h-68Z" fill="#a77c4b" />
          <path d="M276 165h68v3h-68Z" fill="#d2a567" />
          <path d="M274 161h6v17h-6Zm65 0h6v17h-6Z" fill="#b48b53" />
          <path d="M348 82h17v26h-17Z" fill="#735436" />
          <path d="M346 80h20v21h-20Z" fill="#af834e" />
          <path d="M348 83h16v9h-16Z" fill="#cba365" />
          <path d="M353 95h6v2h-6Z" fill="#665338" />
          <path d="M354 70h3v13h-3Z" fill="#a99657" />
          <path d="M349 65h13v3h3v9h-19v-9h3Z" fill="#c5bb80" />
          <path d="M349 66h13v3h-13Z" fill="#e0d2a1" />
          <path d="M350 79h12v3h-12Z" fill="#d8ba78" />
          {/* Suitcase */}
          <g className={selected === 'suitcase' ? 'pixel-selected' : ''}>
            <path d="M103 170h32v16h-32Z" fill="#75593a" opacity=".35" />
            {state.caseOpened && (
              <>
                <path d="M101 150h31v17h-31Z" fill="#3c533b" />
                <path d="M104 152h25v12h-25Z" fill="#b8b18a" />
                <path d="M106 155h21v6h-21Z" fill="#d5caa1" />
              </>
            )}
            <path d="M111 161v-5h12v5" stroke="#4b5136" strokeWidth="3" />
            <path d="M100 162h33v19h-33Z" fill="#3f5236" />
            <path d="M102 162h29v16h-29Z" fill="#768652" />
            <path d="M103 163h27v3h-27Z" fill="#9ba36c" />
            <path d="M107 162h3v17h-3Zm18 0h3v17h-3Z" fill="#bcac73" />
            <path d="M106 169h5v3h-5Zm18 0h5v3h-5Z" fill="#e1c681" />
            <path d="M115 164h7v7h-7Z" fill="#e7d5a1" />
            <path d="M117 166h3v1h-3Zm0 2h2v1h-2Z" fill="#938363" />
          </g>
          <Plant x={35} y={211} />
          <Plant x={353} y={210} />
          <Plant x={146} y={70} small />
          <path d="M48 213h38v12H48Z" fill="#75543c" />
          <path d="M46 209h38v12H46Z" fill="#a17b4e" />
          <path d="M48 210h34v3H48Z" fill="#c49c64" />
          <path d="M62 206h10v5H62Z" fill="#a2604d" />
          <path d="M59 203h16v5H59Z" fill="#d2b98a" />
          <path d="M60 201h14v3H60Z" fill="#789080" />
          <path d="M301 202h21v13h-21Z" fill="#785846" />
          <path d="M298 199h24v13h-24Z" fill="#c39e72" />
          <path d="M301 201h18v8h-18Z" fill="#e2c397" />
          {/* Pip, a small pixel rabbit */}
          <g className="pixel-pip" transform="translate(235 183)">
            <path d="M-12 8h27v4h-27Z" fill="#77583c" opacity=".35" />
            <path d="M-10-10v-15h5v4h3v13h6v-15h5v4h3v15h3v15h-4v4H-9V6h-5V-6Z" fill="#3a5960" />
            <path d="M-8-22h2v13h-2Zm15 2h2v11H7Z" fill="#d1b1a1" />
            <path d="M-8-8h18v3h3V6H8v3H-7V6h-5V-3h4Z" fill="#83afb1" />
            <path d="M-6-8h13v3H-6Zm-6 5h3v8h-3Z" fill="#aed0c2" />
            <path className="pixel-eyes" d="M-6-2h3v4h-3Zm12 0h3v4H6Z" fill="#253d40" />
            <path d="M-1 4h4v2h-4Z" fill="#d4dfcd" />
            <path d="M0 3h2v2H0Z" fill="#3a5960" />
            <path d="M-11 8h6v3h-6Zm17 0h6v3H6Z" fill="#6d979b" />
            {state.companion && <path d="M-8 6h18v3H-8Zm13 3h3v5H5Z" fill="#d5a448" />}
            {state.trust && (
              <path className="pixel-heart" d="M17-21h3v-3h4v3h3v6h-3v3h-4v-3h-3Z" fill="#cd7970" />
            )}
          </g>
          {/* Your traveler steps toward the inspected object */}
          <g
            className="pixel-player"
            style={{ transform: `translate(${player.px}px, ${player.py}px)` }}
          >
            <path d="M-7 8H8v3H-7Z" fill="#745239" opacity=".4" />
            <path d="M-5 3h4v7h-4Zm6 0h4v7H1Z" fill="#465349" />
            <path d="M-7-6H7V5H-7Z" fill="#955543" />
            <path d="M-5-5H5V4H-5Z" fill="#bd7956" />
            <path d="M-2-5H1V4H-2Z" fill="#e7bb75" />
            <path d="M-5-14H5v9H-5Z" fill="#e0b887" />
            <path d="M-7-15H7v6H5v-4H-5v4h-2Z" fill="#63513b" />
            <path d="M-5-19H5v3H8v5H-8v-5h3Z" fill="#d6b578" />
            <path d="M-9-13H9v3H-9Z" fill="#edd09a" />
            <path d="M-6-15H6v2H-6Z" fill="#a17846" />
          </g>
          {spots.map((s) => (
            <g
              key={s.id}
              role="button"
              aria-label={`Inspect ${objects[s.id].name}`}
              aria-disabled={busy || state.escaped}
              tabIndex={busy || state.escaped ? -1 : 0}
              className={`pixel-hotspot ${selected === s.id ? 'pixel-hotspot-active' : ''}`}
              onClick={() => {
                if (!busy && !state.escaped) onSelect(s.id);
              }}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !busy && !state.escaped) {
                  e.preventDefault();
                  onSelect(s.id);
                }
              }}
            >
              <title>{s.name}</title>
              <rect x={s.x - 15} y={s.y - 20} width="30" height="36" fill="transparent" />
              <g className="pixel-marker" transform={`translate(${s.x} ${s.y - 17})`}>
                <path d="M-5-4H5v8H2v3h-4V4h-3Z" fill={selected === s.id ? '#e7cd8e' : '#fbefc4'} />
                <path d="M-1-2h2v4h-2Zm-1 1h4v1h-4Z" fill="#6d7150" />
              </g>
              <text
                className="pixel-object-label"
                x={s.x}
                y={s.y - 28}
                textAnchor="middle"
                fontFamily="monospace"
                fontSize="7"
                fill="#fff4d4"
                paintOrder="stroke"
                stroke="#344b3b"
                strokeWidth="3"
              >
                {s.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="pixel-room-bottomline">
        <span>
          {busy
            ? '✦ The room is listening…'
            : selected
              ? `↳ ${spots.find((s) => s.id === selected)?.name}`
              : '↳ Click a sparkle. Follow your curiosity.'}
        </span>
        <span>{state.escaped ? 'CHECKED OUT' : 'A VERY PARTICULAR LITTLE PLACE'}</span>
      </div>
    </div>
  );
}
