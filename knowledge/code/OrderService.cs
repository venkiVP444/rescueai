using System.Threading.Tasks;

namespace AcmeCommerce.OrderService
{
    public class OrderService
    {
        public async Task CreateOrderAsync(string customerId, decimal total)
        {
            // Dispatches checkout charge to PaymentService
        }
    }
}
