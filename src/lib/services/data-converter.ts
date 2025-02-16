import {
  setLastDataConverterFailure,
  setLastDataConverterSuccess,
} from '$lib/stores/data-converter-config';
import type { Payload } from '$types';
import type WebSocketAsPromised from 'websocket-as-promised';

interface WebSocketResponse {
  content: string;
  requestId: string;
}

export async function convertPayload(
  payload: Payload,
  websocket: WebSocketAsPromised,
): Promise<string | Payload> {
  if (!websocket.isOpened) {
    try {
      await websocket.open();
    } catch (_e) {
      setLastDataConverterFailure();
    }
  }

  if (!websocket.isOpened) {
    return Promise.resolve(payload);
  }

  const socketResponse: Promise<string> = websocket
    .sendRequest({
      payload: JSON.stringify(payload),
    })
    .then((response: WebSocketResponse) => {
      setLastDataConverterSuccess();

      try {
        const decodedResponse = JSON.parse(response.content);
        return decodedResponse;
      } catch {
        // This doesn't seem to be a failure the worker _could_ send back a text response
        // instead of JSON
        return response.content;
      }
    })
    .catch(() => {
      setLastDataConverterFailure();
    });

  return socketResponse;
}
