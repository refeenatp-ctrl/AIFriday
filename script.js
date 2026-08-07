/* ==========================================================================
   ENTERPRISE GENAI AGENT ARCHITECTURE - LOGIC & INTERACTION
   ========================================================================== */

// --- 1. Component Registry Database ---
const componentData = {
    // Frontend module details
    "fe-admin": {
        title: "Admin Console",
        category: "Presentation Layer (Angular)",
        description: "Provides administration interface for system configurations. Admins can manage prompt templates, override agent routing rules, adjust rate-limiting parameters, and set role-based access control policies.",
        tech: ["Angular Core", "TypeScript", "RxJS State Management", "Tailwind CSS"],
        flow: "Dispatches configuration changes to App DB via Gateway APIs."
    },
    "fe-dashboard": {
        title: "Monitoring Dashboard",
        category: "Presentation Layer (Angular)",
        description: "Visualizes live execution metrics of the system. Displays token usage costs, system response latencies, active conversation graphs, agent error rates, and queue telemetry.",
        tech: ["Chart.js / ng2-charts", "WebSockets (real-time stream)", "RxJS"],
        flow: "Pulls metrics endpoints from Python Flask backend."
    },
    "fe-analysis": {
        title: "Analysis Panel",
        category: "Presentation Layer (Angular)",
        description: "Allows developer-level query analysis of LLM traces and responses. Visualizes exact agent execution trajectories, node states, and decision-tree evaluations.",
        tech: ["D3.js Tree Rendering", "Angular Material Dialogs"],
        flow: "Fetches detailed trace graphs from LangGraph logs in the SQLite database."
    },
    "fe-forecast": {
        title: "Forecasting Workspace",
        category: "Presentation Layer (Angular)",
        description: "A sandbox for predictive model assessment. Translates historical databases into predictive workloads to help administrators forecast system demands.",
        tech: ["TensorFlowJS integration", "Angular routing views"],
        flow: "Passes forecasting parameters to Flask backend analytical models."
    },
    "fe-report": {
        title: "Reporting Studio",
        category: "Presentation Layer (Angular)",
        description: "Generates scheduled and ad-hoc audits. Users can export details on system performance, compliance logs, database sizes, and API costs.",
        tech: ["jsPDF / SheetJS integration", "Angular file downloads"],
        flow: "Aggregates records from App DB and prints downloadable packages."
    },
    "fe-chat": {
        title: "Conversational Client",
        category: "Presentation Layer (Angular)",
        description: "The primary user chat interface. Implements streaming token output, markdown content parsing, visual node-execution-step indicators, and file attachments.",
        tech: ["Markdown-it Parser", "EventSource / SSE (Server-Sent Events)"],
        flow: "Establishes secure, bidirectional channel to TCS GenAI Gateway."
    },
    "fe-logs": {
        title: "Real-time Telemetry Logs",
        category: "Presentation Layer (Angular)",
        description: "Streaming audit log console showing active backend log levels (INFO, WARN, DEBUG). Crucial for verifying agent states during complex operations.",
        tech: ["Virtual Scroll Layout", "Monaco Editor reader-only format"],
        flow: "Subscribes to Flask log server-sent streams."
    },

    // Left Column Integration cards
    "node-gateway": {
        title: "TCS GenAI Gateway",
        category: "Integration & Gateway Layer",
        description: "Enterprise security shield. Manages endpoint routing, enforces OAuth2/OIDC user authentication, checks token rates to prevent DDoS, and logs API transactions for audit verification.",
        tech: ["Reverse Proxy", "OAuth2 / JWT Verification", "Rate Limiter (Redis-backed)"],
        flow: "Forwards user chats to Python Flask Backend after security inspection; writes alerts to Notification queue."
    },
    "node-app-db": {
        title: "Application DB (SQLite)",
        category: "Data Layer",
        description: "The system storage node. Holds user schemas, security policies, chat history records, persistent agent state snapshots, and outgoing notification queues.",
        tech: ["SQLite 3", "SQLAlchemy ORM (Flask side)", "WAL Mode (Write-Ahead Logging)"],
        flow: "Persists Flask agent states; serves as the queue for Notification Job worker."
    },
    "node-notification-job": {
        title: "Notification Job Worker",
        category: "Infrastructure Layer",
        description: "An asynchronous background task processor. Regularly polls the local database queue to resolve pending alerts, sending automated notifications for job completions, failures, or critical errors.",
        tech: ["Python Celery / APScheduler", "SMTP protocol connection", "Webhook Dispatchers"],
        flow: "Pulls jobs from App DB; dispatches SMTP updates via external SMTP servers."
    },

    // Backend Layer cards
    "node-guardrail": {
        title: "Security Guardrails Layer",
        category: "Compliance & Safety Layer",
        description: "Dual-direction scanning pipeline. Before inquiries reach LangGraph, it scans for prompt injection and masks PII (emails, credentials). Post-execution, it audits raw LLM outputs to prevent hallucinations and verify compliance.",
        tech: ["NeMo Guardrails", "Microsoft Presidio (PII mask)", "Regex & Semantic filters"],
        flow: "Intercepts incoming request body, alters parameters, then routes sanitized content to Agent layer."
    },
    "agent-planner": {
        title: "Planner Agent",
        category: "LangGraph Orchestration",
        description: "Task decomposer. When a user issues a complex command (e.g., 'Analyze this CSV, schedule a review, and email summary'), the Planner details the execution hierarchy and maps dependencies.",
        tech: ["LLM Chain (Zero-shot COT)", "LangChain Structured Output"],
        flow: "Prepares execution graph for the Supervisor."
    },
    "agent-supervisor": {
        title: "Supervisor Node (Orchestrator)",
        category: "LangGraph Orchestration",
        description: "The graph state machine manager. Tracks conversational states, selects next active agents, acts as router, and evaluates if the planner steps have been fully executed.",
        tech: ["LangGraph StateGraph", "Conditional Router functions"],
        flow: "Directs LangGraph control flow to specialized Domain Agents."
    },
    "agent-rag": {
        title: "RAG Engine",
        category: "Information Retrieval",
        description: "Retrieval-Augmented Generation module. Grounding source for domain agents. Queries internal vector DBs, crawls document spaces, and appends reference blocks to agent prompts.",
        tech: ["FAISS / Chroma Vector DB", "Cosine Similarity lookup", "Cross-Encoder Reranking"],
        flow: "Injects context documents into active LangGraph state."
    },
    "node-domain-agents": {
        title: "Domain Specific Agents",
        category: "LangGraph Execution Layer",
        description: "Four custom, specialized agent nodes representing distinct corporate sectors: Finance (auditing, spreadsheets), Operations (integrations, logistics), Support (ticket matching, diagnostics), and HR (recruiting, policy questions).",
        tech: ["Domain-specific system instructions", "Fine-tuned models", "Tool-calling APIs"],
        flow: "Invoked by Supervisor; leverages MCP tools to complete individual domains."
    },
    "agent-reflection": {
        title: "Reflection Node",
        category: "Self-Correction Loop",
        description: "Double-check validator. Runs self-critique on agent outputs, ensuring calculations match instructions, schemas match models, and response tone is compliant.",
        tech: ["Self-Reflection Prompt Chains"],
        flow: "Reroutes control back to Supervisor if response quality falls below acceptance threshold."
    },
    "agent-memory": {
        title: "Memory System",
        category: "State Management",
        description: "Maintains short-term context (recent dialog nodes) and stores/retrieves long-term facts (user profiles, database parameters) to deliver highly personalized agent behavior.",
        tech: ["LangGraph checkpointing", "Semantic Memory embeddings"],
        flow: "Reads/writes session checkpoints directly to App DB."
    },
    "agent-summarizer": {
        title: "Summarizer Module",
        category: "Telemetry & Context Compression",
        description: "Context optimization agent. When thread history gets large, the summarizer condenses old messages into unified context logs to stay inside LLM token budgets.",
        tech: ["LLM Summarization prompt patterns"],
        flow: "Replaces historical arrays in the active state graph with structured summary text."
    },
    "agent-mcp-client": {
        title: "MCP Client",
        category: "Model Context Protocol Client",
        description: "The protocol client running within the agent framework. Resolves tool calling schemas for LLMs, handles standard tool-call responses, and tunnels actions to the MCP Server.",
        tech: ["MCP Client SDK", "SSE / stdio Transport Channel"],
        flow: "Listens for domain agent tool executions and dispatches JSON-RPC packets to MCP Server."
    },

    // MCP integration cards
    "node-mcp-server": {
        title: "Model Context Protocol (MCP) Server",
        category: "Tool & Data Integration",
        description: "The core protocol bridge. Standardizes how LLM agents interact with client systems, securely exposing native file structures, system commands, APIs, and tools.",
        tech: ["Model Context Protocol (Anthropic standard)", "Python/Node MCP SDK", "SSE transport"],
        flow: "Executes tool requests on behalf of Domain Agents; queries local MCP DB for routing."
    },
    "node-mcp-db": {
        title: "MCP SQLite Database",
        category: "Integration Data Layer",
        description: "Holds registry configurations, security permissions, API key hashes, and logs of tool executions for auditing tool behaviors.",
        tech: ["SQLite 3", "Prisma ORM connector"],
        flow: "Reads tool metadata and saves access logs for the MCP server."
    }
};

// Tool metadata details (will map back to MCP Server)
const toolData = {
    "tool-email": { title: "Email Tool", desc: "Allows agents to search, read, and write emails using corporate mail servers." },
    "tool-calendar": { title: "Calendar Tool", desc: "Exposes corporate schedules to verify user availability, create invites, and book events." },
    "tool-file": { title: "File Access Tool", desc: "Exposes directory read/write tools inside designated workspace sandboxes." },
    "tool-search": { title: "Web Search Tool", desc: "Allows agents to query external search engines to fetch current market stats." },
    "tool-custom": { title: "Custom ERP Tool", desc: "Allows secure connections to back-office ERP/CRM platforms." }
};

// Add tools to standard component data
Object.keys(toolData).forEach(key => {
    componentData[key] = {
        title: toolData[key].title,
        category: "MCP Tool Wrapper",
        description: toolData[key].desc,
        tech: ["MCP Tool Protocol Schema", "OAuth API connector"],
        flow: "Invoked securely by MCP Server when requested by LangGraph Domain Agents."
    };
});

// Add domain cards explicitly
const domainCards = ["agent-finance", "agent-ops", "agent-support", "agent-hr"];
domainCards.forEach(id => {
    const domainName = id.replace("agent-", "").toUpperCase();
    componentData[id] = {
        title: `${domainName} Domain Agent`,
        category: "LangGraph Domain Node",
        description: `Dedicated agent node specialized in ${domainName} workflows. Equipped with custom guidelines, system prompts, and access controls to execute targeted tasks.`,
        tech: ["GPT-4o / Claude 3.5 Sonnet", "LangGraph Node bindings"],
        flow: "Supervisor transfers state token here; invokes specific MCP tools to fetch resources."
    };
});


// --- 2. Connection Drawing Logic (SVGs) ---
const connections = [
    // format: [fromID, toID, isDual, activeColor, strokeOffsetModifier]
    { from: "node-gateway", to: "layer-backend", activeColor: "var(--accent-gw)" },
    { from: "node-app-db", to: "layer-backend", activeColor: "var(--accent-db)" },
    { from: "node-gateway", to: "node-notification-job", activeColor: "var(--accent-gw)" },
    { from: "node-app-db", to: "node-notification-job", activeColor: "var(--accent-db)" },
    { from: "node-agent-layer", to: "node-mcp-server", activeColor: "var(--accent-ag)" },
    { from: "node-mcp-server", to: "node-mcp-db", activeColor: "var(--accent-mcp)" }
];

function drawConnections() {
    const svg = document.getElementById("connection-svg");
    if (!svg) return;
    
    // Clear old paths
    svg.innerHTML = '';
    
    const svgRect = svg.getBoundingClientRect();
    
    connections.forEach((conn, index) => {
        const fromEl = document.getElementById(conn.from);
        const toEl = document.getElementById(conn.to);
        
        if (!fromEl || !toEl) return;
        
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        
        // Calculate relative coordinates in SVG space
        let x1, y1, x2, y2;
        
        // Determine routing direction based on locations
        if (conn.from === "node-gateway" && conn.to === "node-notification-job") {
            // Downward vertically
            x1 = (fromRect.left + fromRect.right) / 2 - svgRect.left - 15;
            y1 = fromRect.bottom - svgRect.top;
            x2 = (toRect.left + toRect.right) / 2 - svgRect.left - 15;
            y2 = toRect.top - svgRect.top;
        } else if (conn.from === "node-app-db" && conn.to === "node-notification-job") {
            // Downward vertically
            x1 = (fromRect.left + fromRect.right) / 2 - svgRect.left + 15;
            y1 = fromRect.bottom - svgRect.top;
            x2 = (toRect.left + toRect.right) / 2 - svgRect.left + 15;
            y2 = toRect.top - svgRect.top;
        } else if (conn.to === "layer-backend") {
            // Left to right
            x1 = fromRect.right - svgRect.left;
            y1 = (fromRect.top + fromRect.bottom) / 2 - svgRect.top;
            x2 = toRect.left - svgRect.left;
            y2 = (fromRect.top + fromRect.bottom) / 2 - svgRect.top; // align horizontally
        } else if (conn.from === "node-agent-layer" && conn.to === "node-mcp-server") {
            // Vertical down between Agent Box and MCP Server
            x1 = (fromRect.left + fromRect.right) / 2 - svgRect.left;
            y1 = fromRect.bottom - svgRect.top;
            x2 = (toRect.left + toRect.right) / 2 - svgRect.left;
            y2 = toRect.top - svgRect.top;
        } else if (conn.from === "node-mcp-server" && conn.to === "node-mcp-db") {
            // Left to right inside MCP Layer
            x1 = fromRect.right - svgRect.left;
            y1 = (fromRect.top + fromRect.bottom) / 2 - svgRect.top;
            x2 = toRect.left - svgRect.left;
            y2 = (toRect.top + toRect.bottom) / 2 - svgRect.top;
        } else {
            // Default center to center
            x1 = (fromRect.left + fromRect.right) / 2 - svgRect.left;
            y1 = (fromRect.top + fromRect.bottom) / 2 - svgRect.top;
            x2 = (toRect.left + toRect.right) / 2 - svgRect.left;
            y2 = (toRect.top + toRect.bottom) / 2 - svgRect.top;
        }
        
        // Draw dual lanes to represent bidirectional flow
        createBidirectionalPaths(svg, x1, y1, x2, y2, conn.activeColor, `path-${conn.from}-${conn.to}`);
    });
}

function createBidirectionalPaths(svg, x1, y1, x2, y2, activeColor, idPrefix) {
    const isVertical = Math.abs(x1 - x2) < Math.abs(y1 - y2);
    
    // Offset for dual lines
    const offset = 8;
    
    let path1_coords, path2_coords;
    
    if (isVertical) {
        // Vertical lines: offset on X axis
        path1_coords = `M ${x1 - offset} ${y1} L ${x2 - offset} ${y2}`;
        path2_coords = `M ${x2 + offset} ${y2} L ${x1 + offset} ${y1}`;
    } else {
        // Horizontal lines: offset on Y axis
        // If it curves or has a step
        const midX = (x1 + x2) / 2;
        path1_coords = `M ${x1} ${y1 - offset} H ${midX} V ${y2 - offset} H ${x2}`;
        path2_coords = `M ${x2} ${y2 + offset} H ${midX} V ${y1 + offset} H ${x1}`;
    }
    
    // Create base path 1 (Incoming)
    const p1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p1.setAttribute("d", path1_coords);
    p1.setAttribute("id", `${idPrefix}-forward`);
    p1.style.setProperty("--active-stroke-color", activeColor);
    
    // Create base path 2 (Outgoing)
    const p2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p2.setAttribute("d", path2_coords);
    p2.setAttribute("id", `${idPrefix}-reverse`);
    p2.style.setProperty("--active-stroke-color", activeColor);
    
    svg.appendChild(p1);
    svg.appendChild(p2);
}

// Trigger path highlighting based on node active states
function highlightPath(fromNode, toNode, active) {
    const fPath = document.getElementById(`path-${fromNode}-${toNode}-forward`);
    const rPath = document.getElementById(`path-${fromNode}-${toNode}-reverse`);
    
    if (fPath && rPath) {
        if (active) {
            fPath.classList.add("flow-active", "flow-pulse");
            rPath.classList.add("flow-active", "flow-pulse");
        } else {
            fPath.classList.remove("flow-active", "flow-pulse");
            rPath.classList.remove("flow-active", "flow-pulse");
        }
    }
}


// --- 3. Interactive Detail Panel Controller ---
function showDetails(elementId) {
    const data = componentData[elementId];
    if (!data) return;
    
    document.getElementById("panel-placeholder").style.display = "none";
    
    const content = document.getElementById("panel-content");
    content.style.display = "block";
    
    document.getElementById("panel-category").innerText = data.category;
    document.getElementById("panel-title").innerText = data.title;
    document.getElementById("panel-description").innerText = data.description;
    document.getElementById("panel-data-flow").innerText = data.flow;
    
    // Set custom accent colors in detail panel
    const categoryTag = document.getElementById("panel-category");
    let accentColor = "var(--accent-ag)";
    if (elementId.startsWith("fe-")) accentColor = "var(--accent-fe)";
    else if (elementId === "node-gateway") accentColor = "var(--accent-gw)";
    else if (elementId.includes("db")) accentColor = "var(--accent-db)";
    else if (elementId === "node-guardrail") accentColor = "var(--accent-bk)";
    else if (elementId.startsWith("tool-") || elementId === "node-mcp-server") accentColor = "var(--accent-mcp)";
    
    categoryTag.style.color = accentColor;
    categoryTag.style.backgroundColor = `${accentColor}15`;
    document.getElementById("panel-title").style.color = accentColor;
    document.querySelector(".panel-divider").style.background = `linear-gradient(90deg, ${accentColor}, transparent)`;
    
    // Populate tech list
    const list = document.getElementById("panel-tech-list");
    list.innerHTML = '';
    data.tech.forEach(t => {
        const li = document.createElement("li");
        li.innerText = t;
        li.style.setProperty("--accent-ag", accentColor); // update bullet color
        list.appendChild(li);
    });
}

function clearDetails() {
    if (presentationModeActive) return; // don't clear during slides
    document.getElementById("panel-content").style.display = "none";
    document.getElementById("panel-placeholder").style.display = "flex";
}


// --- 4. Presentation Mode Config & State Machine ---
let presentationModeActive = false;
let currentSlide = 0;

const slides = [
    {
        name: "Layer 1: Frontend Client (Angular)",
        description: "The presentation layers that standard users and system administrators interface with. Built on Angular, it features rich visualization dashboards, conversational chat blocks, admin control configurations, audit log utilities, and report generators.",
        focusSelectors: ["#layer-frontend"],
        detailsId: "fe-chat",
        focusColor: "var(--accent-fe)",
        focusGlow: "rgba(0, 242, 254, 0.25)",
        highlightPaths: []
    },
    {
        name: "Layer 2: Integration Gateway & Storage",
        description: "The outer rim of the backend infrastructure. The TCS GenAI Gateway authenticates requests and logs entries, while App DB holds transactional state snapshots. Background notification jobs process delayed alert mailers in a separate scheduler thread.",
        focusSelectors: ["#node-gateway", "#node-app-db", "#node-notification-job"],
        detailsId: "node-gateway",
        focusColor: "var(--accent-gw)",
        focusGlow: "rgba(255, 88, 88, 0.25)",
        highlightPaths: [
            { from: "node-gateway", to: "node-notification-job" },
            { from: "node-app-db", to: "node-notification-job" }
        ]
    },
    {
        name: "Layer 3: Security & Guardrails Layer",
        description: "First line of server security. Threat detection engines inspect inputs to block prompt injection vulnerabilities. The GDPR module logs privacy compliance actions, and the PII component redacts sensitive keys to safeguard data outputs.",
        focusSelectors: ["#node-guardrail"],
        detailsId: "node-guardrail",
        focusColor: "var(--accent-bk)",
        focusGlow: "rgba(56, 239, 125, 0.25)",
        highlightPaths: [
            { from: "node-gateway", to: "layer-backend" }
        ]
    },
    {
        name: "Layer 4: LangGraph Orchestrators",
        description: "The core decision makers. LangGraph defines states and actions. The Planner splits operations into node sequences; the Supervisor handles transitions and state loops; and the RAG engine injects external information documents to avoid hallucinations.",
        focusSelectors: ["#agent-planner", "#agent-supervisor", "#agent-rag"],
        detailsId: "agent-supervisor",
        focusColor: "var(--accent-ag)",
        focusGlow: "rgba(167, 139, 250, 0.25)",
        highlightPaths: [
            { from: "node-app-db", to: "layer-backend" }
        ]
    },
    {
        name: "Layer 5: Specialized Execution & Context Helpers",
        description: "Execution nodes. Specialized Domain Agents handle individual business operations. Backing nodes analyze performance: Reflection runs quality-checks for self-correction, Memory maintains context sessions, Summarizer compresses token counts, and MCP Client bridges requests.",
        focusSelectors: ["#node-domain-agents", "#agent-reflection", "#agent-memory", "#agent-summarizer", "#agent-mcp-client"],
        detailsId: "node-domain-agents",
        focusColor: "var(--accent-ag)",
        focusGlow: "rgba(167, 139, 250, 0.25)",
        highlightPaths: []
    },
    {
        name: "Layer 6: MCP Integration & External Tools",
        description: "Extensibility layer. The Model Context Protocol (MCP) Server links agents directly with file systems, search modules, calendar schedules, custom databases, and mail protocols under standard secure boundaries.",
        focusSelectors: ["#node-mcp-server", "#node-mcp-db", "#agent-mcp-client"],
        detailsId: "node-mcp-server",
        focusColor: "var(--accent-mcp)",
        focusGlow: "rgba(0, 188, 212, 0.25)",
        highlightPaths: [
            { from: "node-agent-layer", to: "node-mcp-server" },
            { from: "node-mcp-server", to: "node-mcp-db" }
        ]
    }
];

function setPresentationMode(active) {
    presentationModeActive = active;
    const bodyContainer = document.querySelector(".app-container");
    const progressContainer = document.getElementById("presentation-progress");
    const footerControls = document.getElementById("presentation-controls");
    const btnInteractive = document.getElementById("btn-mode-interactive");
    const btnPresentation = document.getElementById("btn-mode-presentation");

    if (active) {
        bodyContainer.classList.add("presentation-active");
        progressContainer.style.display = "block";
        footerControls.style.display = "flex";
        btnInteractive.classList.remove("active");
        btnPresentation.classList.add("active");
        currentSlide = 0;
        applySlide(0);
    } else {
        bodyContainer.classList.remove("presentation-active");
        progressContainer.style.display = "none";
        footerControls.style.display = "none";
        btnInteractive.classList.add("active");
        btnPresentation.classList.remove("active");
        
        // Reset styles and pathways
        document.querySelectorAll(".dimmed").forEach(el => el.classList.remove("dimmed"));
        document.querySelectorAll(".focused").forEach(el => {
            el.classList.remove("focused");
            el.style.removeProperty("--focus-color");
            el.style.removeProperty("--focus-glow");
        });
        
        connections.forEach(conn => {
            highlightPath(conn.from, conn.to, false);
        });
        clearDetails();
    }
}

function applySlide(index) {
    if (index < 0 || index >= slides.length) return;
    
    currentSlide = index;
    const slide = slides[index];
    
    // Update footer indicators
    document.getElementById("current-slide").innerText = index + 1;
    document.getElementById("total-slides").innerText = slides.length;
    document.getElementById("btn-prev").disabled = (index === 0);
    document.getElementById("btn-next").innerText = (index === slides.length - 1) ? "Finish" : "Next Layer →";
    
    // Progress Fill
    const progressPct = ((index + 1) / slides.length) * 100;
    document.getElementById("progress-fill").style.width = `${progressPct}%`;
    
    // Reset all elements first
    document.querySelectorAll(".arch-layer, .arch-card, .agent-badge, .domain-agents-box, .guardrail-box, .mcp-server-box")
        .forEach(el => {
            el.classList.add("dimmed");
            el.classList.remove("focused");
            el.style.removeProperty("--focus-color");
            el.style.removeProperty("--focus-glow");
        });
        
    connections.forEach(conn => {
        highlightPath(conn.from, conn.to, false);
    });
    
    // Highlight elements for current slide
    slide.focusSelectors.forEach(selector => {
        const target = document.querySelector(selector);
        if (target) {
            target.classList.remove("dimmed");
            target.classList.add("focused");
            target.style.setProperty("--focus-color", slide.focusColor);
            target.style.setProperty("--focus-glow", slide.focusGlow);
            
            // Also ensure parents of target aren't dimmed (e.g. if we highlight internal tags)
            let parent = target.parentElement;
            while (parent && !parent.classList.contains("architecture-canvas")) {
                if (parent.classList.contains("dimmed")) {
                    parent.classList.remove("dimmed");
                }
                parent = parent.parentElement;
            }
        }
    });
    
    // Highlight pathways
    slide.highlightPaths.forEach(path => {
        highlightPath(path.from, path.to, true);
    });
    
    // Trigger Details update
    showDetails(slide.detailsId);
    
    // Smooth scroll the focused element into viewport if on mobile
    const firstFocused = document.querySelector(slide.focusSelectors[0]);
    if (firstFocused) {
        firstFocused.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// --- 5. Event Listeners Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    // Resize drawing triggers
    window.addEventListener("resize", drawConnections);
    
    // Draw initial connections (delayed to ensure container elements are rendered and have dimensions)
    setTimeout(drawConnections, 300);
    
    // Set up hover listeners for interactive mode
    const interactiveElements = document.querySelectorAll(
        ".module-card, .arch-card, .guardrail-box, .agent-badge, .domain-agents-box, .tool-badge, .mcp-server-box, .domain-card"
    );
    
    interactiveElements.forEach(el => {
        el.addEventListener("mouseenter", () => {
            if (presentationModeActive) return;
            const elementId = el.getAttribute("id");
            if (elementId) {
                showDetails(elementId);
                
                // Active flow highlights based on hovered components
                if (elementId === "node-gateway") {
                    highlightPath("node-gateway", "layer-backend", true);
                    highlightPath("node-gateway", "node-notification-job", true);
                } else if (elementId === "node-app-db") {
                    highlightPath("node-app-db", "layer-backend", true);
                    highlightPath("node-app-db", "node-notification-job", true);
                } else if (elementId === "node-notification-job") {
                    highlightPath("node-gateway", "node-notification-job", true);
                    highlightPath("node-app-db", "node-notification-job", true);
                } else if (elementId === "node-agent-layer" || elementId.startsWith("agent-") || elementId === "node-domain-agents") {
                    highlightPath("node-agent-layer", "node-mcp-server", true);
                } else if (elementId === "node-mcp-server" || elementId.startsWith("tool-")) {
                    highlightPath("node-agent-layer", "node-mcp-server", true);
                    highlightPath("node-mcp-server", "node-mcp-db", true);
                } else if (elementId === "node-mcp-db") {
                    highlightPath("node-mcp-server", "node-mcp-db", true);
                }
            }
        });
        
        el.addEventListener("mouseleave", () => {
            if (presentationModeActive) return;
            clearDetails();
            
            // Remove all pathways highlights
            connections.forEach(conn => {
                highlightPath(conn.from, conn.to, false);
            });
        });

        // Click handler to locks details in mobile/touch screens
        el.addEventListener("click", () => {
            const elementId = el.getAttribute("id");
            if (elementId) {
                showDetails(elementId);
            }
        });
    });

    // Close details panel button (for small screens)
    document.getElementById("close-panel").addEventListener("click", () => {
        clearDetails();
    });

    // Mode Selection Buttons
    document.getElementById("btn-mode-interactive").addEventListener("click", () => {
        setPresentationMode(false);
    });
    
    document.getElementById("btn-mode-presentation").addEventListener("click", () => {
        setPresentationMode(true);
    });

    // Presentation Slide Controls
    document.getElementById("btn-prev").addEventListener("click", () => {
        if (currentSlide > 0) {
            applySlide(currentSlide - 1);
        }
    });

    document.getElementById("btn-next").addEventListener("click", () => {
        if (currentSlide < slides.length - 1) {
            applySlide(currentSlide + 1);
        } else {
            setPresentationMode(false); // finish presentation
        }
    });

    document.getElementById("btn-exit").addEventListener("click", () => {
        setPresentationMode(false);
    });

    // Keyboard Shortcuts for Presentation
    document.addEventListener("keydown", (e) => {
        if (!presentationModeActive) return;
        
        if (e.key === "ArrowRight" || e.key === "Space") {
            e.preventDefault();
            if (currentSlide < slides.length - 1) {
                applySlide(currentSlide + 1);
            } else {
                setPresentationMode(false);
            }
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (currentSlide > 0) {
                applySlide(currentSlide - 1);
            }
        } else if (e.key === "Escape") {
            setPresentationMode(false);
        }
    });
});
