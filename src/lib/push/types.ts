export type PushSubscriptionJSON = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export type PushPayload = {
  title: string;
  body: string;
  /** Path to open (or focus) when the notification is clicked. */
  url: string;
};
