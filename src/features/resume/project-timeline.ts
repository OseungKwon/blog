class ResumeProjectTimeline extends HTMLElement {
  private projectOpenStates: boolean[] = [];
  private abortController?: AbortController;

  connectedCallback() {
    this.abortController?.abort();
    this.abortController = new AbortController();

    const { signal } = this.abortController;
    const projectEntries = Array.from(
      this.querySelectorAll<HTMLDetailsElement>('.project-entry'),
    );
    const expandAll = this.querySelector<HTMLButtonElement>(
      '[data-project-expand-all]',
    );
    const expandLabel = this.querySelector<HTMLElement>(
      '[data-project-expand-label]',
    );

    const syncExpandAll = () => {
      const allOpen =
        projectEntries.length > 0 &&
        projectEntries.every((project) => project.open);

      expandAll?.setAttribute('aria-expanded', String(allOpen));
      if (expandLabel) {
        expandLabel.textContent = allOpen ? '전체 접기' : '전체 펼치기';
      }
    };

    const openLinkedProject = () => {
      const projectId = window.location.hash.slice(1);
      if (!projectId) return;

      const linkedProject = document.getElementById(projectId);
      if (
        linkedProject instanceof HTMLDetailsElement &&
        this.contains(linkedProject)
      ) {
        linkedProject.open = true;
      }
    };

    expandAll?.addEventListener(
      'click',
      () => {
        const shouldOpen = !projectEntries.every((project) => project.open);
        projectEntries.forEach((project) => {
          project.open = shouldOpen;
        });
        syncExpandAll();
      },
      { signal },
    );

    projectEntries.forEach((project) => {
      project.addEventListener('toggle', syncExpandAll, { signal });
    });

    this.querySelectorAll<HTMLAnchorElement>('.project-proof-link').forEach(
      (link) => {
        link.addEventListener('click', (event) => event.stopPropagation(), {
          signal,
        });
      },
    );

    window.addEventListener('hashchange', openLinkedProject, { signal });
    window.addEventListener(
      'beforeprint',
      () => {
        this.projectOpenStates = projectEntries.map((project) => project.open);
        projectEntries.forEach((project) => {
          project.open = true;
        });
      },
      { signal },
    );
    window.addEventListener(
      'afterprint',
      () => {
        projectEntries.forEach((project, index) => {
          project.open = this.projectOpenStates[index] ?? false;
        });
      },
      { signal },
    );

    openLinkedProject();
    syncExpandAll();
  }

  disconnectedCallback() {
    this.abortController?.abort();
  }
}

if (!customElements.get('resume-project-timeline')) {
  customElements.define('resume-project-timeline', ResumeProjectTimeline);
}
