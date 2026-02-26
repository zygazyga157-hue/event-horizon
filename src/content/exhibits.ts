/**
 * Exhibit data for the Atrium gallery
 * Populated via Atrium Ingest Pack markdown files
 */
import { Exhibit } from "@/domain/gallery";

export const exhibits: Exhibit[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // EXH-01: Systems Engineering
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: "systems-engineering",
    code: "EXH-01",
    version: "v1.1",
    updatedAt: "2026-01-24",
    title: "Systems Engineering",
    thesis:
      "Building robust, observable systems that scale gracefully under load — from real-time session management to capacity-limited architectures.",
    status: "Shipped",
    tags: [
      "Architecture",
      "Distributed Systems",
      "Real-time",
      "Next.js",
      "TypeScript",
      "WebSocket",
      "Prisma",
      "State Machines",
    ],
    metaLine: "EXH-01 / v1.1 / Updated 2026-01-24",
    placard: {
      what: "Design and implementation of production-grade systems with emphasis on reliability, real-time behavior, and elegant degradation under load.",
      why: "Complex systems fail in complex ways. Building with resilience patterns — capacity limits, heartbeat monitoring, FIFO queues, and sealed authentication — transforms reactive firefighting into proactive engineering.",
      approach:
        "State machine architecture for predictable behavior. Edge-compatible sealed tokens (iron-session). Real-time WebSocket promotion. Capacity-limited access with graceful queuing. Museum-inspired monochrome design language with physics-based motion.",
    },
    roadmap: {
      items: [
        { label: "Core infrastructure baseline", done: true },
        { label: "Gate system with capacity management", done: true },
        { label: "Real-time heartbeat & session lifecycle", done: true },
        { label: "FIFO queue with WebSocket promotion", done: true },
        { label: "157 Triad esoteric messaging system", done: true },
        { label: "Atrium gallery with filtering", done: true },
        { label: "Exhibit pages with artifact cards", done: true },
        { label: "Audio player with wavesurfer.js", done: true },
        { label: "Multi-region deployment", done: false },
        { label: "Chaos engineering integration", done: false },
      ],
    },
    // Single auction for entire Systems Engineering program ($19,500 total valuation)
    auction: {
      auctionKind: "ACQUIREMENT",
      status: "LIVE",
      currency: "USD",
      openingBid: "15000",
      minIncrement: "500",
      endsAt: "2026-03-15T18:00:00Z",
      antiSnipingSeconds: 300,
      allowedBidTypes: ["FIXED_PRICE", "HOURLY_RATE", "RETAINER", "EQUITY_OFFER"],
    },
    artifacts: [
      {
        id: "event-horizon-gallery",
        name: "Event Horizon Gallery",
        status: "Shipped",
        description:
          "A museum-style portfolio system with capacity-limited access (200 concurrent visitors), real-time FIFO queue management, sealed token authentication, and monochrome design language. Built on Next.js 16 with React 19, Prisma ORM, and WebSocket infrastructure. Features include: Gate sign-in ritual with live occupancy, heartbeat-based session lifecycle, automatic queue promotion, and the 157 Triad esoteric messaging system.",
        stack: [
          "Next.js 16",
          "React 19",
          "TypeScript",
          "Tailwind CSS v4",
          "Prisma v6",
          "SQLite",
          "WebSocket",
          "Framer Motion",
          "iron-session",
          "Zod",
        ],
        proof: {
          results: [
            "Real-time capacity management for 200 concurrent visitors",
            "FIFO queue with WebSocket promotion notifications",
            "Edge-compatible authentication with sealed tokens (@hapi/iron)",
            "Heartbeat system with 30s intervals, 90s expiry window",
            "State machine: ACTIVE → QUEUED → EXPIRED → EXITED",
            "Museum-inspired UI with MeasureFrame motif and calibration animations",
            "5 exhibits, 11 artifacts, 20 static pages generated",
          ],
          links: [{ label: "Live Site", href: "https://zyga.dev" }],
        },
        costs: {
          monthly: "$0–$20",
          oneTime: "$12,000 (Valuation)",
        },
        funding: {
          needed: "$3,500",
          milestone: "Multi-region deployment & CDN optimization",
          breakdown: [
            { label: "Infrastructure", pct: "40%" },
            { label: "Performance Optimization", pct: "35%" },
            { label: "Documentation", pct: "25%" },
          ],
        },
        opportunities: {
          acceptedTypes: ["Contract", "Freelance", "Consulting"],
          industries: ["Tech", "Creative", "Startups"],
          deliverables: [
            "Full-stack web applications",
            "Real-time systems with WebSocket",
            "Capacity-limited / queue-based architectures",
            "Portfolio/showcase sites",
          ],
        },
        updatedAt: "2026-01-24",
      },
      {
        id: "gate-system",
        name: "Gate Access Control System",
        status: "Shipped",
        description:
          "A capacity-limited access control system implementing the 'Library Gate' pattern. Features ritualized sign-in flow, live occupancy tracking, FIFO queue management, and the 157 Triad messaging system. Sessions are managed via sealed tokens with automatic expiration based on heartbeat monitoring.",
        stack: [
          "Next.js API Routes",
          "Prisma",
          "SQLite",
          "@hapi/iron",
          "Zod",
          "State Machine Pattern",
        ],
        proof: {
          results: [
            "4 API endpoints: checkin, status, heartbeat, exit",
            "Session states: ACTIVE, QUEUED, EXPIRED, EXITED",
            "Sealed token authentication (edge-compatible)",
            "Automatic queue promotion when capacity frees",
            "IP hashing for rate limiting foundation",
            "157 Triad: Initiation → Transition → Alignment",
          ],
          links: [{ label: "Gate Page", href: "https://zyga.dev/gate" }],
        },
        costs: {
          monthly: "$0",
          oneTime: "$4,500 (Valuation)",
        },
        opportunities: {
          acceptedTypes: ["Contract", "Consulting"],
          industries: ["SaaS", "Events", "Media"],
          deliverables: [
            "Capacity-limited access systems",
            "Queue management implementation",
            "Session lifecycle architecture",
          ],
        },
        updatedAt: "2026-01-24",
      },
      {
        id: "design-system",
        name: "Museum Design System",
        status: "Shipped",
        description:
          "A cohesive monochrome design language inspired by museum curation and physics instrumentation. Includes MeasureFrame corners, calibration line animations, StatusBadge components, curator placards, and the OccupancyBadge for real-time capacity display.",
        stack: [
          "Tailwind CSS v4",
          "Framer Motion",
          "CSS Custom Properties",
          "React Components",
        ],
        proof: {
          results: [
            "4-color palette: ink (#0B0B0B), paper (#FAFAFA), fog, hair",
            "MeasureFrame component with corner markers",
            "CalibrationLine animation on state transitions",
            "StatusBadge: Shipped, Building, Research, Client-ready",
            "Placard component for What/Why/Approach displays",
            "Spring-based physics animations (stiffness: 400, damping: 30)",
          ],
        },
        costs: {
          monthly: "$0",
          oneTime: "$3,000 (Valuation)",
        },
        opportunities: {
          acceptedTypes: ["Contract", "Freelance"],
          industries: ["Design", "Creative", "Portfolio"],
          deliverables: [
            "Custom design system implementation",
            "Component library development",
            "Animation system design",
          ],
        },
        updatedAt: "2026-01-24",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // EXH-FIB: Fibtool Ecosystem
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: "fibtool-ecosystem",
    code: "EXH-FIB",
    version: "v1.1",
    updatedAt: "2026-01-24",
    title: "Fibtool Ecosystem",
    thesis: "A comprehensive financial ecosystem combining Gann/Fibonacci algo trading, a Web3 decentralized marketplace, and a fiat subscription service.",
    status: "Client-ready",
    tags: ["Python", "Algorithmic Trading", "Web3", "Solidity", "Next.js", "FastAPI", "Square of Nine", "Fibonacci"],
    metaLine: "EXH-FIB / v1.1 / Updated 2026-01-24",
    placard: {
      what: "A professional-grade ecosystem featuring an algorithmic trading platform (Fibtool), a decentralized signal marketplace (Web3), and a subscription delivery system.",
      why: "To automate complex market analysis while democratizing access to institutional-grade signals through both centralized (Email) and decentralized (Blockchain) channels.",
      approach: "Core Algo: Automated Price Confluence Zones using Gann's Square of Nine & Fibonacci. Web3 Market: Decentralized governance and signal escrow on Arbitrum. Delivery: Multi-channel distribution via Telegram, Email, and DApp. Access: Viewers can request to test and join the program via WhatsApp.",
    },
    roadmap: {
      items: [
        { label: "Beta Launch (Oct 2025)", done: true },
        { label: "Core Analysis Engines (Fibonacci + Square of Nine)", done: true },
        { label: "Multi-Timeframe Support Implementation", done: true },
        { label: "Commercial Launch (Jan 2026)", done: true },
        { label: "Full Automation Verification", done: true },
        { label: "Candlestick Pattern Detection Integration", done: true },
        { label: "Web3 Smart Contract Deployment (Testnet)", done: true },
        { label: "Email Subscription System (MVP)", done: true },
      ],
    },
    // Single auction for entire Fibtool Ecosystem ($31,000 total valuation)
    auction: {
      auctionKind: "ACQUIREMENT",
      status: "LIVE",
      currency: "USD",
      openingBid: "25000",
      minIncrement: "1000",
      endsAt: "2026-04-01T18:00:00Z",
      antiSnipingSeconds: 300,
      allowedBidTypes: ["FIXED_PRICE", "RETAINER", "EQUITY_OFFER"],
    },
    artifacts: [
      {
        id: "fibtool-core-v1",
        name: "Fibtool Core & Candlesticks",
        status: "Client-ready",
        description: "Advanced algorithmic trading bot utilizing Gann's S9 and Fibonacci retracements. Includes a lightweight Candlestick Pattern Detector (TA-Lib) for signal confirmation. Features real-time Telegram reporting with HTML formatting and multi-indicator support. Integrated risk management for MT5 automated trading.",
        stack: ["Python 3.13+", "MetaTrader 5 (MQL5)", "Pandas", "NumPy", "TA-Lib", "Telegram Bot API", "Google Gemini AI"],
        proof: {
          results: [
            "Analysis of 43 Fibonacci levels and 10+ S9 angles",
            "Real-time detection of Engulfing, Hammer, and Doji patterns",
            "Successful live trading integration with MT5",
          ],
        },
        costs: {
          monthly: "$50–$100",
          oneTime: "$8,500 (Valuation)",
        },
        funding: {
          needed: "$5,000",
          milestone: "Scaling & Marketing",
          breakdown: [
            { label: "Infrastructure", pct: "30%" },
            { label: "Marketing", pct: "40%" },
            { label: "Dev", pct: "30%" },
          ],
        },
        opportunities: {
          acceptedTypes: ["Contract", "Research collab"],
          industries: ["Fintech", "Trading"],
          deliverables: [
            "Automated signal setup",
            "Custom strategy development",
            "Join via WhatsApp to test",
          ],
        },
        updatedAt: "2026-01-24",
      },
      {
        id: "fibtool-email-mvp",
        name: "Fibtool Subscription Platform",
        status: "Shipped (MVP)",
        description: "A subscription-based web platform to sell Fibtool plot outputs via email. Full-stack solution with FastAPI backend and Next.js frontend. Integrated PayNow (Zimbabwe) payment workflow.",
        stack: ["FastAPI", "Python", "Next.js", "React", "PostgreSQL", "Docker", "PayNow"],
        costs: {
          monthly: "$20",
          oneTime: "$4,500 (Valuation)",
        },
        funding: {
          needed: "$2,000",
          milestone: "Payment gateway expansion & mobile app",
          breakdown: [
            { label: "Payment Integrations", pct: "50%" },
            { label: "Mobile Development", pct: "35%" },
            { label: "Infrastructure", pct: "15%" },
          ],
        },
        opportunities: {
          acceptedTypes: ["Contract"],
          industries: ["Fintech", "SaaS"],
          deliverables: [
            "Email subscription systems",
            "Payment integration",
          ],
        },
        updatedAt: "2026-01-24",
      },
      {
        id: "fibtool-web3-dao",
        name: "Fibtool Decentralized Signals (Arbitrum)",
        status: "Research/Testnet",
        description: "Suite of 11 smart contracts for a decentralized trading signal marketplace. Features FIBT (ERC20) utility token and Strategy NFTs (ERC721). Includes On-chain Governance, Staking, and MT5 Oracle verification.",
        stack: ["Solidity", "Hardhat", "Arbitrum", "Ethers.js", "Node.js"],
        proof: {
          results: [
            "11 Smart Contracts implemented",
            "Trusted signal payments with escrow",
            "On-chain performance verification logic",
          ],
        },
        costs: {
          monthly: "$0 (Testnet)",
          oneTime: "$18,000 (Valuation)",
        },
        funding: {
          needed: "$8,000",
          milestone: "Mainnet deployment & security audit",
          breakdown: [
            { label: "Security Audit", pct: "45%" },
            { label: "Mainnet Gas & Deployment", pct: "25%" },
            { label: "Frontend DApp", pct: "30%" },
          ],
        },
        opportunities: {
          acceptedTypes: ["Research collab", "Investment"],
          industries: ["DeFi", "Web3", "Trading"],
          deliverables: [
            "Smart contract development",
            "DeFi protocol design",
          ],
        },
        updatedAt: "2026-01-24",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // EXH-SEC: WhitehatZyga
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: "whitehat-zyga",
    code: "EXH-SEC",
    version: "v1.2",
    updatedAt: "2026-02-04",
    title: "WhitehatZyga",
    thesis: "Comprehensive offensive and defensive security toolkit for authorized ethical hacking and network forensics in Kali Linux.",
    status: "In Progress",
    tags: ["Cybersecurity", "Ethical Hacking", "Network Forensics", "Kali Linux", "Python", "Mobile Security"],
    metaLine: "EXH-SEC / v1.2 / Updated 2026-02-04",
    placard: {
      what: "A suite of 9 advanced security tools (8 currently active) designed for Kali Linux, bridging Red Team operations and Blue Team forensics.",
      why: "To provide a unified, educational platform for testing defenses and analyzing network incidents in controlled environments.",
      approach: "Best used in Kali Linux (tools are OS-specific). Modular architecture allowing independent tool usage. Strict adherence to legal and ethical boundaries.",
    },
    roadmap: {
      items: [
        { label: "BlackEye Phishing Framework", done: true },
        { label: "DDOS Simulation Framework", done: true },
        { label: "WiFi Security Analyst", done: true },
        { label: "Zeek Forensics Backend", done: true },
        { label: "Vulnerability Scanner & Exploitation Framework", done: true },
        { label: "Mobile Security Tester", done: true },
        { label: "Signal Jamming Detection (AI/ML)", done: true },
        { label: "GNU Radio Signal Jammer", done: true },
        { label: "Zeek Forensics Frontend", done: false },
      ],
    },
    // Single auction for entire WhitehatZyga program ($18,000 total valuation)
    auction: {
      auctionKind: "ACQUIREMENT",
      status: "LIVE",
      currency: "USD",
      openingBid: "12000",
      minIncrement: "500",
      endsAt: "2026-03-15T18:00:00Z",
      antiSnipingSeconds: 300,
      allowedBidTypes: ["FIXED_PRICE", "RETAINER", "HOURLY_RATE"],
    },
    artifacts: [
      {
        id: "whitehat-blackeye",
        name: "BlackEye Phishing Framework",
        status: "Shipped",
        description: "Educational phishing simulation tool for authorized testing. Features realistic templates (Facebook, Google, Instagram), ngrok integration, and automated credential capture logging.",
        stack: ["Python", "HTML/CSS", "Ngrok", "Bash"],
        proof: {
          results: [
            "3 production-ready phishing templates",
            "Automatic credential logging to JSON",
            "Real-time capture monitoring",
          ],
        },
        costs: {
          monthly: "$0",
          oneTime: "$1,500 (Valuation)",
        },
        opportunities: {
          acceptedTypes: ["Research collab"],
          industries: ["Security Awareness Training"],
          deliverables: ["New Phishing Templates"],
        },
        updatedAt: "2026-01-24",
      },
      {
        id: "whitehat-ddos",
        name: "DDOS Simulation Framework",
        status: "Shipped",
        description: "Layer 4 and Layer 7 stress testing framework for authorized network resilience testing. Includes multiple attack vectors and strict safety locking mechanisms.",
        stack: ["Python", "Sockets", "Threading", "Multi-processing"],
        proof: {
          results: [
            "Scalable request generation",
            "Support for TCP/UDP and HTTP flooding",
            "Reporting capabilities",
          ],
        },
        costs: {
          monthly: "$0",
          oneTime: "$2,000 (Valuation)",
        },
        opportunities: {
          acceptedTypes: ["Research collab"],
          industries: ["Network Defense Testing"],
          deliverables: ["New Attack Vectors"],
        },
        updatedAt: "2026-01-24",
      },
      {
        id: "whitehat-wifi",
        name: "WiFi Security Analyst",
        status: "Shipped",
        description: "Wireless network auditing suite leveraging Aircrack-ng, Reaver, and Wifite. Automates handshake capture, WPS audits, and traffic analysis.",
        stack: ["Bash", "Aircrack-ng", "Wireshark", "Python"],
        proof: {
          results: [
            "Automated handshake capture workflows",
            "WPS PIN auditing integration",
            "Traffic analysis guides",
          ],
        },
        costs: {
          monthly: "$0",
          oneTime: "$2,500 (Valuation)",
        },
        opportunities: {
          acceptedTypes: ["Research collab"],
          industries: ["Wireless Auditing"],
          deliverables: ["New Protocol Support"],
        },
        updatedAt: "2026-01-24",
      },
      {
        id: "whitehat-vulnscan",
        name: "Vulnerability Scanner & Exploitation Framework",
        status: "Shipped",
        description: "Multi-protocol vulnerability assessment and exploitation framework. Automated port scanning, CVE matching, and credential testing capabilities. Successfully tested on real-world targets with comprehensive reporting. Includes SSH, FTP, SMB, and HTTP brute force modules.",
        stack: ["Python", "Nmap", "Paramiko", "Scapy", "Threading", "JSON", "Cryptography"],
        proof: {
          results: [
            "Real-world testing on theics.co.zw (79 credentials discovered)",
            "Multi-threaded attack capabilities (5+ concurrent threads)",
            "Automated vulnerability reporting with severity ratings",
            "CVE database integration",
            "Interactive CLI interface with guided workflows",
          ],
        },
        costs: {
          monthly: "$0",
          oneTime: "$3,500 (Valuation)",
        },
        opportunities: {
          acceptedTypes: ["Contract", "Research collab"],
          industries: ["Penetration Testing", "Security Auditing", "Vulnerability Assessment"],
          deliverables: ["Custom Exploit Modules", "Protocol Extensions", "Security Reports"],
        },
        updatedAt: "2026-02-02",
      },
      {
        id: "whitehat-zeek",
        name: "Zeek Forensics API Platform",
        status: "Building Frontend",
        description: "Enterprise-grade network forensic intelligence platform. Ingests Zeek logs into a searchable backend with AI anomaly detection. Backend is complete; frontend is currently under active development.",
        stack: ["Python", "Zeek", "SQLite", "Next.js", "AI/ML"],
        proof: {
          results: [
            "40+ REST API endpoints operational",
            "Auth system with JWT/MFA implemented",
            "Log ingestion pipeline active",
          ],
        },
        costs: {
          monthly: "$0",
          oneTime: "$12,000 (Valuation)",
        },
        funding: {
          needed: "$5,000",
          milestone: "Frontend Completion",
          breakdown: [
            { label: "Frontend Dev", pct: "60%" },
            { label: "Testing", pct: "20%" },
            { label: "Documentation", pct: "20%" },
          ],
        },
        opportunities: {
          acceptedTypes: ["Internship", "Contract"],
          industries: ["Forensics", "Incident Response"],
          deliverables: ["Frontend Components", "Visualizations"],
        },
        updatedAt: "2026-01-24",
      },
      {
        id: "whitehat-mobile",
        name: "Mobile Security Tester",
        status: "Shipped",
        description: "Comprehensive mobile application security testing framework. Automated APK (Android) and IPA (iOS) analysis with OWASP Mobile Top 10 coverage. API endpoint discovery, hardcoded secret detection, and insecure storage analysis. Frida script generation for certificate pinning bypass.",
        stack: ["Python", "XML/Plist Parsing", "Regex", "Frida", "JSON", "Zipfile", "Cryptography"],
        proof: {
          results: [
            "APK/IPA extraction and manifest analysis",
            "Detects hardcoded API keys, passwords, and tokens",
            "Discovers 15+ API endpoints per typical app",
            "Certificate pinning detection (OkHttp, AFNetworking)",
            "Auto-generates Frida bypass scripts (Android/iOS)",
            "OWASP Mobile Top 10 compliance checks",
          ],
        },
        costs: {
          monthly: "$0",
          oneTime: "$3,000 (Valuation)",
        },
        opportunities: {
          acceptedTypes: ["Contract", "Research collab", "Consulting"],
          industries: ["Mobile Application Security", "Penetration Testing", "OWASP Testing"],
          deliverables: ["Custom Pattern Detection", "Mobile Pentesting Reports", "Frida Scripts"],
        },
        updatedAt: "2026-02-04",
      },
      {
        id: "whitehat-jamming-detection",
        name: "Signal Jamming Detection (AI/ML)",
        status: "Shipped",
        description: "PyTorch-based machine learning system for detecting RF signal jamming attacks. Features CNN, LSTM, and TinyML models trained on real IoT wireless network datasets, with ONNX export for edge deployment.",
        stack: ["Python", "PyTorch", "GNU Radio", "ONNX Runtime", "scikit-learn", "Matplotlib", "NumPy"],
        proof: {
          results: [
            "3-class jamming classification (Normal, Constant, Periodic)",
            "TinyML model < 50KB for embedded deployment",
            "ONNX export for cross-platform inference",
            "Real-time signal visualization and analysis",
            "Comprehensive dataset preprocessing pipeline",
          ],
        },
        costs: {
          monthly: "$0",
          oneTime: "$4,000 (Valuation)",
        },
        opportunities: {
          acceptedTypes: ["Research collab", "Contract"],
          industries: ["IoT Security", "Wireless Networks", "Defense & Aerospace"],
          deliverables: ["Custom Detection Models", "Edge Deployment", "Dataset Analysis"],
        },
        updatedAt: "2026-02-04",
      },
      {
        id: "whitehat-signal-jammer",
        name: "GNU Radio Signal Jammer",
        status: "Shipped",
        description: "Comprehensive RF signal jamming toolkit for authorized security research. Supports multiple SDR hardware (HackRF, USRP, PlutoSDR, LimeSDR, bladeRF) with four jammer types: Constant, Periodic, Sweep, and Reactive.",
        stack: ["Python", "GNU Radio", "osmosdr", "NumPy", "SciPy", "YAML", "Bash"],
        proof: {
          results: [
            "4 jammer implementations (Constant, Periodic, Sweep, Reactive)",
            "Multi-SDR hardware support with auto-detection",
            "Configurable frequency bands (WiFi, Bluetooth, Zigbee, LoRa)",
            "YAML-based configuration with safety presets",
            "Kali Linux installation automation",
            "Simulation mode for testing without hardware",
          ],
        },
        costs: {
          monthly: "$0",
          oneTime: "$3,500 (Valuation)",
        },
        opportunities: {
          acceptedTypes: ["Research collab", "Contract", "Consulting"],
          industries: ["RF Security Research", "Wireless Penetration Testing", "Defense & Aerospace"],
          deliverables: ["Custom Jammer Modules", "SDR Integration", "Security Assessments"],
        },
        updatedAt: "2026-02-04",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // EXH-SS: Sound Sync - Brainwave Audio Toolkit
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: "sound-sync",
    code: "EXH-SS",
    version: "v1.0",
    updatedAt: "2026-01-24",
    title: "Sound Synchronization Toolkit",
    thesis: "Brainwave-targeted audio synthesis inspired by declassified CIA research on consciousness exploration and hemispheric synchronization.",
    status: "In Progress",
    tags: ["Python", "Audio", "DSP", "Binaural", "Hemi-Sync", "Gateway", "Consciousness", "Brainwave", "Meditation"],
    metaLine: "EXH-SS / v1.0 / Updated 2026-01-24",
    placard: {
      what: "A brainwave entrainment toolkit implementing principles from the 1983 CIA Gateway Experience analysis — using binaural beats to induce hemispheric synchronization and altered focus states.",
      why: "The declassified CIA document 'Analysis and Assessment of Gateway Process' validated that human consciousness can access expanded states through audio-induced brain hemisphere synchronization. This toolkit makes those techniques reproducible and accessible.",
      approach: "Frequency Following Response (FFR): Brain naturally synchronizes to external audio frequencies. Hemi-Sync methodology: Left/right ear frequency differentials create binaural beat perception in the brain stem. Focus Levels: Progressive states from relaxed alertness (Focus 10) through increasingly dissociated awareness. Each audio track targets specific EEG band ratios documented in Gateway research.",
    },
    roadmap: {
      items: [
        { label: "Core synthesis + analysis modules", done: true },
        { label: "Gateway-inspired Focus Level audio", done: true },
        { label: "Spectrogram plots and documentation", done: true },
        { label: "State transition audio tracks", done: true },
        { label: "In-app audio player with waveform", done: true },
        { label: "Extended Focus 12+ states", done: false },
        { label: "GUI for interactive parameter control", done: false },
        { label: "Real-time EEG band visualization", done: false },
      ],
    },
    // Single auction for entire Sound Sync program ($6,500 total valuation)
    auction: {
      auctionKind: "ACQUIREMENT",
      status: "LIVE",
      currency: "USD",
      openingBid: "5000",
      minIncrement: "250",
      endsAt: "2026-03-15T18:00:00Z",
      antiSnipingSeconds: 300,
      allowedBidTypes: ["FIXED_PRICE", "RETAINER"],
    },
    artifacts: [
      {
        id: "sound-sync-toolkit",
        name: "ZYGA Sound Mind (SM) — Gateway-Inspired Audio States",
        status: "Building",
        description: "Implementation of the CIA-documented Gateway Process methodology. The 1983 analysis (CIA-RDP96-00788R001700210016-5) established that binaural beat audio can induce 'Hemi-Sync' — a condition where both brain hemispheres oscillate coherently, enabling altered states of consciousness. This toolkit provides five progressive states: Awake Focus (orientation), Relaxed Body (somatic release), Mind Awake/Body Asleep (the 'Focus 10' threshold state), Deep Inner (theta/delta access), and Integration (controlled return). The Gateway research confirmed these states as reproducible human capabilities, not anomalies.",
        stack: ["Python", "NumPy", "SciPy", "SoundFile", "SoundDevice", "Matplotlib", "Librosa"],
        proof: {
          results: [
            "5 complete audio state tracks targeting documented EEG bands",
            "Binaural beat differentials in 4-15 Hz range (theta to low-beta)",
            "Gateway 'Focus 10' equivalent: Mind Awake/Body Asleep state",
            "Frequency Following Response implementation per CIA analysis",
            "Comprehensive neurophysiological documentation per state",
          ],
          links: [
            { label: "CIA Gateway Document", href: "https://www.cia.gov/readingroom/docs/cia-rdp96-00788r001700210016-5.pdf" },
          ],
        },
        costs: {
          monthly: "$0",
          oneTime: "$6,500 (Valuation)",
        },
        funding: {
          needed: "$3,000",
          milestone: "GUI development & extended Focus states",
          breakdown: [
            { label: "GUI Development", pct: "45%" },
            { label: "Extended States Research", pct: "35%" },
            { label: "Documentation", pct: "20%" },
          ],
        },
        opportunities: {
          acceptedTypes: ["Contract", "Freelance", "Research collab"],
          industries: ["HealthTech", "Wellness", "Neuroscience", "Research"],
          deliverables: [
            "Custom frequency pack for specific state targets",
            "EEG band analysis and spectrogram reports",
            "Gateway-methodology audio design consultation",
          ],
        },
        media: [
          {
            label: "Awake Focus",
            audioSrc: "/audio/zyga-sm/awake-focus.mp3",
            documentId: "awake-focus",
          },
          {
            label: "Relaxed Body",
            audioSrc: "/audio/zyga-sm/relaxed-body.mp3",
            documentId: "relaxed-body",
          },
          {
            label: "Mind Awake / Body Asleep",
            audioSrc: "/audio/zyga-sm/maba.mp3",
            documentId: "maba",
          },
          {
            label: "Deep Inner",
            audioSrc: "/audio/zyga-sm/deep-inner.mp3",
            documentId: "deep-inner",
          },
          {
            label: "Integration",
            audioSrc: "/audio/zyga-sm/integration.mp3",
            documentId: "integration",
          },
        ],
        updatedAt: "2026-01-24",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // EXH-ZP: ZIMPOS Platform
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: "zimpos-platform",
    code: "EXH-ZP",
    version: "v1.0",
    updatedAt: "2026-01-24",
    title: "ZIMPOS - Enterprise Retail Platform",
    thesis:
      "Production-ready Point of Sale specifically engineered for multi-currency markets with offline-first resilience.",
    status: "Client-ready",
    tags: [
      "Fintech",
      "Retail",
      "Offline-first",
      "Python",
      "Analytics",
      "Flask",
      "Next.js",
      "Multi-currency",
    ],
    metaLine: "EXH-ZP / v1.0 / Updated 2026-01-24",
    placard: {
      what: "A comprehensive Point of Sale ecosystem combining a Flask-based transactional core with Next.js marketing infrastructure.",
      why: "Emerging markets require robust multi-currency handling (USD/ZAR/ZIG) and operation in low-connectivity environments, which standard POS solutions fail to address.",
      approach:
        "Hybrid architecture: PWA for offline reliability + Cloud sync. Statistical forecasting to optimize inventory in volatile markets. Vendor-agnostic hardware support via browser-based delivery. ZIMRA fiscalization integration pending (sandbox API access requested).",
    },
    roadmap: {
      items: [
        { label: "Core Transactional Engine (Beta)", done: true },
        { label: "Multi-currency Logic & Live Rates", done: true },
        { label: "Intelligent Analytics Dashboard", done: true },
        { label: "ZIMRA Fiscalization Integration", done: false },
        { label: "Commercial Partnership & IP Transfer", done: false },
        { label: "Multi-tenant SaaS Scaling", done: true },
      ],
    },
    // Single auction for entire ZIMPOS platform ($38,500 total valuation)
    auction: {
      auctionKind: "ACQUIREMENT",
      status: "LIVE",
      currency: "USD",
      openingBid: "28000",
      minIncrement: "1000",
      endsAt: "2026-03-01T12:00:00Z",
      antiSnipingSeconds: 300,
      allowedBidTypes: ["FIXED_PRICE", "RETAINER", "EQUITY_OFFER"],
    },
    artifacts: [
      {
        id: "zimpos-core",
        name: "ZIMPOS Transactional Core",
        status: "Shipped",
        description:
          "The central operating system for retail. Handles inventory, sales, users, and real-time data sync across devices. Built for speed and reliability with specialized handling for multi-currency transactions (USD, ZAR, ZIG). ZIMRA fiscal device integration is next on the roadmap — sandbox API access has been requested for compliant tax reporting.",
        stack: ["Python", "Flask", "PostgreSQL", "Socket.IO", "Bootstrap", "PWA"],
        proof: {
          results: [
            "Zero critical security incidents during beta stress testing",
            "<1s latency on real-time dashboard updates via WebSockets",
            "Seamless handling of 3 concurrent currencies (USD, ZAR, ZIG)",
            "Offline-first PWA architecture for low-connectivity environments",
          ],
          links: [
            { label: "Live Beta", href: "https://beta.zimpos.shop" },
          ],
        },
        costs: {
          monthly: "$50–$150",
          oneTime: "$35,000 (Valuation)",
        },
        funding: {
          needed: "$25,000",
          milestone: "Full IP Transfer & initial scale-up",
          breakdown: [
            { label: "Developer Equity/IP", pct: "75%" },
            { label: "Infrastructure Hardening", pct: "25%" },
          ],
        },
        opportunities: {
          acceptedTypes: ["Contract", "Research collab"],
          industries: ["Retail", "Fintech", "Emerging Markets"],
          deliverables: ["Custom POS deployment", "Sales forecasting models"],
        },
        updatedAt: "2026-01-24",
      },
      {
        id: "zimpos-marketing",
        name: "ZIMPOS Digital Presence",
        status: "Shipped",
        description:
          "High-performance Next.js marketing portal designed for SEO and customer conversion. Acts as the funnel entry point for the POS platform with integrated lead generation.",
        stack: ["Next.js", "React", "Tailwind CSS", "TypeScript"],
        proof: {
          results: [
            "Modern, responsive design with high Lighthouse scores",
            "Integrated lead generation funnel",
            "SEO-optimized for 'Zimbabwe POS' and 'multi-currency retail' keywords",
          ],
          links: [{ label: "Live Site", href: "https://www.zimpos.shop" }],
        },
        costs: {
          monthly: "$20",
          oneTime: "$3,500 (Valuation)",
        },
        opportunities: {
          acceptedTypes: ["Contract", "Freelance"],
          industries: ["Marketing", "SaaS", "Retail"],
          deliverables: [
            "Marketing site development",
            "SEO optimization",
            "Lead generation funnels",
          ],
        },
        updatedAt: "2026-01-24",
      },
    ],
  },
];
