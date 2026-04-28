# Spec — Wisdom Layer

> Cross-user pattern intelligence with strong privacy guarantees. The agent learns from many lives without ever leaking any one.

## Goal

Provide insights like:
- "Founders at your stage typically face co-founder conflict 18-24 months in. Want me to surface what worked for similar cases?"
- "Of executives in your cohort who hired a Chief of Staff, 70% said the most useful first 90-day focus was X."
- "Your decision pattern on hiring tends to delay 2-3 weeks beyond optimal — peer cohort data suggests deciding by week 2 has 30% better outcomes."

## Privacy guarantees (NON-NEGOTIABLE)

1. **No raw cross-user reads ever.** Per-user agent code can never query another user's memories/messages/entities.
2. **k-anonymity ≥ 50.** No aggregate ever based on fewer than 50 contributing users.
3. **Differential privacy ε ≤ 1.0.** Every aggregate adds Laplace/Gaussian noise.
4. **Opt-in default off.** User must explicitly enable contribution.
5. **Transparency UI.** User can see exactly what categories of data they contribute to.
6. **Right to withdraw.** User opts out → next aggregation cycle excludes them.

## Architecture

```
       ┌─────────────────────────────────────────────┐
       │           Per-user data (private)           │
       │  memories, decisions, calendar patterns     │
       └──────────────────┬──────────────────────────┘
                          │  (only for opted-in users)
                          ▼
       ┌─────────────────────────────────────────────┐
       │         Anonymizer + extractor              │
       │  - strip PII                                │
       │  - normalize to taxonomy                    │
       │  - per-user hash (no reverse mapping)       │
       └──────────────────┬──────────────────────────┘
                          ▼
       ┌─────────────────────────────────────────────┐
       │      Pattern miner (offline, weekly)        │
       │  - cluster decisions, outcomes              │
       │  - aggregate metrics by cohort              │
       │  - apply DP noise                           │
       └──────────────────┬──────────────────────────┘
                          ▼
       ┌─────────────────────────────────────────────┐
       │      wisdom_aggregates (read-only)          │
       │  - cohort, domain, pattern, sample_n, value │
       └──────────────────┬──────────────────────────┘
                          ▼
       ┌─────────────────────────────────────────────┐
       │           WisdomAgent (per-user)            │
       │  reads aggregates only, with cohort filter  │
       └─────────────────────────────────────────────┘
```

## Cohorts

Defined by combination of:
- `role` (founder, CEO, COO, CFO, partner, etc.)
- `stage` (pre-seed, seed, series-A, B, C+, public, mature-private)
- `team_size_bucket` (1-10, 11-50, 51-200, 200+)
- `industry_bucket` (B2B SaaS, fintech, healthtech, consumer, services, deeptech)
- `tenure_bucket` (< 1y, 1-3y, 3-7y, 7y+)

User self-declares cohort attributes. Validates against signals (LinkedIn, calendar pattern).

## Pattern types

| Type | Example |
|---|---|
| `decision_outcome` | "Hires made within 2 interviews tend to fail 30% more" (per cohort) |
| `time_allocation` | "Top performers spend 40% more time on 1:1s in week N" |
| `network_pattern` | "Reaching out to dormant connections weekly correlates with funding success" |
| `email_pattern` | "Reply within 4h to investors increases conversion 25%" |
| `decision_speed` | "Faster decisions in domain X correlate with better outcomes" |
| `meeting_pattern` | "Founders in your cohort run avg 18 1:1s/week, you run 8" |

## Mining pipeline

Runs weekly (Sunday 02:00 UTC).

1. Pull data only for users with `wisdom_opt_in = true`.
2. For each pattern type, run extractor to produce per-user features.
3. Group by cohort.
4. Filter cohorts with n < 50.
5. Compute aggregate (mean, median, p75, etc.).
6. Add DP noise (Laplace, sensitivity computed per metric).
7. Write to `wisdom_aggregates` (versioned by date).
8. Discard intermediate per-user features (no retention).

## Schema

```typescript
wisdom_aggregates {
  id, version_date, cohort_signature(jsonb),
  pattern_type, pattern_key, sample_n,
  metric_name, metric_value, ci_lower, ci_upper,
  noise_added, generated_at
}

wisdom_user_contributions {
  userId, version_date, included(bool), excluded_reason?
}
```

## WisdomAgent API

```typescript
class WisdomAgent {
  async findRelevantPatterns(input: {
    userId: string;
    domain: string;
    contextSignals?: ContextSignal[];
  }): Promise<WisdomInsight[]>
}
```

Every insight returned includes:
- The pattern statement
- Cohort it derives from (with sample size)
- Confidence interval
- Source label (e.g. "based on 142 founders in series-A SaaS")
- Disclaimer that pattern is correlational

## Failure modes

| Failure | Behavior |
|---|---|
| Cohort too small | Return null, do not mention to user |
| User not opted in | WisdomAgent disabled for that user, surface "enable insights in settings" once |
| DP noise overwhelms signal (CI too wide) | Drop pattern, do not surface |
| Outlier user | Tukey filter at extraction step |

## User UI for transparency

Settings page shows:
- Toggle: contribute to wisdom layer
- List of categories user contributes to
- Sample of patterns received from cohort (with sample sizes)
- Last contribution date
- "Withdraw all contributions" button (cascades, runs immediately)

## Compliance

- GDPR: explicit consent, right to withdraw with cascade. Logged.
- CCPA: same.
- EU AI Act: this is "minimal risk" AI per current draft, but document the data flow + DP parameters in `docs/ai-act-compliance.md`.

## Eval

- DP parameter validation on every release (mathematical proof, code review)
- Reconstruction attack red-team test (can we infer any individual user from aggregates?). Quarterly.
- Insight quality survey: are received insights helpful? (target 4/5 with > 60% response rate)

## Phase 0 fallback (early users)

When < 50 opted-in users in any cohort:
- Don't surface cohort insights.
- Use only per-user pattern detection.
- Display "Cohort insights unlocked at <N> peer users" UI.
