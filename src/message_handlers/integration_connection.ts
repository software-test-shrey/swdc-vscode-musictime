

import { commands, window } from "vscode";
import { getItem, setAuthCallbackState } from '../managers/FileManager';
import { updateSlackIntegrations, updateSpotifyIntegration } from '../managers/IntegrationManager';
import { getSlackAuth } from "../managers/SlackManager";
import { getUser, processNewSpotifyIntegration } from '../managers/UserStatusManager';
import { initializeWebsockets } from '../websockets';

export async function handleIntegrationConnectionSocketEvent(body: any) {
  // integration_type_id = 14 (slack), 12 (spotify)
  // action = add, update, remove
  const { integration_type_id, integration_type, action } = body;

  const user = await getUser(getItem("jwt"));

  if (integration_type_id === 14) {
    await getSlackAuth();

    if (action === "add") {
	  // clear the auth callback state
	  setAuthCallbackState(null);
	  window.showInformationMessage("Successfully connected to Slack");

	  // refresh the tree view
	  setTimeout(() => {
		// refresh the playlist to show the device button update
		commands.executeCommand("musictime.refreshPlaylist");
	  }, 1000);
	}

	await updateSlackIntegrations(user);

  } else if (integration_type_id === 12) {
	  // clear the auth callback state
	  setAuthCallbackState(null);

	  // update the spotify integrations before populating the spotify user
	  await updateSpotifyIntegration(user);

	  processNewSpotifyIntegration();
  }
}
