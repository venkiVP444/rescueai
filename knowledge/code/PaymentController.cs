using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace AcmeCommerce.PaymentService.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost("charge")]
        public async Task<IActionResult> Charge([FromBody] PaymentRequest request)
        {
            try
            {
                var result = await _paymentService.ProcessPaymentAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(503, new { error = "Service Unavailable", detail = ex.Message });
            }
        }
    }
}
