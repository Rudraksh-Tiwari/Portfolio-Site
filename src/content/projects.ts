export interface Figure {
  value: string
  label: string
}

export interface ProjectLink {
  label: string
  href: string
}

export interface CaseSection {
  heading: string
  body: string[]
}

export interface Project {
  slug: string
  title: string
  /** Brand-like names that auto-translate would mangle (taskq, Clarifi). */
  brand?: boolean
  status?: 'live' | 'wip'
  /** Short line above the card title: dates, status, team size. */
  meta: string
  subtitle: string
  /** Card description. */
  summary: string
  /** Short card bullets that fill the card rather than leaving it empty. */
  points: string[]
  /** Cover screenshot. Projects without one get `panel` instead. */
  image?: { src: string; alt: string; width: number; height: number; position?: string }
  /** The headline number shown in place of a screenshot. */
  panel?: { value: string; label: string }
  figures: Figure[]
  stack: string[]
  links: ProjectLink[]
  role: string
  timeline: string
  /** Live demo embedded in the case study, after its second section. */
  demo?: 'contention' | 'category' | 'shap'
  caseStudy: CaseSection[]
}

export const projects: Project[] = [
  {
    slug: 'taskq',
    title: 'taskq',
    brand: true,
    meta: '2025-2026',
    subtitle: 'A distributed task queue, built from first principles on Redis',
    summary:
      'A distributed task queue written from scratch on Redis, with no Celery or RQ underneath. Once a job is accepted, it runs to completion even if the worker running it is killed.',
    points: [
      "Atomic job claims in a single Lua script, so a crash can't lose or duplicate a claim",
      'Leases bring back jobs from dead workers, with no failure detector needed',
      'Capped exponential backoff with jitter, then a dead-letter queue with replay',
      '57 tests and the chaos proofs run in GitHub Actions on every push',
    ],
    image: {
      src: '/images/projects/taskq.webp',
      alt: 'The taskq dashboard: scheduled, dead and worker counts above an execution-time histogram',
      width: 1600,
      height: 900,
      position: 'top',
    },
    figures: [
      { value: '600/600', label: 'jobs completed in the chaos test' },
      { value: '57', label: 'tests in CI, against real Redis' },
      { value: '~2,000/s', label: 'jobs processed on a laptop' },
      { value: '3,700+/s', label: 'in a Linux container, 4 workers × 8 threads' },
    ],
    stack: ['Python', 'Redis 7', 'Lua', 'FastAPI', 'Docker', 'Prometheus', 'pytest', 'GitHub Actions'],
    links: [{ label: 'View source', href: 'https://github.com/Rudraksh-Tiwari/reliable-task-queue' }],
    role: 'Solo project',
    timeline: '2025-2026',
    demo: 'contention',
    caseStudy: [
      {
        heading: 'Overview',
        body: [
          'taskq is a background job system. You hand it work, it runs that work on a pool of separate worker processes, and it promises the work will not be lost. It covers atomic claims, leases, crash recovery, retries with capped exponential backoff and jitter, a dead-letter queue, priority lanes, delayed jobs, idempotency keys and worker heartbeats.',
          'The rule I set at the start was that none of the reliability logic could come from a library. rq, Celery and Dramatiq all solve this, and using one of them would have meant writing an API wrapper and learning nothing.',
        ],
      },
      {
        heading: 'The problem',
        body: [
          'A queue is easy until something dies. Pushing a job onto a list and popping it off is a few lines of Redis. The hard part is the window between a worker claiming a job and finishing it. If the process is killed inside that window, a naive queue has already removed the job and nobody comes back for it.',
          'So the real question is not how to queue work, but what happens to work that was in someone’s hands when the lights went out.',
        ],
      },
      {
        heading: 'Architecture',
        body: [
          'Everything lives in Redis 7 under a namespace, driven through redis-py. Each job is a hash holding its payload, attempt count, status and last error. Ready work sits in three lists per queue (high, normal and low), which is what makes priority strict rather than advisory.',
          'Claimed work moves into an in-flight sorted set scored by its lease deadline. Retries and delayed jobs share a scheduled sorted set scored by the time they become due. Exhausted jobs go to a dead list, idempotency slots get their own keys, and each worker writes a TTL presence key so the system knows who is alive.',
          'Three Lua scripts do the work that must not be interleaved. claim.lua pops from the highest non-empty lane, writes the lease and increments the attempt counter as one atomic step. promote.lua moves due jobs back into their lane. release.lua is a compare-and-delete, so an idempotency key can only be cleared by its owner.',
        ],
      },
      {
        heading: 'The hard part',
        body: [
          'Claiming a job is three operations: remove it from the ready lane, record a lease, bump the attempt count. If a worker dies between any two of them, the job is either lost or duplicated. No ordering of separate commands makes that safe, so the claim is a single Lua script, which Redis runs without interleaving any other client.',
          'Crash recovery falls out of the lease. A reaper finds leases whose deadline has passed and moves those jobs back to a ready lane, where another worker picks them up. Nothing has to detect that a process died: a lease that was never renewed is the signal.',
        ],
      },
      {
        heading: 'Bugs I found and fixed',
        body: [
          'A race between replay and discard on the dead-letter queue could silently lose a job: both actions read the job, and whichever wrote second won. I wrote the failing test first, then made the two operations atomic.',
          'I also closed an XSS hole in the dashboard, where job data was being rendered as HTML.',
        ],
      },
      {
        heading: 'Tradeoffs',
        body: [
          'At-least-once, not exactly-once. A job whose worker dies after a side effect but before acknowledgement will run again. The honest design is at-least-once plus idempotency keys, which moves the burden somewhere it can actually be solved.',
          'Priority is three fixed lanes rather than a scored sorted set. Three lists give strict ordering and O(1) pops, at the cost of only ever having three levels. For a job queue, three is enough.',
          'Metrics live in Redis rather than in the worker process. Counters kept in memory would each describe one worker and reset on restart. Counting in Redis costs a few writes per job and gives one number for the whole fleet.',
        ],
      },
      {
        heading: 'Proof',
        body: [
          'A chaos test hard-kills workers in the middle of jobs while the queue drains. 600 of 600 jobs completed and none were lost. It counts duplicates instead of hiding them, because at-least-once delivery means a few jobs run twice.',
          '57 unit, integration and concurrency tests run against a real Redis, including 20 threads racing for one job, concurrent reapers and simultaneous replays. GitHub Actions runs them, along with the crash-recovery and chaos proofs, on every push.',
          'A load harness reports about 2,000 jobs a second on a laptop and 3,700+ a second in a Linux container with 4 workers of 8 threads each. None of it uses a mocked broker: it spawns real processes against a real Redis and kills them.',
        ],
      },
      {
        heading: 'Observability',
        body: [
          'A FastAPI ops dashboard and a hand-written Prometheus /metrics endpoint, backed by fleet-wide counters in Redis and a p95 latency histogram. Dead jobs can be replayed or discarded from the dashboard.',
        ],
      },
      {
        heading: 'What is next',
        body: [
          'Lease renewal, so a job that legitimately runs longer than its lease is not executed twice. The heartbeat keys already exist; nothing reads them for this yet.',
          'Then batch enqueue, since each enqueue is one round trip and the producer is the bottleneck, and Redis replication so a single instance stops being a single point of failure.',
        ],
      },
    ],
  },

  {
    slug: 'clarifi',
    title: 'Clarifi',
    brand: true,
    status: 'live',
    meta: 'Live, 2026',
    subtitle: 'AI financial copilot: full-stack, deployed on AWS',
    summary:
      'A full-stack fintech app on AWS that reads real bank statements, flags unusual spending and answers questions about it.',
    points: [
      'Per-user data isolation with JWT auth, and PostgreSQL schema design and migrations',
      'Parses real Indian bank exports: dynamic headers, debit and credit columns, day-first dates',
      'Rebuilt the anomaly detector: 13 false positives down to 5 explained flags',
    ],
    image: {
      src: '/images/projects/clarifi.webp',
      alt: 'The Clarifi landing page: Your money, finally clear',
      width: 1600,
      height: 900,
    },
    figures: [
      { value: '87%', label: 'of spending collapsed into one UPI bucket before the fix' },
      { value: '13 → 5', label: 'false positives, after replacing the detector' },
    ],
    stack: ['FastAPI', 'PostgreSQL', 'React 19', 'AWS EC2', 'SQLAlchemy', 'ChromaDB', 'sentence-transformers', 'Groq Llama 3.1 8B', 'nginx'],
    links: [
      { label: 'Visit clarifi.page', href: 'https://clarifi.page' },
      { label: 'Source', href: 'https://github.com/Rudraksh-Tiwari' },
    ],
    role: 'Solo project',
    timeline: '2026, live',
    demo: 'category',
    caseStudy: [
      {
        heading: 'Overview',
        body: [
          'Clarifi takes a bank statement and turns it into something you can reason about. It parses the file, categorises every transaction, flags the ones worth a second look, projects next month, and answers questions in plain English using only that user’s own history.',
          'Full stack: FastAPI and SQLAlchemy behind a React 19 front end, PostgreSQL for structured data, ChromaDB for per-user retrieval, JWT auth. It runs on a single t3.micro in Mumbai: gunicorn under systemd, nginx serving the build and proxying the API, TLS from certbot.',
        ],
      },
      {
        heading: 'The problem',
        body: [
          'A bank statement is a list of strings and numbers. Everything useful about it (what you spend on, what changed, what looks wrong) needs structure the file does not contain. The work is turning unlabelled merchant text into categories reliable enough to build on, and then not lying about what those numbers mean.',
        ],
      },
      {
        heading: 'Architecture',
        body: [
          'Uploads go through a parsing pipeline that normalises the statement into transactions, stored in PostgreSQL against the authenticated user. I own the schema and its migrations. Real exports do not agree on a format, so header detection is hand-rolled, pdfplumber handles text-based PDFs, debit and credit are read as separate columns rather than inferring sign, and dates are parsed day-first, so 03/04 is never read as the wrong month.',
          'Categorisation and anomaly detection run in scikit-learn and pandas. Each user gets an isolated vector collection in ChromaDB, embedded locally with all-MiniLM-L6-v2 and built only from their own transactions, so a question is answered from retrieved context rather than from the model’s memory.',
          'The LLM sits at the very edge of the system. It phrases answers and explanations; it does not decide categories, compute anomalies or produce the forecast. Anything a user could act on is computed in code.',
        ],
      },
      {
        heading: 'The hard part',
        body: [
          'The categoriser worked on a clean sample CSV and fell apart on a real Indian bank export. Almost every line contains UPI, because UPI is the payment rail, not the merchant. Treating it as a keyword put roughly 87% of spending into one bucket. The fix was separating merchant identity from payment mechanism, so the rail is stripped before anything reads meaning from what is left.',
          'The anomaly detector failed for a related reason. An Isolation Forest with a forced contamination parameter must flag a fixed share of transactions whether or not anything is unusual, so an ordinary month still produced alarms.',
          'Replacing it with log-scaled per-category robust z-scores, using median and MAD instead of mean and standard deviation, took the same statement from 13 false positives to 5 flags, each with a plain-language reason. It also lets an ordinary month return nothing at all.',
        ],
      },
      {
        heading: 'Tradeoffs',
        body: [
          'Median and MAD over mean and standard deviation, because the outliers are the thing being detected and they drag a mean toward themselves.',
          'Per-category baselines rather than one global threshold: a ₹4,000 grocery bill and a ₹4,000 transfer are not equally surprising.',
          'Embeddings run locally rather than through an API, so every transaction is embedded without leaving the box or costing anything per call. Only the final generation step goes out to Groq.',
        ],
      },
      {
        heading: 'What is next',
        body: [
          'The categoriser is still keyword-driven at its core, so it degrades on merchants it has never seen; embedding similarity over a merchant vocabulary would generalise better. The forecast is a linear fit and should show its uncertainty rather than printing one confident number.',
        ],
      },
    ],
  },

  {
    slug: 'diabetes-detection',
    title: 'Early Diabetes Detection',
    status: 'wip',
    meta: '2026-2027, in progress, team of 4',
    subtitle: 'Non-invasive diabetes risk screening, served as an explainable API',
    summary:
      'Estimates diabetes risk from a 22-question survey and a tape measure, with no blood test. I built the models and the training pipeline.',
    points: [
      'Five classifiers compared; Logistic Regression picked on recall, not accuracy',
      'Threshold tuned to 0.44, catching 70% of cases on the hold-out split',
      'Served by FastAPI with a p95 of 40 ms per prediction, SHAP included',
      'Results so far are on synthetic data built on the NFHS-5 schema',
    ],
    image: {
      src: '/images/projects/diabetes.webp',
      alt: 'Diagram: synthetic dataset feeding the training pipeline (5 classifiers, stratified 5-fold CV, recall-based selection, threshold 0.44)',
      width: 1600,
      height: 540,
    },
    figures: [
      { value: '0.70', label: 'recall on the hold-out split at threshold 0.44' },
      { value: '40 ms', label: 'p95 per prediction, including SHAP' },
      { value: '100,000', label: 'synthetic records on the NFHS-5 schema' },
      { value: '5', label: 'classifiers compared under 5-fold CV' },
    ],
    stack: ['Python', 'scikit-learn', 'XGBoost', 'SHAP', 'pandas', 'FastAPI', 'Pydantic v2', 'joblib'],
    links: [{ label: 'View source', href: 'https://github.com/Rudraksh-Tiwari-787/nmit-22csp69-22-diabetes-detection-ml' }],
    role: 'Team of 4. I built the ML models and the training pipeline.',
    timeline: '2026-2027, major project',
    caseStudy: [
      {
        heading: 'Overview',
        body: [
          'Our final-year major project at NMIT, done as a team of four under a faculty guide. It estimates a person’s diabetes risk from attributes they can provide themselves: a short questionnaire and a few tape-measure readings. The estimate is served through a FastAPI service that validates the input, assigns a risk band and explains every prediction.',
          'My part was the machine learning: the training pipeline, the model comparison, model selection and threshold tuning.',
        ],
      },
      {
        heading: 'The problem',
        body: [
          'Many published diabetes models take plasma glucose and serum insulin as inputs. Our first prototype did too. But a person who already has a glucose test result has effectively been diagnosed, so a model that needs it cannot screen anyone. The PIMA dataset it was trained on also covers women only.',
          'So the rebuild removed every laboratory input. The model now uses 24 attributes: 22 a respondent supplies (age, activity, diet, sleep, family history and so on) plus BMI and waist-hip ratio, which the server derives from height, weight, waist and hip.',
        ],
      },
      {
        heading: 'Architecture',
        body: [
          'Training and serving are separate. An offline pipeline (train.py) reads the dataset, compares five classifiers under stratified five-fold cross-validation, picks the operating model and threshold, refits on the full data and writes the artifacts. The service loads them once at start-up; the first prototype retrained on every start-up, which does not scale.',
          'At start-up the service also checks that the categories the API accepts match the ones the trained encoder saw, and refuses to start on any mismatch. Without that check, a renamed category would be encoded as an all-zero row and produce a wrong prediction with no error.',
        ],
      },
      {
        heading: 'The hard part',
        body: [
          'Choosing the model on the right number. Random Forest had the best accuracy (0.797) but the worst recall (0.41): with only 11.46% of records positive, a model can score well on accuracy by predicting “not diabetic” more often. In screening, a missed case costs far more than a false alarm, so the model is selected on recall.',
          'Logistic Regression won, with the highest cross-validated recall (0.59) and a shared-best ROC-AUC of 0.686. The decision threshold was then tuned to 0.44, the highest F1 that keeps recall at or above 0.70 on a 20% stratified hold-out split.',
        ],
      },
      {
        heading: 'Tradeoffs',
        body: [
          'Class weighting instead of SMOTE oversampling, because oversampling changes the training distribution and the calibration of the predicted probabilities.',
          'A linear SVM rather than a kernel SVM: a kernel SVM is not tractable at 100,000 records.',
          'Rule-based advice text instead of an LLM health advisor. It is less flexible, but deterministic and verifiable.',
        ],
      },
      {
        heading: 'Proof',
        body: [
          '30 of 30 executed functional test cases passed, covering validation boundaries, derived features, the threshold rule, risk bands, SHAP output and batches of up to 500 patients.',
          'Under load the service answered single predictions with a p95 of 40 ms including the SHAP explanation, served 400 requests from 20 concurrent clients with no failures, and peaked at 268 MB of memory. Retraining with the fixed seed reproduces the stored metrics exactly.',
          'All of these results are on a 100,000-record synthetic dataset generated on the NFHS-5 survey schema, because access to the real NFHS-5 data is still pending. They describe the generated cohort, not the population.',
        ],
      },
      {
        heading: 'What is next',
        body: [
          'Retraining and re-measuring on real NFHS-5 data once access comes through, a benchmark against the Indian Diabetes Risk Score, then a web form, authentication and deployment beyond the development machine.',
        ],
      },
    ],
  },

  {
    slug: 'credit-risk-engine',
    title: 'Credit Risk Decisioning Engine',
    meta: '2024',
    subtitle: 'Credit risk scoring with explainable ML',
    summary: 'Loan approval scoring with XGBoost, and SHAP to explain each approval or rejection.',
    points: ['Class-imbalance correction in training', 'A SHAP explanation for every decision', 'Streamlit front end'],
    panel: { value: '0.978', label: 'AUC-ROC on 45,000+ loan records' },
    figures: [{ value: '~0.978', label: 'AUC-ROC, against 0.953 and 0.974 for the alternatives' }],
    stack: ['XGBoost', 'SHAP', 'Python', 'Streamlit', 'Groq Llama 3.3 70B'],
    links: [{ label: 'View source', href: 'https://github.com/Rudraksh-Tiwari/loan-risk-analyzer' }],
    role: 'Solo project',
    timeline: '2024',
    demo: 'shap',
    caseStudy: [
      {
        heading: 'Overview',
        body: [
          'An end-to-end credit risk scoring system over 45,000+ loan records that predicts approval and, more importantly, explains itself. SHAP attributes each prediction to specific applicant features, and an LLM turns that attribution into the sentence a customer would actually be given.',
        ],
      },
      {
        heading: 'The problem',
        body: [
          'A model that outputs “declined” and nothing else is not usable for lending. The applicant is owed a reason, and the reason has to match what the model actually did rather than a plausible story written afterwards.',
        ],
      },
      {
        heading: 'Model selection',
        body: [
          'Logistic regression, random forest and XGBoost were compared on the same split. XGBoost won on AUC-ROC at about 0.978 against 0.953 and 0.974, but the deciding number was minority-class F1. The classes are imbalanced and the two errors are not equally expensive: approving a loan that defaults costs far more than declining one that would have been repaid.',
          'The imbalance is corrected with scale_pos_weight rather than by resampling, so the training distribution is left alone and the cost asymmetry is expressed in the loss.',
        ],
      },
      {
        heading: 'Explainability',
        body: [
          'SHAP gives per-prediction attribution (how much each feature pushed this particular applicant toward or away from approval) rather than one global ranking of feature importance. The LLM layer reads that attribution and writes it as prose. It phrases the reason; it does not invent it.',
          'The output is three tiers rather than a yes or no: below 0.3 is approved, below 0.7 is flagged for human review, and above that is rejected. Forcing a binary decision on a borderline applicant throws away the most useful thing the model knows, which is that it is not sure.',
        ],
      },
      {
        heading: 'What is next',
        body: [
          'Serialising the trained model instead of retraining on every cold start, so the deployed app wakes faster and every run is identical.',
        ],
      },
    ],
  },

  {
    slug: 'seatlock',
    title: 'SeatLock',
    brand: true,
    status: 'wip',
    meta: 'In progress',
    subtitle: 'Concurrency-safe ticket booking',
    summary: 'Ticket booking that can never sell the same seat twice. The locking layer is designed and being built.',
    points: [
      'Redis hold with a TTL for live seat status',
      'Postgres row lock at checkout',
      'Idempotency key so a double-click books once',
    ],
    panel: { value: '1 seat', label: 'two buyers, exactly one wins' },
    figures: [],
    stack: ['Spring Boot 3', 'Redis', 'PostgreSQL', 'STOMP WebSockets', 'React', 'TypeScript'],
    links: [{ label: 'Source', href: 'https://github.com/Rudraksh-Tiwari' }],
    role: 'Solo project',
    timeline: 'July 2026, in progress',
    caseStudy: [
      {
        heading: 'Overview',
        body: [
          'An event ticketing system built around one requirement: when two people click the same seat at the same instant, exactly one of them gets it. The seat map and booking flow exist to make that visible; the concurrency control is the actual product.',
          'It is deliberately Spring Boot rather than FastAPI. Java and Spring dominate campus hiring in India, and I did not want a stack on my résumé that no project of mine demonstrated.',
        ],
      },
      {
        heading: 'The problem',
        body: [
          'Two requests read the same seat as available, both see a free row, and both write a booking. Nothing in ordinary request handling prevents this: the check and the write are separate operations, and any number of requests can slip between them.',
        ],
      },
      {
        heading: 'The intended design',
        body: [
          'Two layers doing different jobs. A Redis hold with a TTL is the optimistic layer: fast, self-expiring if the user wanders off, and it lets every other viewer see the seat grey out immediately over a WebSocket. What it cannot do is survive a crash.',
          'The guarantee is a Postgres SELECT … FOR UPDATE row lock inside the checkout transaction. Racing requests serialise on the row: the first takes the lock, books and commits; the second blocks, then reads the committed state and loses cleanly. An idempotency key on checkout means a double-clicked Pay button produces one booking.',
        ],
      },
      {
        heading: 'What exists today',
        body: [
          'The Event and Seat model, the repositories, read endpoints for events and their seats, and an idempotent seeder that creates one event with fifty seats. Postgres runs from Docker Compose.',
          'The Redis hold, the row lock, the idempotency key and the concurrency test are not written yet. Until they are, there is no number to put on this page.',
        ],
      },
      {
        heading: 'One bug already paid for',
        body: [
          'The app would not boot: Postgres rejected the connection over an invalid TimeZone parameter. The JDBC driver sends the JVM default timezone on connect, and on this machine that resolves to the legacy alias Asia/Calcutta, which Postgres 16 does not accept. Pinning the JVM to UTC fixed it.',
        ],
      },
      {
        heading: 'What is next',
        body: [
          'JWT auth with attendee and organiser roles, then the locking core, then the proof: a test that fires many simultaneous requests at one seat and asserts exactly one booking exists.',
        ],
      },
    ],
  },
]

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug)

/** Old /work/<slug> links used these slugs. */
export const legacySlugs: Record<string, string> = {
  'loan-risk-analyzer': 'credit-risk-engine',
}
