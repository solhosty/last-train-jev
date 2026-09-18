import { trainObjects, type TrainTarget, type TrainState } from './train-game';
const spots: { id: TrainTarget; x: number; y: number; label: string }[] = [
  { id: 'pianist', x: 111, y: 79, label: 'MARA · PIANIST' },
  { id: 'courier', x: 284, y: 79, label: 'ELI · COURIER' },
  { id: 'doctor', x: 459, y: 79, label: 'VALE · DOCTOR' },
  { id: 'luggage', x: 100, y: 180, label: 'YOUR LUGGAGE' },
  { id: 'log', x: 325, y: 187, label: 'NIGHT LOG' },
  { id: 'conductor', x: 560, y: 173, label: 'CONDUCTOR' },
];
function Person({
  x,
  y,
  coat,
  hair = '#544036',
  hat = false,
}: {
  x: number;
  y: number;
  coat: string;
  hair?: string;
  hat?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-9 11h20v3H-9Z" fill="#342f2b" opacity=".3" />
      <path d="M-6 2h5v11h-5M2 2h5v11H2" fill="#283a3d" />
      <path d="M-8-11H8V5H-8Z" fill={coat} />
      <path d="M-2-9H1V3H-2Z" fill="#d6ba85" />
      <path d="M-6-23H6v13H-6Z" fill="#d6a478" />
      <path d="M-7-24H7v6H5v-3H-5v4h-2Z" fill={hair} />
      <path d="M-4-16h2v2h-2M3-16h2v2H3" fill="#3a302c" />
      {hat && (
        <>
          <path d="M-7-27H7v6H-7Z" fill="#304e51" />
          <path d="M-10-22H9v3h-19Z" fill="#d1b16b" />
        </>
      )}
    </g>
  );
}
export default function TrainCarriage({
  state,
  selected,
  busy,
  onSelect,
}: {
  state: TrainState;
  selected: TrainTarget | null;
  busy: boolean;
  onSelect: (id: TrainTarget) => void;
}) {
  const p = spots.find((s) => s.id === selected);
  return (
    <div className="train-world">
      <div className="train-world-head">
        <span>
          <i /> NIGHT EXPRESS · CARRIAGE 07
        </span>
        <span>
          00:28 <b>✦</b> BORDER AT DAWN
        </span>
      </div>
      <svg
        viewBox="0 0 620 250"
        fill="none"
        className="train-pixels"
        shapeRendering="crispEdges"
        role="img"
        aria-label="Top-down pixel-art night train with three passengers and a conductor"
      >
        <defs>
          <pattern id="train-floor" width="24" height="16" patternUnits="userSpaceOnUse">
            <rect width="24" height="16" fill="#a57d51" />
            <path d="M0 15h24M23 0v15" stroke="#846140" />
            <path d="M3 5h10m-4 5h11" stroke="#b88c59" />
          </pattern>
          <pattern id="train-rug" width="14" height="14" patternUnits="userSpaceOnUse">
            <rect width="14" height="14" fill="#764a41" />
            <path d="m7 3 4 4-4 4-4-4Z" fill="#9b6850" />
          </pattern>
        </defs>
        <path d="M0 13h620v226H0Z" fill="#172c32" />
        <path d="M18 23h584v204H18Z" fill="#2c3230" />
        <path d="M25 30h570v188H25Z" fill="url(#train-floor)" />
        <path d="M25 30h570v13H25Zm0 173h570v9H25Z" fill="#594632" opacity=".5" />
        <path d="M25 137h570v34H25Z" fill="url(#train-rug)" />
        <path d="M25 137h570v2H25Zm0 30h570v2H25Z" fill="#ccaa70" />
        {[35, 208, 381].map((x, i) => (
          <g key={x}>
            <path d={`M${x} 29h152v7H${x}Z`} fill="#526253" />
            <path d={`M${x + 9} 16h123v23H${x + 9}Z`} fill="#223d49" />
            <path d={`M${x + 12} 19h117v15H${x + 12}Z`} fill="#365560" />
            <path d={`M${x + 42} 19v15m47-15v15`} stroke="#b5ab7a" strokeWidth="3" />
            <path d={`M${x + 12} 31h117v3H${x + 12}Z`} fill="#819b92" />
            <path d={`M${x + 6} 48h37v65H${x + 6}Zm${88} 0h37v65h-37Z`} fill="#414438" />
            <rect
              x={x + 7}
              y="47"
              width="36"
              height="60"
              fill={i === 0 ? '#637769' : i === 1 ? '#586d72' : '#687563'}
            />
            <rect
              x={x + 94}
              y="47"
              width="36"
              height="60"
              fill={i === 0 ? '#637769' : i === 1 ? '#586d72' : '#687563'}
            />
            {[x + 9, x + 96].map((z) => (
              <g key={z}>
                <rect x={z} y="50" width="30" height="13" fill="#91a08a" />
                <path d={`M${z} 68h30v30h-30Z`} fill="#778975" />
                <path d={`M${z + 4} 71h22v23h-22Z`} stroke="#95a28a" />
                <path d={`M${z - 2} 104h35v5h-35Z`} fill="#b69767" />
              </g>
            ))}
            <path d={`M${x + 52} 50h29v23h-29Z`} fill="#715536" />
            <path d={`M${x + 51} 47h31v22h-31Z`} fill="#c09a65" />
            <path d={`M${x + 54} 49h25v3h-25Z`} fill="#e0bd80" />
            <path d={`M${x + 144} 35h6v94h-6Z`} fill="#c0a275" />
            <path d={`M${x + 142} 127h10v6h-10Z`} fill="#61513c" />
            <text
              x={x + 67}
              y="124"
              textAnchor="middle"
              fill="#e0c392"
              fontSize="6"
              fontFamily="monospace"
            >
              0{i + 1}
            </text>
          </g>
        ))}
        <path d="M87 49h14v16H87Z" fill="#e2d4aa" />
        <path d="M89 53h10m-10 4h8m-8 4h10" stroke="#8c805d" />
        <path d="M261 52h10v7h-10Z" fill="#d8c59a" />
        <path d="M274 48h5v16h-5Z" fill="#405955" />
        <path d="M438 50h18v13h-18Z" fill="#39463d" />
        <path d="M443 46h8v5h-8Z" stroke="#8d936c" strokeWidth="2" />
        <path d="M446 54h3v6h-3Zm-2 2h7v2h-7Z" fill="#c4b98c" />
        <Person x={111} y={85} coat="#a86f61" hair="#493729" />
        <Person x={284} y={85} coat="#617b95" hair="#bb9462" />
        <Person x={459} y={85} coat="#d1c5a3" hair="#a9b1a0" />
        <path d="M536 34h7v101h-7Zm0 45h56v5h-56Z" fill="#ad936b" />
        <path d="M546 35h42v40h-42Z" fill="#587f81" opacity=".6" />
        <path d="M552 41h2v24h-2Zm5-2h2v15h-2Z" fill="#94b5ac" />
        <path d="M550 94h39v21h-39Z" fill="#81603f" />
        <path d="M554 97h31v14h-31Z" fill="#b99762" />
        <path d="M562 101h15v3h-15Z" fill="#5e624e" />
        <path d="M40 185h138v24H40Z" fill="#75573b" />
        <path d="M42 182h134v18H42Z" fill="#bc965e" />
        <path d="M49 202h6v10h-6Zm112 0h6v10h-6Z" fill="#5d4835" />
        <path d="M81 171h38v25H81Z" fill="#40554c" />
        <path d="M84 174h32v18H84Z" fill="#64816c" />
        <path d="M89 172h4v23h-4Zm17 0h4v23h-4Z" fill="#c1af7b" />
        <path d="M93 169v-5h12v5" stroke="#c1af7b" strokeWidth="3" />
        <path d="M131 181h15v10h-15Z" fill="#574734" />
        <path d="M133 182h11v7h-11Z" fill="#c5a875" />
        <path d="M218 190h30v5h-30Zm18-9h23v4h-23Z" fill="#658b83" opacity=".55" />
        <path d="M295 178h64v30h-64Z" fill="#715334" />
        <path d="M292 174h67v26h-67Z" fill="#bb9158" />
        <path d="M298 177h56v3h-56Z" fill="#e0bc7e" />
        <path d="M313 181h25v14h-25Z" fill="#e5d5a4" />
        <path d="M325 181v14m-9-10h6m-6 3h6m6-3h7m-7 3h7" stroke="#928366" />
        <path d="M347 179h4v15h-4Z" fill="#465558" />
        <path d="M520 180h71v32h-71Z" fill="#315057" />
        <path d="M522 180h67v4h-67Z" fill="#c8ab75" />
        <Person x={560} y={170} coat="#41666e" hat />
        <path d="M594 130h17v43h-17Z" fill={state.escaped ? '#d1d6a3' : '#66553f'} />
        <path d="M596 134h11v34h-11Z" fill={state.escaped ? '#f5e7bd' : '#917249'} />
        <path d="M597 149h2v5h-2Z" fill="#e0bf75" />
        <g
          className="train-traveler"
          style={{
            transform: `translate(${state.escaped ? 601 : p ? Math.min(580, p.x + 23) : 210}px, 154px)`,
          }}
        >
          <Person x={0} y={0} coat="#b18548" hair="#503d30" />
        </g>
        <path d="M19 218h584v7H19ZM19 23h584v6H19Z" fill="#ad9164" />
        <path d="M19 218h584v2H19Z" fill="#d4b980" />
        {spots.map((s) => (
          <g
            key={s.id}
            role="button"
            aria-label={`Inspect ${trainObjects[s.id].name}`}
            aria-disabled={busy || state.escaped}
            tabIndex={busy || state.escaped ? -1 : 0}
            className={`train-hotspot ${selected === s.id ? 'active' : ''}`}
            onClick={() => !busy && !state.escaped && onSelect(s.id)}
            onKeyDown={(e) => {
              if (['Enter', ' '].includes(e.key) && !busy && !state.escaped) {
                e.preventDefault();
                onSelect(s.id);
              }
            }}
          >
            <rect x={s.x - 29} y={s.y - 31} width="58" height="50" fill="transparent" />
            <path
              d={`M${s.x - 3} ${s.y - 33}h6v6h-6Z`}
              fill={state.inspected.includes(s.id) ? '#9fa983' : '#f0d68b'}
            />
            <text
              x={s.x}
              y={s.id === 'luggage' || s.id === 'log' || s.id === 'conductor' ? s.y + 33 : s.y - 41}
              textAnchor="middle"
              fill="#f0dfbb"
              stroke="#223d3d"
              strokeWidth="2"
              paintOrder="stroke"
              fontSize="6"
              fontFamily="monospace"
            >
              {s.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="train-world-foot">
        <span>
          {busy
            ? '✦ Jev is weighing your argument…'
            : selected
              ? trainObjects[selected].role
              : 'Click a passenger or a piece of evidence.'}
        </span>
        <span>THE TRUTH STAYS FIXED. YOUR APPROACH IS YOURS.</span>
      </div>
    </div>
  );
}
