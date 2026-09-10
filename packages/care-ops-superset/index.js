import { embedDashboard as embedSupersetDashboard } from '@superset-ui/embedded-sdk';

const DASHBOARD_UI_CONFIG = {
  hideTitle: true,
  filters: { expanded: false },
};

function embedDashboard({
  id,
  domain,
  container,
  fetchGuestToken,
  dashboardUiConfig = DASHBOARD_UI_CONFIG,
}) {
  const embedding = embedSupersetDashboard({
    id,
    supersetDomain: domain,
    mountPoint: container,
    fetchGuestToken,
    dashboardUiConfig,
  });

  return {
    // Unmounting clears the iframe and cancels the SDK's guest token refresh.
    destroy() {
      embedding.then(embed => embed.unmount(), () => {});
    },
  };
}

export { embedDashboard };
