# Carefully designed demo story — not random data.
# The demo graph mirrors a real analysis of github.com/riishcodes/Myorbits:
# a Next.js + FastAPI career-intelligence app. The student is solid on the
# JavaScript/TypeScript frontend and Python backend, but has never shipped
# Node.js or SQL — so those gaps are visible in the graph and the roadmap.

DEMO_USER = {
    "name": "Aryan Sharma",
    "username": "demo-user",
    "target_role": "Full Stack Developer",
    "career_readiness": 67.9,
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
}

DEMO_REPOS = [
    {
        "name": "Myorbits",
        "languages": ["TypeScript", "Python", "CSS", "JavaScript"],
        "commits": 1,
        "stars": 0,
        "description": "Career-intelligence app that turns GitHub projects into a 3D skill graph, gap analysis and learning roadmap",
    },
]

DEMO_NOTION_PAGES = [
    {
        "title": "Full Stack Roadmap",
        "text": "Studying Node.js, SQL, Docker, system design and API design",
    },
    {
        "title": "System Design Notes",
        "text": "Load balancing, caching, database sharding, microservices",
    },
]

DEMO_CERTIFICATIONS = [
    {"name": "Meta Frontend Developer", "issued_by": "Coursera", "date": "2024-03"},
]

DEMO_NODES = [
    # The single real repository. It anchors the graph as a hub.
    {"id": "repo:Myorbits", "name": "Myorbits", "category": "repo", "maturity": 62, "market_demand": 60, "val": 6.2, "source": "github"},

    # Languages and frameworks found in the repo
    {"id": "typescript",     "name": "TypeScript",      "category": "frontend", "maturity": 82, "market_demand": 90, "val": 8.2, "source": "github"},
    {"id": "javascript",     "name": "JavaScript",      "category": "frontend", "maturity": 58, "market_demand": 93, "val": 5.8, "source": "github"},
    {"id": "python",         "name": "Python",          "category": "backend",  "maturity": 68, "market_demand": 95, "val": 6.8, "source": "github"},
    {"id": "css",            "name": "CSS",             "category": "frontend", "maturity": 64, "market_demand": 72, "val": 6.4, "source": "github"},
    {"id": "react",          "name": "React",           "category": "frontend", "maturity": 80, "market_demand": 95, "val": 8.0, "source": "github"},
    {"id": "nextjs",         "name": "Next.js",         "category": "frontend", "maturity": 76, "market_demand": 92, "val": 7.6, "source": "github"},
    {"id": "tailwind-css",   "name": "Tailwind CSS",    "category": "frontend", "maturity": 71, "market_demand": 88, "val": 7.1, "source": "github"},
    {"id": "framer-motion",  "name": "Framer Motion",   "category": "frontend", "maturity": 55, "market_demand": 68, "val": 5.5, "source": "github"},
    {"id": "zustand",        "name": "Zustand",         "category": "frontend", "maturity": 52, "market_demand": 72, "val": 5.2, "source": "github"},
    {"id": "recharts",       "name": "Recharts",        "category": "frontend", "maturity": 46, "market_demand": 52, "val": 4.6, "source": "github"},
    {"id": "threejs",        "name": "Three.js",        "category": "frontend", "maturity": 48, "market_demand": 60, "val": 4.8, "source": "github"},
    {"id": "axios",          "name": "Axios",           "category": "frontend", "maturity": 45, "market_demand": 60, "val": 4.5, "source": "github"},
    {"id": "fastapi",        "name": "FastAPI",         "category": "backend",  "maturity": 72, "market_demand": 85, "val": 7.2, "source": "github"},
    {"id": "rest-api",       "name": "REST API",        "category": "backend",  "maturity": 66, "market_demand": 85, "val": 6.6, "source": "github"},
    {"id": "neo4j",          "name": "Neo4j",           "category": "database", "maturity": 50, "market_demand": 55, "val": 5.0, "source": "github"},
    {"id": "github",         "name": "GitHub",          "category": "devops",   "maturity": 74, "market_demand": 85, "val": 7.4, "source": "github"},
    {"id": "git",            "name": "Git",             "category": "devops",   "maturity": 72, "market_demand": 90, "val": 7.2, "source": "github"},
    {"id": "linux",          "name": "Linux",           "category": "devops",   "maturity": 45, "market_demand": 85, "val": 4.5, "source": "github"},

    # Concepts explained in the repo's README
    {"id": "ai",                        "name": "AI",                        "category": "concept", "maturity": 40, "market_demand": 60, "val": 4.0, "source": "github"},
    {"id": "3d-knowledge-graph",        "name": "3D Knowledge Graph",        "category": "concept", "maturity": 58, "market_demand": 60, "val": 5.8, "source": "github"},
    {"id": "interactive-visualization", "name": "Interactive Visualization",  "category": "concept", "maturity": 60, "market_demand": 60, "val": 6.0, "source": "github"},
    {"id": "skill-gap-analysis",        "name": "Skill Gap Analysis",        "category": "concept", "maturity": 44, "market_demand": 60, "val": 4.4, "source": "github"},
    {"id": "career-readiness-score",    "name": "Career Readiness Score",    "category": "concept", "maturity": 42, "market_demand": 60, "val": 4.2, "source": "github"},
]

DEMO_LINKS = [
    # Repo → technology (one link per skill, no duplicates)
    {"source": "repo:Myorbits", "target": "typescript",     "type": "WRITTEN_IN", "strength": 0.95},
    {"source": "repo:Myorbits", "target": "javascript",     "type": "WRITTEN_IN", "strength": 0.85},
    {"source": "repo:Myorbits", "target": "python",         "type": "WRITTEN_IN", "strength": 0.90},
    {"source": "repo:Myorbits", "target": "css",            "type": "WRITTEN_IN", "strength": 0.85},
    {"source": "repo:Myorbits", "target": "react",          "type": "DEPENDS_ON", "strength": 0.90},
    {"source": "repo:Myorbits", "target": "nextjs",         "type": "DEPENDS_ON", "strength": 0.90},
    {"source": "repo:Myorbits", "target": "tailwind-css",   "type": "DEPENDS_ON", "strength": 0.90},
    {"source": "repo:Myorbits", "target": "framer-motion",  "type": "DEPENDS_ON", "strength": 0.85},
    {"source": "repo:Myorbits", "target": "zustand",        "type": "DEPENDS_ON", "strength": 0.85},
    {"source": "repo:Myorbits", "target": "recharts",       "type": "DEPENDS_ON", "strength": 0.85},
    {"source": "repo:Myorbits", "target": "threejs",        "type": "DEPENDS_ON", "strength": 0.85},
    {"source": "repo:Myorbits", "target": "axios",          "type": "DEPENDS_ON", "strength": 0.85},
    {"source": "repo:Myorbits", "target": "fastapi",        "type": "DEPENDS_ON", "strength": 0.90},
    {"source": "repo:Myorbits", "target": "rest-api",       "type": "DEPENDS_ON", "strength": 0.85},
    {"source": "repo:Myorbits", "target": "neo4j",          "type": "USES", "strength": 0.70},
    {"source": "repo:Myorbits", "target": "github",         "type": "USES", "strength": 0.70},
    {"source": "repo:Myorbits", "target": "git",            "type": "USES", "strength": 0.70},
    {"source": "repo:Myorbits", "target": "linux",          "type": "USES", "strength": 0.70},
    {"source": "repo:Myorbits", "target": "ai",             "type": "USES", "strength": 0.65},
    {"source": "repo:Myorbits", "target": "3d-knowledge-graph",        "type": "USES", "strength": 0.70},
    {"source": "repo:Myorbits", "target": "interactive-visualization", "type": "USES", "strength": 0.70},
    {"source": "repo:Myorbits", "target": "skill-gap-analysis",        "type": "USES", "strength": 0.70},
    {"source": "repo:Myorbits", "target": "career-readiness-score",    "type": "USES", "strength": 0.70},

    # Skill ↔ skill relations so the graph has a shape, not just spokes
    {"source": "react",          "target": "javascript",     "type": "RELATED_TO", "strength": 0.90},
    {"source": "react",          "target": "css",            "type": "RELATED_TO", "strength": 0.80},
    {"source": "react",          "target": "typescript",     "type": "RELATED_TO", "strength": 0.85},
    {"source": "react",          "target": "nextjs",         "type": "RELATED_TO", "strength": 0.90},
    {"source": "react",          "target": "tailwind-css",   "type": "RELATED_TO", "strength": 0.80},
    {"source": "react",          "target": "framer-motion",  "type": "RELATED_TO", "strength": 0.75},
    {"source": "react",          "target": "zustand",        "type": "RELATED_TO", "strength": 0.80},
    {"source": "react",          "target": "threejs",        "type": "RELATED_TO", "strength": 0.70},
    {"source": "react",          "target": "recharts",       "type": "RELATED_TO", "strength": 0.70},
    {"source": "nextjs",         "target": "typescript",     "type": "RELATED_TO", "strength": 0.85},
    {"source": "nextjs",         "target": "javascript",     "type": "RELATED_TO", "strength": 0.80},
    {"source": "typescript",     "target": "javascript",     "type": "RELATED_TO", "strength": 0.90},
    {"source": "tailwind-css",   "target": "css",            "type": "RELATED_TO", "strength": 0.90},
    {"source": "fastapi",        "target": "python",         "type": "RELATED_TO", "strength": 0.90},
    {"source": "fastapi",        "target": "rest-api",       "type": "RELATED_TO", "strength": 0.85},
    {"source": "rest-api",       "target": "python",         "type": "RELATED_TO", "strength": 0.70},
    {"source": "axios",          "target": "rest-api",       "type": "RELATED_TO", "strength": 0.85},
    {"source": "neo4j",          "target": "python",         "type": "RELATED_TO", "strength": 0.60},
    {"source": "github",         "target": "git",            "type": "RELATED_TO", "strength": 0.90},
    {"source": "github",         "target": "linux",          "type": "RELATED_TO", "strength": 0.60},
    {"source": "ai",             "target": "python",         "type": "RELATED_TO", "strength": 0.60},
    {"source": "skill-gap-analysis",        "target": "ai",                          "type": "RELATED_TO", "strength": 0.70},
    {"source": "career-readiness-score",    "target": "skill-gap-analysis",          "type": "RELATED_TO", "strength": 0.80},
    {"source": "3d-knowledge-graph",        "target": "threejs",                     "type": "RELATED_TO", "strength": 0.80},
    {"source": "3d-knowledge-graph",        "target": "interactive-visualization",   "type": "RELATED_TO", "strength": 0.75},
    {"source": "interactive-visualization", "target": "threejs",                     "type": "RELATED_TO", "strength": 0.70},
    {"source": "recharts",       "target": "javascript",     "type": "RELATED_TO", "strength": 0.60},
]

DEMO_GAPS = [
    {"skill": "SQL",     "priority": 0.90, "reason": "Full-stack roles expect you to query a relational database; Myorbits currently only stores graph data."},
    {"skill": "Node.js", "priority": 0.82, "reason": "Most full-stack teams pair React with Node.js on the server — your backend is Python, so this is the missing half of the JavaScript stack."},
]

# Career role definitions for gap analysis
CAREER_ROLES = {
    "ML Engineer": {
        "required": ["Python", "PyTorch", "TensorFlow", "scikit-learn", "Docker", "SQL", "NumPy", "Git"],
        "nice_to_have": ["Kubernetes", "AWS", "MLOps", "Spark", "Pandas"],
    },
    "Frontend Developer": {
        "required": ["JavaScript", "React", "CSS", "HTML", "TypeScript", "Git"],
        "nice_to_have": ["Next.js", "Vue", "Tailwind", "Testing"],
    },
    "Backend Developer": {
        "required": ["Python", "Node.js", "SQL", "Docker", "Git", "REST API"],
        "nice_to_have": ["Kubernetes", "Redis", "GraphQL", "Microservices"],
    },
    "Full Stack Developer": {
        "required": ["JavaScript", "React", "Node.js", "Python", "SQL", "Git", "CSS"],
        "nice_to_have": ["TypeScript", "Docker", "AWS", "MongoDB"],
    },
    "Data Scientist": {
        "required": ["Python", "NumPy", "Pandas", "scikit-learn", "SQL", "Statistics"],
        "nice_to_have": ["TensorFlow", "PyTorch", "Tableau", "Spark"],
    },
}
