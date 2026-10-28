import { forwardRef, useEffect, useRef, useState } from 'react';
import { MAX_PICKS } from '../data/interests.js';
import { InterestIcon, TravellerArt, Tick } from './FlowIcons.jsx';
import {
  LIMITS, STEPS, STEP_LABEL, impactOfSize, impactOfTraveller, memberLabel, validate,
} from '../lib/prefs.js';
import { groupOverlap, TIER_TEXT } from '../lib/overlap.js';

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
    <path d="M20 12H5m6-6-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---- small shared pieces ---------------------------------------------------------------------
function Progress({ current }) {
  const at = STEPS.indexOf(current);
  return (
    <ol className="progress" aria-label="Trip steps">
      {STEPS.map((s, i) => (
        <li key={s} data-state={i < at ? 'done' : i === at ? 'now' : 'next'} aria-current={i === at ? 'step' : undefined}>
          <span className="progress-dot" aria-hidden="true">{i < at ? <Tick /> : i + 1}</span>
          <span className="progress-label">{STEP_LABEL[s]}</span>
        </li>
      ))}
    </ol>
  );
}

const StepShell = forwardRef(function StepShell({ step, city, title, lede, onBack, backLabel, children, footer }, headingRef) {
  return (
    <>
      <button type="button" className="back" onClick={onBack}><Arrow />{backLabel}</button>
      <Progress current={step} />
      <p className="stamp">{city.name}</p>
      <h2 ref={headingRef} tabIndex={-1} className="display step-title"><span className="script">{title}</span></h2>
      {lede && <p className="lede step-lede">{lede}</p>}
      {children}
      <div className="step-foot">{footer}</div>
    </>
  );
});

// A validation message that takes focus each time the user tries to continue and cannot.
function useAttempt() {
  const [attempt, setAttempt] = useState(0);
  return [attempt, () => setAttempt((n) => n + 1)];
}
function ErrorList({ errors, attempt }) {
  const ref = useRef(null);
  useEffect(() => { if (attempt && errors.length) ref.current?.focus(); }, [attempt]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!attempt || !errors.length) return null;
  return (
    <div className="form-error" role="alert" tabIndex={-1} ref={ref}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M12 3l10 18H2z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" /><path d="M12 10v5M12 18v.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
      <ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
    </div>
  );
}

function Radio({ name, value, checked, onChange, className = '', children }) {
  return (
    <label className={`opt ${className}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
      <span className="opt-face">{children}</span>
    </label>
  );
}

function Confirm({ impact, onYes, onNo, yes = 'Change it' }) {
  return (
    <div className="confirm" role="alert">
      <p><strong>This will reset some choices.</strong> {impact.join(' ')}</p>
      <div className="confirm-row">
        <button type="button" className="btn btn-small btn-primary" onClick={onYes}>{yes}</button>
        <button type="button" className="btn btn-small" onClick={onNo}>Keep as it is</button>
      </div>
    </div>
  );
}

// ---- step 1: who is travelling ----------------------------------------------------------------
const WHO = [
  { id: 'solo', label: 'Solo', sub: 'Just me, at my own pace' },
  { id: 'group', label: 'Friends / Group', sub: 'Up to five of us, everyone has a say' },
  { id: 'family', label: 'Family', sub: 'Shared picks, gentler days' },
];

export const WhoStep = forwardRef(function WhoStep({ prefs, city, api, onBack, onNext }, ref) {
  const [attempt, bump] = useAttempt();
  const [pending, setPending] = useState(null);
  const errors = validate(prefs).who;
  const isGroup = prefs.traveller === 'group';
  const range = Array.from(
    { length: (isGroup ? LIMITS.groupMax : LIMITS.familyMax) - 1 },
    (_, i) => i + 2,
  );

  const guard = (impact, apply) => {
    if (impact.length) setPending({ impact, apply });
    else { setPending(null); apply(); }
  };

  return (
    <StepShell ref={ref} step="who" city={city} title="Who’s coming?" onBack={onBack} backLabel={`Back to ${city.name}`}
      lede="This changes the tone of the plan and which places make sense."
      footer={<button type="button" className="btn btn-primary" onClick={() => (errors.length ? bump() : onNext())}>Continue to interests</button>}>
      <fieldset className="choice">
        <legend className="sr-only">Who is travelling</legend>
        <div className="who-grid">
          {WHO.map((w) => (
            <Radio key={w.id} name="traveller" value={w.id} checked={prefs.traveller === w.id} className="opt-who"
              onChange={() => guard(impactOfTraveller(prefs, w.id), () => api.setTraveller(w.id))}>
              <TravellerArt kind={w.id} />
              <span className="opt-title">{w.label}</span>
              <span className="opt-sub">{w.sub}</span>
            </Radio>
          ))}
        </div>
      </fieldset>

      {pending && <Confirm impact={pending.impact} onNo={() => setPending(null)} onYes={() => { pending.apply(); setPending(null); }} />}

      {(prefs.traveller === 'group' || prefs.traveller === 'family') && (
        <fieldset className="choice size">
          <legend>How many of you?</legend>
          <div className="seg">
            {range.map((n) => (
              <Radio key={n} name="size" value={n} checked={prefs.size === n} onChange={() => guard(impactOfSize(prefs, n), () => api.setSize(n))}>
                <span aria-hidden="true">{n}</span><span className="sr-only">{n} people</span>
              </Radio>
            ))}
          </div>
        </fieldset>
      )}

      {prefs.traveller === 'family' && (
        <label className="check">
          <input type="checkbox" checked={prefs.seniors} onChange={(e) => api.setSeniors(e.target.checked)} />
          <span className="check-box" aria-hidden="true"><Tick /></span>
          <span><strong>Someone is 65 or older</strong><span className="opt-sub">We will keep days gentler and look for comfortable seating.</span></span>
        </label>
      )}

      <ErrorList errors={errors} attempt={attempt} />
    </StepShell>
  );
});

// ---- step 2: interests ------------------------------------------------------------------------
function GroupOverlap({ prefs, city }) {
  const o = groupOverlap(prefs.members);
  const label = (id) => city.interests.find((i) => i.id === id)?.label || id;
  const who = (ids) => ids.map((id) => memberLabel(prefs, prefs.members.find((m) => m.id === id))).join(', ');
  return (
    <section className="overlap" aria-labelledby="overlap-h">
      <h3 id="overlap-h">Group overlap</h3>
      {o.activeCount < 2 ? (
        <p className="hint">Once two travellers have picked something, you will see what you share and where you will need to compromise.</p>
      ) : (
        <>
          <div className="overlap-block">
            <p className="overlap-cap">{o.shared.length ? 'You share' : 'Nothing shared yet'}</p>
            {o.shared.length > 0 && (
              <ul className="glow-list">
                {o.shared.map((r) => (
                  <li key={r.id} className="glow" data-all={o.common.includes(r.id) ? 'true' : 'false'}>
                    <InterestIcon id={r.id} size={26} />
                    <span>{label(r.id)}</span>
                    <small>{o.common.includes(r.id) ? 'everyone' : `${r.by.length} of ${o.activeCount}`}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {o.single.length > 0 && (
            <div className="overlap-block">
              <p className="overlap-cap">Only one of you picked</p>
              <ul className="single-list">
                {o.single.map((r) => <li key={r.id}>{label(r.id)} <small>{who(r.by)}</small></li>)}
              </ul>
            </div>
          )}
          <div className="meter-wrap">
            <p className="overlap-cap" id="meter-l">Compromise meter</p>
            <div className="meter" role="meter" aria-labelledby="meter-l" aria-valuemin={0} aria-valuemax={100}
              aria-valuenow={o.meter} aria-valuetext={`${TIER_TEXT[o.tier]}, ${o.meter} per cent in common`}>
              <span className="meter-fill" style={{ width: `${Math.max(o.meter, 3)}%` }} />
              <span className="meter-tick" style={{ left: '30%' }} />
              <span className="meter-tick" style={{ left: '60%' }} />
            </div>
            <p className="meter-text"><strong>{TIER_TEXT[o.tier]}</strong> · {o.meter}% in common</p>
          </div>
          <details className="how">
            <summary>How this is worked out</summary>
            <p>
              For every pair of travellers we count the picks they share and divide by all the picks either of them made.
              The meter is the average across pairs. Identical lists score 100; nothing in common scores 0.
              Travellers who have not picked yet are left out.
            </p>
            <p>The composer will aim to include at least one stop from each traveller&rsquo;s own picks, and will say so if the places available make that impossible.</p>
          </details>
        </>
      )}
    </section>
  );
}

export const InterestsStep = forwardRef(function InterestsStep({ prefs, city, api, onBack, onNext }, ref) {
  const [activeId, setActiveId] = useState(prefs.members[0].id);
  const [attempt, bump] = useAttempt();
  const active = prefs.members.find((m) => m.id === activeId) || prefs.members[0];
  const isGroup = prefs.traveller === 'group';
  const full = active.interests.length >= MAX_PICKS;
  const missing = validate(prefs).interests;

  const next = () => {
    if (!missing.length) return onNext();
    setActiveId(missing[0].memberId);
    bump();
  };

  const title = prefs.traveller === 'solo' ? 'What are you into?' : prefs.traveller === 'family' ? 'What does the family enjoy?' : 'What is everyone into?';

  return (
    <StepShell ref={ref} step="interests" city={city} title={title} onBack={onBack} backLabel="Back to who’s coming"
      lede={isGroup ? 'Pick a traveller, then their interests. Each person chooses for themselves.' : `Choose up to ${MAX_PICKS}. Only things ${city.name} can actually offer are listed.`}
      footer={<button type="button" className="btn btn-primary" onClick={next}>Continue to trip details</button>}>

      {prefs.dropped.length > 0 && (
        <p className="inline-note" role="status">
          {city.name} does not offer {prefs.dropped.join(', ')}, so {prefs.dropped.length > 1 ? 'those picks were' : 'that pick was'} cleared. The rest carried over.
        </p>
      )}

      {isGroup && (
        <fieldset className="choice members">
          <legend>Whose picks?</legend>
          <div className="member-chips">
            {prefs.members.map((m) => (
              <Radio key={m.id} name="member" value={m.id} checked={m.id === active.id} onChange={() => setActiveId(m.id)} className="opt-member">
                <span>{memberLabel(prefs, m)}</span>
                <small>{m.interests.length ? `${m.interests.length} picked` : 'none yet'}</small>
              </Radio>
            ))}
          </div>
          <label className="field">
            <span>Name for {memberLabel(prefs, active)} (optional)</span>
            <input type="text" maxLength={LIMITS.nameMax} value={active.name} autoComplete="off"
              placeholder={`Traveller ${prefs.members.indexOf(active) + 1}`} onChange={(e) => api.rename(active.id, e.target.value)} />
          </label>
        </fieldset>
      )}

      <p className="pick-count" aria-live="polite">
        {active.interests.length} of {MAX_PICKS} picked{full ? '. That is the limit, so remove one to add another.' : '.'}
      </p>
      <ul className="cards" aria-label={`Interests in ${city.name}${isGroup ? ` for ${memberLabel(prefs, active)}` : ''}`}>
        {city.interests.map((i) => {
          const on = active.interests.includes(i.id);
          const blocked = full && !on;
          return (
            <li key={i.id}>
              <button type="button" className="card" aria-pressed={on} aria-disabled={blocked || undefined}
                onClick={() => !blocked && api.toggle(active.id, i.id)}>
                <InterestIcon id={i.id} />
                <span className="card-label">{i.label}</span>
                <span className="card-hint">{i.hint}</span>
                <span className="card-stamp" aria-hidden="true"><Tick /></span>
              </button>
            </li>
          );
        })}
      </ul>

      {isGroup && <GroupOverlap prefs={prefs} city={city} />}

      <ErrorList errors={missing.map((m) => m.message)} attempt={attempt} />
    </StepShell>
  );
});

// ---- step 3: trip details ---------------------------------------------------------------------
const BUDGET = [
  ['1', '₹', 'Easy on the wallet'],
  ['2', '₹₹', 'Comfortable'],
  ['3', '₹₹₹', 'Treat yourself'],
];
const PACE = [
  ['relaxed', 'Relaxed', 'About 3 main stops a day'],
  ['balanced', 'Balanced', 'About 4 main stops a day'],
  ['packed', 'Packed', 'About 5 main stops a day'],
];
const FOOD = [['veg', 'Veg'], ['nonveg', 'Non-veg'], ['jain', 'Jain'], ['any', 'No preference']];

export const DetailsStep = forwardRef(function DetailsStep({ prefs, city, api, onBack, onNext }, ref) {
  const [attempt, bump] = useAttempt();
  const d = prefs.details;
  const problems = validate(prefs).details;
  return (
    <StepShell ref={ref} step="details" city={city} title="The trip itself" onBack={onBack} backLabel="Back to interests"
      lede="Big choices only. You can change any of this on the next screen."
      footer={<button type="button" className="btn btn-primary" onClick={() => (problems.length ? bump() : onNext())}>Review my trip</button>}>

      <fieldset className="choice">
        <legend>How many days?</legend>
        <div className="seg">
          {[1, 2, 3, 4, 5].map((n) => (
            <Radio key={n} name="days" value={n} checked={d.days === n} onChange={() => api.detail('days', n)}>
              <span aria-hidden="true">{n}</span><span className="sr-only">{n} {n === 1 ? 'day' : 'days'}</span>
            </Radio>
          ))}
        </div>
      </fieldset>

      <fieldset className="choice" aria-describedby="budget-note">
        <legend>Budget tier</legend>
        <div className="stack">
          {BUDGET.map(([v, sym, text]) => (
            <Radio key={v} name="budget" value={v} checked={d.budget === v} onChange={() => api.detail('budget', v)} className="opt-row">
              <span className="sym" aria-hidden="true">{sym}</span><span className="opt-title">{text}</span>
              <span className="sr-only">Tier {v} of 3</span>
            </Radio>
          ))}
        </div>
        <p id="budget-note" className="hint">Tiers are indicative, not prices. Costs change, so check before you book.</p>
      </fieldset>

      <fieldset className="choice">
        <legend>Pace</legend>
        <div className="stack">
          {PACE.map(([v, t, s]) => (
            <Radio key={v} name="pace" value={v} checked={d.pace === v} onChange={() => api.detail('pace', v)} className="opt-row">
              <span className="opt-title">{t}</span><span className="opt-sub">{s}</span>
            </Radio>
          ))}
        </div>
      </fieldset>

      <fieldset className="choice">
        <legend>Food</legend>
        <div className="seg seg-wrap">
          {FOOD.map(([v, t]) => (
            <Radio key={v} name="food" value={v} checked={d.food === v} onChange={() => api.detail('food', v)}>{t}</Radio>
          ))}
        </div>
      </fieldset>

      <label className="check">
        <input type="checkbox" checked={d.lowWalking} onChange={(e) => api.detail('lowWalking', e.target.checked)} />
        <span className="check-box" aria-hidden="true"><Tick /></span>
        <span><strong>Keep walking low</strong><span className="opt-sub">Fewer long walks and stairs where we can.</span></span>
      </label>
      {prefs.seniors && !d.lowWalking && <p className="inline-note" role="status">You said someone is 65 or older. Low walking is worth a thought.</p>}

      <ErrorList errors={problems.map((p) => p.message)} attempt={attempt} />
    </StepShell>
  );
});

// ---- step 4: review ---------------------------------------------------------------------------
export const ReviewStep = forwardRef(function ReviewStep({ prefs, city, onBack, onGo, onCompose }, ref) {
  const d = prefs.details;
  const who = { solo: 'Solo', group: `Friends / Group of ${prefs.size}`, family: `Family of ${prefs.size}${prefs.seniors ? ', includes someone 65+' : ''}` }[prefs.traveller];
  const label = (id) => city.interests.find((i) => i.id === id)?.label || id;
  const budget = BUDGET.find((b) => b[0] === d.budget);
  const pace = PACE.find((p) => p[0] === d.pace);
  const food = FOOD.find((f) => f[0] === d.food);
  return (
    <StepShell ref={ref} step="review" city={city} title="Your trip brief" onBack={onBack} backLabel="Back to trip details"
      lede="Check it reads right. Tap Change on anything that doesn’t."
      footer={(
        <>
          <button type="button" className="btn btn-primary" onClick={onCompose}>Compose my trip</button>
          <p className="hint">A rule-based Trip Composer builds it from your choices. Nothing leaves your browser.</p>
        </>
      )}>
      <dl className="brief">
        <div><dt>Where</dt><dd>{city.name}</dd></div>
        <div><dt>Who</dt><dd>{who}<button type="button" className="linklike" onClick={() => onGo('who')}>Change<span className="sr-only"> who is travelling</span></button></dd></div>
        <div>
          <dt>Into</dt>
          <dd>
            <ul className="brief-picks">
              {prefs.members.map((m) => (
                <li key={m.id}>
                  {prefs.traveller === 'group' && <strong>{memberLabel(prefs, m)}</strong>}
                  <span>{m.interests.map(label).join(', ')}</span>
                </li>
              ))}
            </ul>
            <button type="button" className="linklike" onClick={() => onGo('interests')}>Change<span className="sr-only"> interests</span></button>
          </dd>
        </div>
        <div>
          <dt>Trip</dt>
          <dd>
            {d.days} {d.days === 1 ? 'day' : 'days'} · {budget?.[1]} {budget?.[2]} · {pace?.[1]} · {food?.[1]}{d.lowWalking ? ' · Low walking' : ''}
            <button type="button" className="linklike" onClick={() => onGo('details')}>Change<span className="sr-only"> trip details</span></button>
          </dd>
        </div>
      </dl>
    </StepShell>
  );
});
