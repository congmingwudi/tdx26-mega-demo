/**
 * Data Cloud Web SDK Sitemap — TDX '26 Mega Demo
 *
 * Upload this file to your Data Cloud Website Connector's Sitemap section.
 * It defines the page types and interaction patterns for the presentation app.
 *
 * Since this is a single-page app with a Shadow DOM slide engine,
 * most events are sent programmatically via sendEvent() from the React code.
 * The sitemap handles page-level matching and global listeners.
 */

const sitemapConfig = {
  global: {
    onActionEvent: (event) => {
      // Attach presentation context to every event
      const deckStage = document.querySelector('deck-stage');
      if (deckStage) {
        event.interaction = event.interaction || {};
        event.interaction.attributes = event.interaction.attributes || {};
        event.interaction.attributes.slideIndex = deckStage.index;
        event.interaction.attributes.slideTotal = deckStage.length;
        event.interaction.attributes.presentationTitle = 'TDX 26 System of Context Mega Demo';
      }
      return event;
    },
    listeners: []
  },
  pageTypes: [
    {
      name: "Presentation",
      isMatch: () => {
        return window.location.pathname === '/' || window.location.pathname === '/index.html';
      },
      interaction: {
        name: "View Presentation",
      },
      listeners: []
    }
  ],
  pageTypeDefault: {
    name: "Other",
    listeners: []
  }
};

SalesforceInteractions.initSitemap(sitemapConfig);
