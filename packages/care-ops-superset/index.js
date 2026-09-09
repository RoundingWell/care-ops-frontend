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
  let isDestroyed = false;

  // The SDK owns the guest token refresh loop and offers no way to cancel it.
  // Withholding the token parks that loop instead of leaving a destroyed embed
  // refreshing tokens for the rest of the session.
  function getGuestToken() {
    if (isDestroyed) return new Promise(() => {});

    return fetchGuestToken();
  }

  const embedding = embedSupersetDashboard({
    id,
    supersetDomain: domain,
    mountPoint: container,
    fetchGuestToken: getGuestToken,
    dashboardUiConfig,
  });

  return {
    destroy() {
      isDestroyed = true;

      embedding.then(embed => embed.unmount(), () => {});
    },
  };
}

export { embedDashboard };
