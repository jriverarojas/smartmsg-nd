/**
 * Represents the response from sending a message to the AI.
 */
export type AutomaticCreateMessageResponse = {
  /**
   * The unique identifier for the run. If no run is needed in your app  it can be undefined
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  runId?: string;

  /**
   * The unique identifier for the thread. If thre is no thread you can add the messageId
   * @example "987e6543-e21b-12d3-a456-426614174001"
   */
  threadId: string;

  /**
   * The response message from AI.
   */
  response: string;
};
