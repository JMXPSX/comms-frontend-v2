export interface WebhookResponse {
  status: string;
  message: string;
  data: {
    action: string;
    ticket_number: string;
    zendesk_update?: {
      success: boolean;
      ticket_id: string;
      action: string;
      message: string;
    };
  };
}

export interface WebhookHandlerOptions {
  onSuccess: (response: WebhookResponse) => void;
  onError: (error: string) => void;
  onComplete?: () => void;
}

export class WebhookHandler {
  // private baseUrl = 'https://746fcd3c5d83.ngrok-free.app/api/shopify/webhook';
  private baseUrl = process.env.REACT_APP_PUBLIC_API_URL;

  async handleAction(action: string, ticketNumber: string, options: WebhookHandlerOptions): Promise<void> {
    try {
      const url = `${this.baseUrl}?action=${action}&ticket_number=${ticketNumber}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WebhookResponse = await response.json();

      if (data.status === 'success') {
        options.onSuccess(data);
      } else {
        options.onError(data.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Webhook handler error:', error);
      options.onError(error instanceof Error ? error.message : 'Failed to process request');
    } finally {
      if (options.onComplete) {
        options.onComplete();
      }
    }
  }

  getSuccessMessage(action: string): string {
    switch (action) {
      case 'receive_share':
        return '✓ Your choice has been recorded successfully! We\'ve received your selection to receive your share of the appraisal.';
      case 'recycle':
        return '✓ Your choice has been recorded successfully! We\'ve received your selection to proceed with recycling.';
      case 'return_jewelry':
        return '✓ Your choice has been recorded successfully! We\'ve received your selection to have your jewelry returned.';
      default:
        return '✓ Your choice has been recorded successfully!';
    }
  }
}

export const webhookHandler = new WebhookHandler();