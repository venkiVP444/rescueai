using System;
using System.Threading.Tasks;

namespace AcmeCommerce.PaymentService.Infrastructure
{
    public class RedisClient
    {
        private readonly int _maxPoolSize;
        private int _currentConnections;

        public RedisClient(int maxPoolSize)
        {
            _maxPoolSize = maxPoolSize;
        }

        public async Task<IDisposable> AcquireLockAsync(string key)
        {
            if (_currentConnections >= _maxPoolSize)
            {
                throw new TimeoutException($"Timeout awaiting connection from Redis pool (MaxPoolSize: {_maxPoolSize} reached)");
            }

            _currentConnections++;
            return new PoolRelease(() => _currentConnections--);
        }

        private class PoolRelease : IDisposable
        {
            private readonly Action _onDispose;
            public PoolRelease(Action onDispose) => _onDispose = onDispose;
            public void Dispose() => _onDispose?.Invoke();
        }
    }
}
