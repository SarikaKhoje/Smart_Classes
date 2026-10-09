const createRateLimiter = ({ windowMs, max, message }) => {
  const requestsByAddress = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    let entry = requestsByAddress.get(key);
    if (!entry || now - entry.startedAt >= windowMs) {
      entry = { startedAt: now, count: 0 };
      requestsByAddress.set(key, entry);
    }

    if (requestsByAddress.size > 5000) {
      for (const [address, state] of requestsByAddress) {
        if (now - state.startedAt >= windowMs) requestsByAddress.delete(address);
        if (requestsByAddress.size <= 5000) break;
      }
      while (requestsByAddress.size > 5000) {
        requestsByAddress.delete(requestsByAddress.keys().next().value);
      }
    }

    entry.count += 1;
    if (entry.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((entry.startedAt + windowMs - now) / 1000));
      res.set('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({ success: false, message });
    }
    next();
  };
};

export default createRateLimiter;
