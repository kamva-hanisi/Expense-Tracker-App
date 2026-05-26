const jwtSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET;

if (!jwtSecret) {
  throw new Error("Missing JWT_SECRET environment variable");
}

module.exports = {
  jwtSecret,
};
