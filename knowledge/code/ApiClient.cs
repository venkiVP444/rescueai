using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace AcmeCommerce.PaymentService.Infrastructure
{
    public interface IApiClient
    {
        Task<PaymentResult> AuthorizePaymentAsync(PaymentRequest request);
    }

    public class ApiClient : IApiClient
    {
        private readonly HttpClient _httpClient;

        public ApiClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<PaymentResult> AuthorizePaymentAsync(PaymentRequest request)
        {
            // CRITICAL: ApiClient sends customer_id to Acme Payments API
            // External API v4.2 requires customerId
            var payload = new
            {
                customer_id = request.CustomerId,
                amount = request.Amount,
                currency = request.Currency
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("/v1/charges", content);

            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException($"Acme Payments rejected request: {response.StatusCode}");
            }

            return new PaymentResult("tx_" + Guid.NewGuid().ToString("N").Substring(0, 12), true, "Approved");
        }
    }
}
