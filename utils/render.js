const renderWithLayout = (res, template, data = {}) => {
  return new Promise((resolve, reject) => {
    res.render(template, data, (err, html) => {
      if (err) {
        reject(err);
      } else {
        res.render('layouts/main', {
          ...data,
          body: html
        }, (layoutErr, layoutHtml) => {
          if (layoutErr) {
            reject(layoutErr);
          } else {
            resolve(layoutHtml);
          }
        });
      }
    });
  });
};

module.exports = { renderWithLayout };
