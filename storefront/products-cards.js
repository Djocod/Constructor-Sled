(async () => {
  const root = document.getElementById("products-root");
  if (!root) return;

  const apiUrl = root.dataset.apiUrl;

  // Afficher un loader
  root.innerHTML = `<p style="text-align:center">Chargement...</p>`;

  try {
    const res = await fetch(apiUrl);
    const products = await res.json();

    root.innerHTML = `
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 20px;
        padding: 20px 0;
      ">
        ${products
          .map(
            (product) => `
          <div style="
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            background: #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          ">
            <span style="
              font-size: 11px;
              background: #f4f4f4;
              padding: 3px 8px;
              border-radius: 4px;
              color: #666;
            ">${product.category}</span>

            <h3 style="margin: 12px 0 4px; font-size: 16px;">${product.nameEn}</h3>
            <p style="margin: 0 0 8px; color: #888; font-size: 14px;">${product.nameDe}</p>

            <p style="font-size: 20px; font-weight: bold; margin: 8px 0;">
              ${product.priceEur.toFixed(2)} €
            </p>

            ${
              product.colors.length > 0
                ? `
              <div style="display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0;">
                ${product.colors
                  .map(
                    (c) => `
                  <span style="
                    font-size: 12px;
                    background: #e8f4fd;
                    color: #0066cc;
                    padding: 2px 8px;
                    border-radius: 12px;
                  ">${c.color}</span>
                `,
                  )
                  .join("")}
              </div>
            `
                : ""
            }

            ${
              product.notes
                ? `
              <p style="font-size: 13px; color: #999; margin: 8px 0 0;">${product.notes}</p>
            `
                : ""
            }

            <div style="margin-top: 12px; display: flex; gap: 10px;">
              <a href="${product.urlEn}" target="_blank"
                style="font-size: 13px; color: #0066cc;">🔗 EN</a>
              <a href="${product.urlDe}" target="_blank"
                style="font-size: 13px; color: #0066cc;">🔗 DE</a>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  } catch (err) {
    root.innerHTML = `<p style="color:red">Erreur lors du chargement des produits.</p>`;
    console.error(err);
  }
})();
