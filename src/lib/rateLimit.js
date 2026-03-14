/**
 * Rate Limiting Middleware
 * Implementación en memoria (temporal para testing)
 * 
 * Uso en endpoints:
 *   const limited = rateLimit(handler, { max: 100, window: 900000 });
 *   export default limited;
 */

const requests = new Map();

/**
 * Middleware de rate limiting
 * @param {Function} handler - Function del endpoint
 * @param {Object} options - Configuración
 * @param {number} options.max - Máximo requests (default: 100)
 * @param {number} options.window - Ventana tiempo en ms (default: 15 min)
 * @param {string} options.key - Campo para identificar usuario (default: 'ip')
 */
export function rateLimit(handler, options = {}) {
  const { max = 100, window = 15 * 60 * 1000, key = 'ip' } = options;

  return async (req, res) => {
    try {
      // Obtener identificador (IP o user ID)
      let identifier;
      
      if (key === 'ip') {
        identifier = req.headers['x-forwarded-for'] || 
                    req.headers['x-real-ip'] || 
                    req.socket.remoteAddress || 
                    'unknown';
      } else if (key === 'user') {
        // Para rutas autenticadas
        const authHeader = req.headers.authorization;
        try {
          const token = authHeader?.substring(7);
          const decoded = JSON.parse(
            Buffer.from(token?.split('.')[1] || '', 'base64').toString()
          );
          identifier = decoded.sub || 'unknown';
        } catch {
          identifier = 'unknown';
        }
      } else {
        identifier = key;
      }

      const now = Date.now();
      const endpoint = `${req.method} ${req.url}`;
      const rateLimitKey = `${identifier}:${endpoint}`;

      // Limpiar requests antiguos
      if (!requests.has(rateLimitKey)) {
        requests.set(rateLimitKey, []);
      }

      const timestamps = requests.get(rateLimitKey);
      const recentRequests = timestamps.filter(t => now - t < window);
      requests.set(rateLimitKey, recentRequests);

      // Verificar límite
      if (recentRequests.length >= max) {
        console.warn(`[RATELIMIT] Límite excedido para ${rateLimitKey}`);
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', new Date(now + window).toISOString());
        return res.status(429).json({ 
          error: 'Too many requests. Try again later.',
          retryAfter: Math.ceil(window / 1000)
        });
      }

      // Agregar request actual
      recentRequests.push(now);
      requests.set(rateLimitKey, recentRequests);

      // Headers informativos
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - recentRequests.length);
      res.setHeader('X-RateLimit-Reset', new Date(now + window).toISOString());

      // Ejecutar handler
      return handler(req, res);
    } catch (err) {
      console.error('[RATELIMIT] Error:', err.message);
      return handler(req, res); // Permitir request si hay error
    }
  };
}

/**
 * Limpiar memoria (para testing)
 */
export function clearRateLimitCache() {
  requests.clear();
}

/**
 * Obtener stats (para debugging)
 */
export function getRateLimitStats() {
  const stats = {};
  requests.forEach((value, key) => {
    stats[key] = value.length;
  });
  return stats;
}
