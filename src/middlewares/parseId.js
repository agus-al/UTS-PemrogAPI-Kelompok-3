const MAX_INT = 2147483647;

function parseId(req, res, next) {
  const raw = req.params.id;

  if (!/^\d+$/.test(raw)) {
    return res.status(400).json({
      status: 'error',
      message: 'ID harus bilangan bulat positif',
    });
  }

  const id = Number(raw);
  if (id <= 0 || id > MAX_INT) {
    return res.status(400).json({
      status: 'error',
      message: 'ID harus bilangan bulat positif',
    });
  }

  req.id = id;
  next();
}

module.exports = parseId;
