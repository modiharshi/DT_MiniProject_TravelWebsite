// Group overlap and the compromise meter. Pure and explainable on purpose:
//   shared  = an interest picked by two or more travellers
//   common  = an interest picked by everyone who has picked anything
//   single  = an interest only one traveller picked
//   meter   = the average, over every pair of travellers, of (picks in both) / (picks in either)
// A meter of 100 means identical lists; 0 means nothing in common.
export function groupOverlap(members) {
  const active = members.filter((m) => m.interests.length > 0);
  const tally = new Map();
  active.forEach((m) => m.interests.forEach((id) => {
    if (!tally.has(id)) tally.set(id, []);
    tally.get(id).push(m.id);
  }));

  const rows = [...tally].map(([id, by]) => ({ id, by }));
  const shared = rows.filter((r) => r.by.length >= 2).sort((a, b) => b.by.length - a.by.length);
  const common = active.length >= 2 ? rows.filter((r) => r.by.length === active.length).map((r) => r.id) : [];
  const single = rows.filter((r) => r.by.length === 1);

  let meter = null;
  if (active.length >= 2) {
    let sum = 0;
    let pairs = 0;
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = new Set(active[i].interests);
        const both = active[j].interests.filter((x) => a.has(x)).length;
        const either = a.size + active[j].interests.length - both;
        sum += either ? both / either : 0;
        pairs += 1;
      }
    }
    meter = Math.round((sum / pairs) * 100);
  }

  const tier = meter === null ? null : meter >= 60 ? 'easy' : meter >= 30 ? 'some' : 'lots';
  return { shared, common, single, meter, tier, activeCount: active.length };
}

export const TIER_TEXT = {
  easy: 'Easy match',
  some: 'Some give and take',
  lots: 'Plenty of compromise',
};
