import axios, { AxiosInstance } from 'axios';

const CJ_API_BASE_URL = 'https://developers.cjdropshipping.com/api2.0/v1';

interface CJTokenResponse {
  code: number;
  result: boolean;
  message: string;
  data: {
    openId: number;
    accessToken: string;
    accessTokenExpiryDate: string;
    refreshToken: string;
    refreshTokenExpiryDate: string;
    createDate: string;
  } | null;
  requestId: string;
}

interface CJApiResponse<T> {
  code: number;
  result: boolean;
  message: string;
  data: T;
  requestId: string;
}

class CJDropshippingClient {
  private apiKey: string;
  private accessToken: string | null = null;
  private accessTokenExpiry: Date | null = null;
  private refreshToken: string | null = null;
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: CJ_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get access token using the API key
   */
  async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.accessTokenExpiry && new Date() < this.accessTokenExpiry) {
      return this.accessToken;
    }

    // Try to refresh if we have a refresh token
    if (this.refreshToken) {
      try {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) return this.accessToken!;
      } catch (error) {
        console.log('[CJ] Refresh token failed, getting new token');
      }
    }

    // Get new token
    const response = await this.client.post<CJTokenResponse>('/authentication/getAccessToken', {
      apiKey: this.apiKey,
    });

    if (response.data.code === 200 && response.data.data) {
      this.accessToken = response.data.data.accessToken;
      this.accessTokenExpiry = new Date(response.data.data.accessTokenExpiryDate);
      this.refreshToken = response.data.data.refreshToken;
      return this.accessToken;
    }

    throw new Error(`Failed to get CJ access token: ${response.data.message}`);
  }

  /**
   * Refresh the access token
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    const response = await this.client.post<CJTokenResponse>('/authentication/refreshAccessToken', {
      refreshToken: this.refreshToken,
    });

    if (response.data.code === 200 && response.data.data) {
      this.accessToken = response.data.data.accessToken;
      this.accessTokenExpiry = new Date(response.data.data.accessTokenExpiryDate);
      this.refreshToken = response.data.data.refreshToken;
      return true;
    }

    return false;
  }

  /**
   * Make an authenticated API request
   */
  private async request<T>(method: 'GET' | 'POST', endpoint: string, data?: any): Promise<CJApiResponse<T>> {
    const token = await this.getAccessToken();
    
    const response = await this.client.request<CJApiResponse<T>>({
      method,
      url: endpoint,
      data,
      headers: {
        'CJ-Access-Token': token,
      },
    });

    return response.data;
  }

  /**
   * Search for products
   */
  async searchProducts(params: {
    productNameEn?: string;
    categoryId?: string;
    pageNum?: number;
    pageSize?: number;
  }): Promise<CJApiResponse<any>> {
    return this.request('POST', '/product/list', params);
  }

  /**
   * Get product details by ID
   */
  async getProduct(pid: string): Promise<CJApiResponse<any>> {
    return this.request('GET', `/product/query?pid=${pid}`);
  }

  /**
   * Get product variants
   */
  async getProductVariants(pid: string): Promise<CJApiResponse<any>> {
    return this.request('GET', `/product/variant/query?pid=${pid}`);
  }

  /**
   * Create an order
   */
  async createOrder(orderData: {
    orderNumber: string;
    shippingZip: string;
    shippingCountryCode: string;
    shippingCountry: string;
    shippingProvince: string;
    shippingCity: string;
    shippingAddress: string;
    shippingCustomerName: string;
    shippingPhone: string;
    remark?: string;
    fromCountryCode?: string;
    logisticName?: string;
    products: Array<{
      vid: string;
      quantity: number;
    }>;
  }): Promise<CJApiResponse<any>> {
    return this.request('POST', '/shopping/order/createOrder', orderData);
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string): Promise<CJApiResponse<any>> {
    return this.request('GET', `/shopping/order/getOrderDetail?orderId=${orderId}`);
  }

  /**
   * List orders
   */
  async listOrders(params: {
    pageNum?: number;
    pageSize?: number;
    orderStatus?: string;
  }): Promise<CJApiResponse<any>> {
    return this.request('POST', '/shopping/order/list', params);
  }

  /**
   * Confirm an order (pay and ship)
   */
  async confirmOrder(orderId: string): Promise<CJApiResponse<any>> {
    return this.request('POST', '/shopping/order/confirmOrder', { orderId });
  }

  /**
   * Get shipping information for an order
   */
  async getOrderShipping(orderId: string): Promise<CJApiResponse<any>> {
    return this.request('GET', `/logistic/getTrackInfo?orderId=${orderId}`);
  }

  /**
   * Validate API connection (lightweight check)
   */
  async validateConnection(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
let cjClient: CJDropshippingClient | null = null;

export function getCJClient(): CJDropshippingClient {
  if (!cjClient) {
    const apiKey = process.env.CJ_API_KEY;
    if (!apiKey) {
      throw new Error('CJ_API_KEY environment variable is not set');
    }
    cjClient = new CJDropshippingClient(apiKey);
  }
  return cjClient;
}

export { CJDropshippingClient, CJApiResponse };
