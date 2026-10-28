import { MapArt, CityGlyphs } from './MapArt.jsx';
import { CITY_LIST } from '../data/cities.js';
import { STATE_LIST, STATES } from '../data/states.js';

const RING = 'M26 0C26 14 14 27-2 26C-18 25-27 12-26-3C-25-19-10-27 4-26C18-25 28-12 25 4C24 10 20 16 14 20';

function Marker({ city, nav, hovered, arrived, onSelect, onHover }) {
  const inState = nav.level === 'india' || nav.stateId === city.stateId;
  const isActive = nav.level === 'city' && nav.cityId === city.id;
  const closeUp = nav.level !== 'india';
  const showTag = inState && (hovered || (closeUp && !isActive));
  const showTeaser = hovered && nav.level === 'india';
  const w = city.name.length * 9.6 + 22;
  const side = city.tagSide === 'l' ? -1 : 1;
  const tx = side === 1 ? 17 : -17 - w;
  const tw = city.teaser.length * 6.3 + 18;
  const label = `${city.name}, ${STATES[city.stateId].name}. ${nav.level === 'india' ? 'Zoom in to plan a trip.' : isActive ? 'Selected.' : 'Switch to this city.'}`;

  return (
    <g transform={`translate(${city.x} ${city.y})`} className="marker" data-vis={inState ? 'on' : 'off'}
      data-active={isActive ? 'true' : 'false'} data-hover={hovered ? 'true' : 'false'}>
      <g className="px">
        <g role="button" tabIndex={inState ? 0 : -1} aria-label={label} aria-hidden={inState ? undefined : true}
          className="marker-btn"
          onClick={(e) => { e.stopPropagation(); onSelect(city.id); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(city.id); } }}
          onPointerEnter={() => onHover(city.id)} onPointerLeave={() => onHover(null)}
          onFocus={() => onHover(city.id)} onBlur={() => onHover(null)}>
          <circle className="hit" r="22" />
          {!isActive && <circle className="pulse" r="11" />}
          <circle className="focus-ring focus-ring-b" r="23" />
          <circle className="focus-ring" r="19" />
          <circle className="dot" r="6.5" />
          {showTag && (
            <g className="tag" transform={`translate(${tx} -34) rotate(-2)`}>
              <rect width={w} height="26" rx="2" />
              <text x={w / 2} y="18.5" textAnchor="middle">{city.name}</text>
              {showTeaser && (
                <g className="teaser" transform="translate(0 30)">
                  <rect width={tw} height="22" rx="2" />
                  <text x="9" y="15">{city.teaser}</text>
                </g>
              )}
            </g>
          )}
        </g>
        {isActive && arrived && (
          <path key={`ring-${city.id}`} className="ink-ring" d={RING} pathLength="1" />
        )}
      </g>
    </g>
  );
}


export function ZoomStage({ svgRef, uiRef, nav, drawKey, arrived, hovered, onSelect, onHover, fading }) {
  const active = nav.level === 'india' ? null : STATES[nav.stateId];

  return (
    <svg ref={svgRef} className="map" data-level={nav.level} data-fading={fading ? 'true' : 'false'}
      role="group" aria-label="Illustrated map of India. Four cities can be selected."
      preserveAspectRatio="xMidYMid meet" viewBox="0 0 1000 1000">
      <g className="art" aria-hidden="true"><MapArt /></g>

      <rect className="dimmer" x="-3000" y="-3000" width="7000" height="7000" aria-hidden="true" />

      <g className="spotlight" aria-hidden="true">
        {STATE_LIST.map((st) => (
          <g key={st.id} data-on={active?.id === st.id ? 'true' : 'false'}>
            <path d={st.path} className="spot-fill" />
            {active?.id === st.id && drawKey > 0 && (
              <path key={`${st.id}-${drawKey}`} d={st.path} className="spot-border" pathLength="1" />
            )}
          </g>
        ))}
      </g>

      <g className="glyphs" aria-hidden="true">
        {CITY_LIST.map((c) => (
          <g key={c.id} className="glyph-set" data-on={nav.level !== 'india' && nav.stateId === c.stateId ? 'true' : 'false'}>
            <CityGlyphs city={c} />
          </g>
        ))}
      </g>

      <g ref={uiRef} className="ui">
        {CITY_LIST.map((c) => (
          <Marker key={c.id} city={c} nav={nav} arrived={arrived} hovered={hovered === c.id} onSelect={onSelect} onHover={onHover} />
        ))}
      </g>
    </svg>
  );
}
