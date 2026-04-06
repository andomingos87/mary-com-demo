/**
 * Mary M&A - Development Plan Visualization
 * JavaScript for interactivity and progress calculation
 */

// Phase data with completion status
const phases = [
    {
        id: 0,
        name: "Iniciação, Arquitetura e Infraestrutura",
        status: "completed",
        tasks: { total: 8, completed: 8 },
        criteria: { total: 4, completed: 4 },
        gates: { total: 1, completed: 1 }
    },
    {
        id: 1,
        name: "Identidade, Autenticação e Segurança de Sessão",
        status: "completed",
        tasks: { total: 11, completed: 11 },
        criteria: { total: 5, completed: 5 },
        gates: { total: 2, completed: 2 }
    },
    {
        id: 2,
        name: "Organizações, Perfis e RBAC",
        status: "completed",
        tasks: { total: 6, completed: 6 },
        criteria: { total: 5, completed: 5 },
        gates: { total: 2, completed: 2 }
    },
    {
        id: 3,
        name: "Onboarding e Estrutura Base dos Perfis",
        status: "pending",
        tasks: { total: 10, completed: 0 },
        criteria: { total: 4, completed: 0 },
        gates: { total: 1, completed: 0 }
    },
    {
        id: 4,
        name: "Projetos do Ativo + Taxonomia + Readiness",
        status: "pending",
        tasks: { total: 7, completed: 0 },
        criteria: { total: 4, completed: 0 },
        gates: { total: 1, completed: 0 }
    },
    {
        id: 5,
        name: "VDR MVP (Links) + Controle de Acesso + Logs + Q&A",
        status: "pending",
        tasks: { total: 10, completed: 0 },
        criteria: { total: 6, completed: 0 },
        gates: { total: 1, completed: 0 }
    },
    {
        id: 6,
        name: "Tese do Investidor + Matching MVP",
        status: "pending",
        tasks: { total: 9, completed: 0 },
        criteria: { total: 4, completed: 0 },
        gates: { total: 1, completed: 0 }
    },
    {
        id: 7,
        name: "Pipeline do Deal/Projeto",
        status: "pending",
        tasks: { total: 7, completed: 0 },
        criteria: { total: 3, completed: 0 },
        gates: { total: 1, completed: 0 }
    },
    {
        id: 8,
        name: "Mary AI (Public/Private) + RAG + Geração de Documentos",
        status: "pending",
        tasks: { total: 11, completed: 0 },
        criteria: { total: 5, completed: 0 },
        gates: { total: 1, completed: 0 }
    },
    {
        id: 9,
        name: "Planos & Pagamentos (Stripe) + Limites + Go-Live/Beta",
        status: "pending",
        tasks: { total: 16, completed: 0 },
        criteria: { total: 5, completed: 0 },
        gates: { total: 1, completed: 0 }
    }
];

/**
 * Toggle phase card expansion
 * @param {HTMLElement} header - The phase header element
 */
function togglePhase(header) {
    const card = header.closest('.phase-card');
    card.classList.toggle('expanded');
}

/**
 * Calculate overall progress percentage
 * @returns {number} Progress percentage (0-100)
 */
function calculateOverallProgress() {
    let totalTasks = 0;
    let completedTasks = 0;
    
    phases.forEach(phase => {
        totalTasks += phase.tasks.total + phase.criteria.total + phase.gates.total;
        completedTasks += phase.tasks.completed + phase.criteria.completed + phase.gates.completed;
    });
    
    return Math.round((completedTasks / totalTasks) * 100);
}

/**
 * Count phases by status
 * @returns {Object} Object with completed, inProgress, and pending counts
 */
function countPhasesByStatus() {
    const counts = {
        completed: 0,
        inProgress: 0,
        pending: 0
    };
    
    phases.forEach(phase => {
        if (phase.status === 'completed') {
            counts.completed++;
        } else if (phase.status === 'in-progress') {
            counts.inProgress++;
        } else {
            counts.pending++;
        }
    });
    
    return counts;
}

/**
 * Update the progress display
 */
function updateProgressDisplay() {
    const progress = calculateOverallProgress();
    const counts = countPhasesByStatus();
    
    // Update progress percentage
    const progressPercent = document.getElementById('total-progress');
    const progressBar = document.getElementById('total-progress-bar');
    
    if (progressPercent) {
        progressPercent.textContent = progress + '%';
    }
    
    if (progressBar) {
        // Animate the progress bar
        setTimeout(() => {
            progressBar.style.width = progress + '%';
        }, 100);
    }
    
    // Update phase counts
    const completedPhases = document.getElementById('completed-phases');
    const inProgressPhases = document.getElementById('in-progress-phases');
    const pendingPhases = document.getElementById('pending-phases');
    
    if (completedPhases) completedPhases.textContent = counts.completed;
    if (inProgressPhases) inProgressPhases.textContent = counts.inProgress;
    if (pendingPhases) pendingPhases.textContent = counts.pending;
}

/**
 * Expand completed phases on load
 */
function expandCompletedPhases() {
    const completedCards = document.querySelectorAll('.phase-card.completed');
    // Optionally expand the first completed phase
    // completedCards.forEach(card => card.classList.add('expanded'));
}

/**
 * Add keyboard navigation
 */
function setupKeyboardNavigation() {
    document.querySelectorAll('.phase-header').forEach(header => {
        header.setAttribute('tabindex', '0');
        header.setAttribute('role', 'button');
        header.setAttribute('aria-expanded', 'false');
        
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                togglePhase(header);
                header.setAttribute('aria-expanded', 
                    header.closest('.phase-card').classList.contains('expanded'));
            }
        });
    });
}

/**
 * Initialize scroll-based animations
 */
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll('.phase-card').forEach(card => {
        observer.observe(card);
    });
}

/**
 * Format date to locale string
 * @param {Date} date 
 * @returns {string}
 */
function formatDate(date) {
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Initialize the application
 */
function init() {
    // Update progress display
    updateProgressDisplay();
    
    // Setup keyboard navigation
    setupKeyboardNavigation();
    
    // Optional: expand completed phases
    // expandCompletedPhases();
    
    // Setup scroll animations
    setupScrollAnimations();
    
    console.log('Mary M&A Development Plan Visualization initialized');
    console.log(`Overall Progress: ${calculateOverallProgress()}%`);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for potential external use
window.MaryDevPlan = {
    phases,
    calculateOverallProgress,
    countPhasesByStatus,
    togglePhase
};

