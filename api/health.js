// Endpoint de diagnóstico: existe só pra confirmar se as serverless functions da Vercel estão
// mesmo sendo deployadas neste projeto. Se GET /api/health devolver JSON, as funções funcionam
// (e o OG por perfil em /api/perfil/[username].js também deve funcionar). Se devolver 404 ou o
// HTML do SPA, o problema é a configuração do projeto na Vercel, não o código.
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(JSON.stringify({ ok: true, runtime: process.version }));
};
