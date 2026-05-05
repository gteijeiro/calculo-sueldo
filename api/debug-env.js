export default function handler(req, res) {
  res.json({
    GITHUB_TOKEN_exists: !!process.env.GITHUB_TOKEN,
    GITHUB_TOKEN_length: process.env.GITHUB_TOKEN?.length ?? 0,
    NODE_ENV: process.env.NODE_ENV,
  });
}
