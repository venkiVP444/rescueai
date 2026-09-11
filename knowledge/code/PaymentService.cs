using System.Threading.Tasks;

namespace AcmeCommerce.PaymentService
{
    public interface IPaymentService
    {
        Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request);
    }

    public class PaymentService : IPaymentService
    {
        private readonly IApiClient _apiClient;

        public PaymentService(IApiClient apiClient)
        {
            _apiClient = apiClient;
        }

        public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request)
        {
            return await _apiClient.AuthorizePaymentAsync(request);
        }
    }

    public record PaymentRequest(string CustomerId, decimal Amount, string Currency);
    public record PaymentResult(string TransactionId, bool Success, string Message);
}
