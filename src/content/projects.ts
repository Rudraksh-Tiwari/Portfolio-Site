export type Tone = 'signal' | 'won' | 'fail'

export interface Figure {
  value: string
  label: string
  tone: Tone
}

export interface ProjectLink {
  label: string
  href: string
  primary?: boolean
}

export interface CaseSection {
  heading: string
  body: string[]
}

export interface Project {
  id: string
  slug: string
  index: string
  title: string
  status?: 'live' | 'wip'
  subtitle: string
  /** Short blurb for the post card. */
  body: string
  /** The paragraphs that name what actually broke. This is the whole pitch. */
  hardParts: string[]
  /** Where the build actually stands. Only set when it is not yet finished. */
  note?: string
  /** Live demo to render. Omitted where the code does not yet back the claim. */
  demo?: 'contention' | 'category' | 'shap'
  figures: Figure[]
  stack: string[]
  links: ProjectLink[]
  timeline?: string
  /** The long-form deep dive shown at /work/<slug>. */
  caseStudy: CaseSection[]
}

export const projects: Project[] = [
  {
    id: 'taskq',
    slug: 'taskq',
    index: '01',
    title: 'taskq',
    status: 'wip',
    demo: 'contention',
    subtitle: 'A distributed task queue, built from first principles',
    body:
      'A background job system in the spirit of Sidekiq and Celery, with the reliability machinery written by hand rather than delegated to a library: atomic job claim, crash recovery, retries with backoff, and a dead-letter queue.',
    hardParts: [
      "Anyone can call an existing library's enqueue(). The harder thing is building the guarantee underneath it — that once a job is accepted it runs to completion even if the worker is killed mid-execution. That guarantee is the whole project.",
    ],
    figures: [
      { value: '0', label: 'jobs lost when a worker is killed mid-execution', tone: 'won' },
      { value: '45 / 45', label: 'jobs executed exactly once under 12 concurrent claimants', tone: 'won' },
      { value: '6.0×', label: 'throughput at concurrency 8 against 1, on the same batch', tone: 'won' },
    ],
    stack: ['Python 3.14', 'Redis 7', 'Lua', 'redis-py', 'ThreadPoolExecutor', 'Docker Compose'],
    links: [{ label: 'Source', href: 'https://github.com/Rudraksh-Tiwari/reliable-task-queue' }],
    timeline: 'June 2026 — ongoing',
    caseStudy: [
      {
        heading: 'Overview',
        body: [
          'taskq is a background job system: you hand it work, it runs that work on a pool of separate worker processes, and it promises the work will not be lost. It covers atomic claim, leases, crash recovery, retries with exponential backoff and jitter, a dead-letter queue, priority lanes, delayed jobs, idempotency keys and worker heartbeats.',
          'The rule I set at the start was that none of the reliability logic could come from a library. rq, Celery and Dramatiq all solve this, and using one of them would have meant writing an API wrapper and learning nothing. Every guarantee here is mine to explain.',
        ],
      },
      {
        heading: 'The problem',
        body: [
          'A queue is easy until something dies. Pushing a job onto a list and popping it off is a few lines of Redis. The difficulty is the window between a worker claiming a job and finishing it — if the process is killed inside that window, a naive queue has already removed the job and nobody is coming back for it.',
          'So the real question is not "how do I queue work" but "what happens to work that was in someone’s hands when the lights went out".',
        ],
      },
      {
        heading: 'Architecture',
        body: [
          'Everything lives in Redis 7 under a namespace, driven through redis-py. Each job is a hash holding its payload, attempt count, status and last error. Ready work sits in three lists per queue — high, normal and low — which is what makes priority strict rather than advisory.',
          'Claimed work moves into an in-flight sorted set scored by its lease deadline. Retries and delayed jobs share a scheduled sorted set scored by the time they become due. Exhausted jobs go to a dead list, idempotency slots get their own keys, and each worker writes a TTL presence key so the system knows who is alive.',
          'Three Lua scripts do the work that must not be interleaved. claim.lua pops from the highest non-empty lane, writes the lease and increments the attempt counter as one atomic step. promote.lua moves due jobs from the scheduled set back into their lane, and is shared by both the reaper and the retry scheduler. release.lua is a compare-and-delete, so an idempotency key can only be cleared by its owner.',
        ],
      },
      {
        heading: 'The hard part',
        body: [
          'Claiming a job is three operations — remove it from the ready lane, record a lease, bump the attempt count — and if a worker dies between any two of them the job is either lost or duplicated. Doing it in application code cannot be made safe no matter how the statements are ordered. It has to be one atomic step, which is why it is a Lua script: Redis runs the whole script without interleaving another client.',
          'Crash recovery then falls out of the lease. A claimed job carries a deadline in the in-flight set. A reaper thread on each worker scans for deadlines that have passed and promotes those jobs back to a ready lane, where another worker picks them up. Nothing needs to detect that a process died; the absence of a renewed lease is the signal.',
          'The same reasoning drives idempotency. A SET-NX with a TTL reserves the key, and release.lua only deletes it if the value still matches the job that took it — so a slow duplicate cannot clear a slot it does not own.',
        ],
      },
      {
        heading: 'Tradeoffs',
        body: [
          'At-least-once, not exactly-once. A job whose worker dies after a side effect but before acknowledgement will run again. Exactly-once delivery is not achievable here, so the honest design is at-least-once plus idempotency keys, which moves the burden somewhere it can actually be solved.',
          'Priority is three fixed lanes rather than a scored sorted set. A sorted set gives arbitrary priorities and O(log n) pops; three lists give strict ordering and O(1) pops, at the cost of only ever having three levels. For a job queue, three is enough.',
          'Leases are time-based, so a worker that hangs rather than dies still holds its job until the deadline passes. Heartbeats could shorten that window — the keys exist, but the reaper does not use them yet.',
          'Concurrency inside a worker is a ThreadPoolExecutor rather than processes. The jobs this is built for are I/O-bound, where threads are cheaper and the GIL is not the constraint — which is what the 6× measurement is showing.',
        ],
      },
      {
        heading: 'Proof',
        body: [
          'Two verification scripts run the guarantees rather than describing them. Stage 2 hard-kills a worker mid-job and asserts the job still completes on another worker, then exhausts a failing job and asserts it lands in the dead-letter queue with its attempt count and original error intact.',
          'Stage 3 runs 45 jobs against three worker processes of four threads each and asserts every job executed exactly once, then checks throughput scaling, strict priority ordering, delayed delivery and idempotency suppression. Both scripts pass on the current build.',
          'These are not unit tests with a mocked broker. They spawn real OS processes against a real Redis and kill them, because the guarantee only means anything if the thing being killed is an actual process.',
        ],
      },
      {
        heading: 'What is next',
        body: [
          'Observability: metrics counters, and a FastAPI dashboard showing queue depths, in-flight work and a dead-letter view with a replay button. Possibly Prometheus-style metrics. After that, load and chaos testing with published benchmarks, then CI.',
        ],
      },
    ],
  },

  {
    id: 'clarifi',
    slug: 'clarifi',
    index: '02',
    title: 'Clarifi',
    status: 'live',
    demo: 'category',
    subtitle: 'AI financial copilot — full-stack, deployed on AWS',
    body:
      "Turns a raw bank statement into structured financial insight: parses the file, categorises every transaction, flags anomalies, forecasts next month, and answers natural-language questions grounded in the user's own history through a per-user vector index.",
    hardParts: [
      'Testing against a real Indian bank export rather than a clean sample CSV broke the categoriser immediately: because nearly every line in an Indian statement contains UPI, treating the payment rail as a category keyword collapsed roughly 87% of spending into one bucket.',
    ],
    figures: [
      { value: '87%', label: 'of spending collapsed into a single UPI bucket', tone: 'fail' },
      { value: '13 → 5', label: 'false positives, after replacing the detector', tone: 'won' },
    ],
    stack: ['FastAPI', 'SQLAlchemy', 'PostgreSQL', 'ChromaDB', 'sentence-transformers', 'Groq Llama 3.1 8B', 'React 19', 'Zustand', 'nginx', 'AWS EC2'],
    links: [
      { label: 'clarifi.page', href: 'https://clarifi.page', primary: true },
      { label: 'Source', href: 'https://github.com/Rudraksh-Tiwari' },
    ],
    caseStudy: [
      {
        heading: 'Overview',
        body: [
          'Clarifi takes a bank statement and turns it into something you can reason about. It parses the file, categorises every transaction, flags the ones worth a second look, projects next month, and answers questions in plain English using only that user’s own history.',
          'Full stack: FastAPI and SQLAlchemy behind a React 19 front end, PostgreSQL for structured data, ChromaDB for per-user retrieval, JWT auth. It runs on a single t3.micro in Mumbai — gunicorn under systemd, nginx serving the build and proxying the API, TLS from certbot, on an elastic IP.',
        ],
      },
      {
        heading: 'The problem',
        body: [
          'A bank statement is a list of strings and numbers. Everything useful about it — what you spend on, what changed, what looks wrong — requires structure the file does not contain. The work is turning unlabelled merchant text into categories reliable enough to build on, and then not lying about what those numbers mean.',
        ],
      },
      {
        heading: 'Architecture',
        body: [
          'Upload goes through a parsing pipeline that normalises the statement into transactions, stored in PostgreSQL against the authenticated user. Real exports do not agree on a format, so header detection is hand-rolled over the csv module, pdfplumber handles text-based PDFs, debit and credit are read as a separate direction column rather than inferring sign, and dates are parsed day-first through python-dateutil — which is the difference between working on an Indian statement and silently reading 03/04 as the wrong month.',
          'Categorisation and anomaly detection run over those rows in scikit-learn and pandas. Each user gets an isolated vector collection in ChromaDB, embedded locally with all-MiniLM-L6-v2 and built only from their own transactions, so a question is answered from retrieved context rather than from the model’s memory. JWT auth enforces that isolation at the boundary.',
          'The LLM sits at the very edge of the system. It phrases answers and explanations; it does not decide categories, compute anomalies or produce the forecast. Anything a user could act on is computed in code and can be reproduced without a model call.',
        ],
      },
      {
        heading: 'The hard part',
        body: [
          'The categoriser worked fine on a clean sample CSV and fell apart on a real Indian bank export. Almost every line in one contains the string UPI, because UPI is the payment rail, not the merchant. Treating it as a category keyword put roughly 87% of spending into a single bucket — technically a working classifier, and completely useless. The fix was separating merchant identity from payment mechanism, so the rail is stripped before anything tries to read meaning from what is left.',
          'The anomaly detector failed for a related reason: it was answering a question nobody asked. An Isolation Forest with a forced contamination parameter must flag a fixed share of transactions whether or not anything is unusual — on a perfectly ordinary month it will still produce alarms, because that is what it was told to do.',
          'Replacing it with log-scaled per-category robust z-scores, using median and MAD rather than mean and standard deviation, took the same statement from 13 false positives to 5 flags, each carrying a plain-language reason. It also let an ordinary month legitimately return nothing at all, which the previous design could not express.',
        ],
      },
      {
        heading: 'Tradeoffs',
        body: [
          'Median and MAD over mean and standard deviation, because the outliers are the thing being detected and they drag a mean toward themselves — the statistic gets corrupted by exactly the values it is meant to find.',
          'Per-category baselines rather than one global threshold: a ₹4,000 grocery bill and a ₹4,000 transfer are not equally surprising, and a single threshold cannot tell them apart.',
          'Retrieval over fine-tuning. A per-user vector index means answers are grounded in that user’s data and change the moment the data changes, with no retraining.',
          'Embeddings run locally rather than through an API. all-MiniLM-L6-v2 is small enough to sit on a t3.micro, and it means every transaction a user uploads is embedded without leaving the box or costing anything per call. Only the final generation step goes out to Groq.',
        ],
      },
      {
        heading: 'What is next',
        body: [
          'The categoriser is still keyword-driven at its core, so it degrades on merchants it has never seen; embedding similarity over a merchant vocabulary would generalise better. The forecast is a linear fit and deserves to be honest about its own uncertainty rather than printing a single confident number.',
        ],
      },
    ],
  },

  {
    id: 'loan-risk',
    slug: 'loan-risk-analyzer',
    index: '03',
    title: 'Loan Risk Analyzer',
    demo: 'shap',
    subtitle: 'Credit decisioning with explainable ML',
    body:
      "Predicts loan approval across a 45,000-applicant dataset and explains each decision in plain English. SHAP attributes the model's reasoning to specific applicant features; an LLM turns that attribution into the sentence a customer would actually be told.",
    hardParts: [
      'XGBoost was selected over logistic regression and random forest on AUC-ROC (0.978 against 0.953 and 0.974) and on minority-class F1 — the class that matters, since approving a bad loan costs more than declining a good one.',
    ],
    figures: [
      { value: '0.978', label: 'AUC-ROC, against 0.953 and 0.974 for the alternatives', tone: 'won' },
    ],
    stack: ['Python', 'XGBoost', 'SHAP', 'Groq Llama 3.3 70B', 'Streamlit'],
    links: [{ label: 'Source', href: 'https://github.com/Rudraksh-Tiwari/loan-risk-analyzer' }],
    timeline: '2024',
    caseStudy: [
      {
        heading: 'Overview',
        body: [
          'A credit model over roughly 45,000 applicants that predicts approval and, more importantly, explains itself. SHAP attributes each prediction to specific applicant features, and an LLM turns that attribution into the sentence a customer would actually be given.',
        ],
      },
      {
        heading: 'The problem',
        body: [
          'A model that outputs "declined" and nothing else is not usable for lending. The applicant is owed a reason, and the reason has to correspond to what the model actually did rather than to a plausible-sounding story written afterwards.',
        ],
      },
      {
        heading: 'Model selection',
        body: [
          'Logistic regression, random forest and XGBoost were compared on the same split of roughly 45,000 records. XGBoost won on AUC-ROC at 0.978 against 0.953 and 0.974, but the deciding number was minority-class F1. The classes are imbalanced and the two errors are not equally expensive: approving a loan that defaults costs far more than declining one that would have been repaid. A model can look strong on accuracy while being weak on precisely the class that carries the cost.',
          'The imbalance is corrected with scale_pos_weight rather than by resampling, so the training distribution is left alone and the cost asymmetry is expressed where it belongs — in the loss.',
        ],
      },
      {
        heading: 'Explainability',
        body: [
          'SHAP gives per-prediction attribution — how much each feature pushed this particular applicant toward or away from approval — rather than a single global ranking of feature importance. The LLM layer reads that attribution and writes it as prose. It is deliberately downstream of the explanation: it phrases the reason, it does not invent it.',
          'The output is three tiers rather than a yes or no. Below 0.3 is approved, below 0.7 is flagged for human review, and above that is rejected. Forcing a binary decision on a borderline applicant throws away the most useful thing the model knows, which is that it is not sure.',
        ],
      },
      {
        heading: 'Known issues',
        body: [
          'Three things in this project are wrong and not yet fixed, which I would rather state than have someone find.',
          'One feature records prior defaults in a way that leaks the outcome, which inflates every metric on this page — the honest AUC is lower than 0.978 and I do not yet know by how much. Gender is currently used as a model feature, which for a credit decision is indefensible regardless of what it does to the score. And the SHAP values are surfaced as if they were probabilities when they are log-odds contributions, so the magnitudes shown are mislabelled.',
        ],
      },
      {
        heading: 'What is next',
        body: [
          'Remove the leaking feature and re-measure honestly, drop gender, and correct the SHAP scale. The model is also retrained on every cold start rather than being serialised, which makes the deployed app slow to wake and means no two runs are guaranteed identical.',
        ],
      },
    ],
  },

  {
    id: 'seatlock',
    slug: 'seatlock',
    index: '04',
    title: 'SeatLock',
    status: 'wip',
    subtitle: 'Concurrency-safe ticket booking',
    body:
      'One hard problem: two people click the same seat in the same millisecond — exactly one gets it, and nobody is ever double-booked. Everything else in the system exists to serve that sentence.',
    hardParts: [
      'The design is two layers of defence. A Redis hold with a TTL is fast and optimistic — it greys the seat out live for everyone, but cannot survive a crash on its own. The real guarantee is meant to be a Postgres SELECT … FOR UPDATE row lock at checkout, so two racing payments cannot both win, with an idempotency key so a double-clicked "Pay" never books twice.',
    ],
    note: 'Built so far: the event and seat model, the read endpoints and a seeder. The locking layer is designed but not yet written, so there is no measured result to quote here yet.',
    figures: [],
    stack: ['Spring Boot 3', 'PostgreSQL', 'Redis', 'STOMP WebSockets', 'React', 'TypeScript'],
    links: [{ label: 'Source', href: 'https://github.com/Rudraksh-Tiwari' }],
    timeline: 'July 2026 — in progress',
    caseStudy: [
      {
        heading: 'Overview',
        body: [
          'An event ticketing system built around a single requirement: when two people click the same seat at the same instant, exactly one of them gets it. The seat map and the booking flow exist to make that requirement visible; the concurrency control is the actual product.',
          'It is deliberately Spring Boot rather than FastAPI. Java and Spring dominate campus hiring in India, and I did not want a stack on my résumé that no project of mine demonstrated.',
        ],
      },
      {
        heading: 'The problem',
        body: [
          'Two requests read the same seat as available, both see a free row, and both write a booking. Nothing in ordinary request handling prevents this — the check and the write are separate operations, and any number of requests can slip between them. Every seat map that has ever sold the same seat twice has this shape.',
        ],
      },
      {
        heading: 'The intended design',
        body: [
          'Two layers, doing different jobs. A Redis hold with a TTL is the optimistic layer: fast, self-expiring if the user wanders off, and it lets every other viewer see the seat grey out immediately over a WebSocket. What it cannot do is survive a crash, because a hold that vanishes with the process is not a guarantee.',
          'The guarantee is a Postgres SELECT … FOR UPDATE row lock taken inside the checkout transaction. Racing requests serialise on the row: the first takes the lock, books and commits; the second blocks, then reads the committed state and loses cleanly. On top of that, an idempotency key on checkout, so a double-clicked Pay button produces one booking rather than two.',
          'Payment is faked — a sleep and a success response. A real gateway would add an integration to maintain and would not make the locking argument any stronger.',
        ],
      },
      {
        heading: 'What exists today',
        body: [
          'The Event and Seat model with a status enum, the two repositories, read endpoints for events and their seats, and an idempotent seeder that creates one event with fifty seats without duplicating on restart. Postgres runs from Docker Compose.',
          'The Redis hold, the row lock, the idempotency key and the concurrency test are not written yet. Until they are, there is no number to put on this page — which is why there is not one.',
        ],
      },
      {
        heading: 'One bug already paid for',
        body: [
          'The application would not boot, with Postgres rejecting the connection over an invalid TimeZone parameter. The cause: the JDBC driver sends the JVM default timezone on connect, and on this machine that resolves to the legacy alias Asia/Calcutta, which Postgres 16 does not accept.',
          'Fixed by pinning the JVM to UTC at startup and setting Hibernate’s JDBC timezone to match. Worth recording because it is the kind of failure that looks like a database problem and is actually a locale problem.',
        ],
      },
      {
        heading: 'What is next',
        body: [
          'JWT auth with attendee and organiser roles, then the locking core, then the proof: a test that fires a large number of simultaneous requests at a single seat and asserts exactly one booking exists. That test is the point of the project, and the number it produces is the only number that belongs on this page.',
        ],
      },
    ],
  },
]

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug)
